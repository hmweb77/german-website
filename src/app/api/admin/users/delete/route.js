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
    return NextResponse.json({ error: 'cannot delete admin' }, { status: 400 });
  }

  // Notify before we destroy the row (email address lives on allowed_users).
  try {
    await sendRevokeEmail({ to: existing.email });
  } catch (err) {
    console.error('sendRevokeEmail (delete) failed:', err);
  }

  // Delete the auth user — this cascades to allowed_users (FK on id) and
  // related rows (watch_progress, lesson_notes, notification_reads,
  // certificates all cascade on user_id).
  try {
    const { error: delErr } = await admin.auth.admin.deleteUser(id);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'delete failed' },
      { status: 500 }
    );
  }

  // Belt-and-suspenders: explicit delete in case FK cascade isn't configured.
  await admin.from('allowed_users').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
