import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { sendInviteEmail } from '@/lib/email/send';
import { getAppUrl } from '@/lib/appUrl';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : null;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const { data: row } = await admin
    .from('allowed_users')
    .select('email, status')
    .eq('id', id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const appUrl = getAppUrl();
  const { data, error: genErr } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: row.email,
    options: { redirectTo: `${appUrl}/activate` },
  });
  if (genErr || !data?.properties?.action_link) {
    return NextResponse.json({ error: genErr?.message || 'generateLink failed' }, { status: 502 });
  }

  // If revoked, flip back to pending so the invite actually lets them in.
  if (row.status === 'revoked') {
    await admin.from('allowed_users').update({ status: 'pending' }).eq('id', id);
  }

  try {
    await sendInviteEmail({ to: row.email, activateUrl: data.properties.action_link });
  } catch (err) {
    console.error('sendInviteEmail failed:', err);
    return NextResponse.json({ error: 'email-failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
