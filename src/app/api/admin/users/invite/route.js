import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { sendInviteEmail } from '@/lib/email/send';
import { emailSchema } from '@/lib/validation/schemas';
import { getAppUrl } from '@/lib/appUrl';

async function inviteOne({ admin, email, invitedBy }) {
  const appUrl = getAppUrl();

  // Ensure we have an allowed_users row (pending) before generating the link.
  const { data: existing } = await admin
    .from('allowed_users')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  if (existing && existing.status === 'active') {
    return { email, skipped: true, reason: 'already-active' };
  }

  // Route through /auth/callback so the code is exchanged server-side and the
  // session cookie is set before the user ever reaches /activate (matches the
  // marketing register flow at src/app/(marketing)/api/register/route.js).
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: `${appUrl}/auth/callback?next=/activate` },
  });
  if (error || !data?.properties?.action_link) {
    return { email, error: error?.message || 'generateLink failed' };
  }

  const userId = data.user?.id;
  if (userId) {
    // If an old allowed_users row exists for this email under a stale id
    // (deleted/re-created auth user), delete it first — otherwise the upsert
    // below fails the `email UNIQUE` constraint silently.
    if (existing && existing.id !== userId) {
      const { error: delErr } = await admin
        .from('allowed_users')
        .delete()
        .eq('email', email);
      if (delErr) {
        console.error('[invite orphan delete]', delErr);
      }
    }

    const baseRow = {
      id: userId,
      email,
      status: 'pending',
      invited_at: new Date().toISOString(),
      invited_by: invitedBy,
    };
    const { error: upsertErr } = await admin
      .from('allowed_users')
      .upsert({ ...baseRow, access_level: 'trial' }, { onConflict: 'id' });
    // Retry without access_level if migration 0002 hasn't been applied yet.
    if (upsertErr) {
      const retry = await admin
        .from('allowed_users')
        .upsert(baseRow, { onConflict: 'id' });
      if (retry.error) {
        console.error('[invite upsert]', retry.error);
      }
    }
  }

  try {
    await sendInviteEmail({ to: email, activateUrl: data.properties.action_link });
  } catch (err) {
    console.error('sendInviteEmail failed:', err);
    return { email, error: 'email-failed' };
  }
  return { email, invited: true };
}

export async function POST(request) {
  const { error, admin, userId } = await requireAdmin();
  if (error) return error;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 });
  }

  // Support single { email } or batch { emails: [...] }.
  const list = [];
  if (Array.isArray(body.emails)) {
    for (const raw of body.emails) {
      const parsed = emailSchema.safeParse(raw);
      if (parsed.success) list.push(parsed.data);
    }
  } else if (body.email) {
    const parsed = emailSchema.safeParse(body.email);
    if (parsed.success) list.push(parsed.data);
  }

  if (list.length === 0) {
    return NextResponse.json({ error: 'no valid emails' }, { status: 400 });
  }

  let invited = 0;
  let skipped = 0;
  let failed = 0;
  const results = [];
  for (const email of list) {
    // Sequential to avoid hitting Supabase rate limits.
    const r = await inviteOne({ admin, email, invitedBy: userId });
    if (r.invited) invited += 1;
    else if (r.skipped) skipped += 1;
    else failed += 1;
    results.push(r);
  }

  return NextResponse.json({ ok: true, invited, skipped, failed, results });
}
