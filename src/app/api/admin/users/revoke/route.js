import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { sendRevokeEmail } from '@/lib/email/send';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : null;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const { data: existing } = await admin
    .from('allowed_users')
    .select('email, is_admin')
    .eq('id', id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (existing.is_admin) {
    return NextResponse.json({ error: 'cannot revoke admin' }, { status: 400 });
  }

  const { error: updErr } = await admin
    .from('allowed_users')
    .update({ status: 'revoked' })
    .eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  // Invalidate current sessions.
  try {
    await admin.auth.admin.signOut(id, 'global');
  } catch (err) {
    console.error('signOut failed:', err);
  }

  try {
    await sendRevokeEmail({ to: existing.email });
  } catch (err) {
    console.error('sendRevokeEmail failed:', err);
  }

  return NextResponse.json({ ok: true });
}
