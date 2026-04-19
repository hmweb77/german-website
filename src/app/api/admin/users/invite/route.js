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

  // Generate invite link via Supabase admin API.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email,
    options: { redirectTo: `${appUrl}/activate` },
  });
  if (error || !data?.properties?.action_link) {
    return { email, error: error?.message || 'generateLink failed' };
  }

  const userId = data.user?.id;
  if (userId) {
    await admin
      .from('allowed_users')
      .upsert(
        {
          id: userId,
          email,
          status: existing?.status === 'active' ? 'active' : 'pending',
          invited_at: new Date().toISOString(),
          invited_by: invitedBy,
        },
        { onConflict: 'id' }
      );
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
