import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';

export async function POST(request) {
  const { error, admin } = await requireAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === 'string' ? body.id : null;
  const accessLevel = typeof body.accessLevel === 'string' ? body.accessLevel : null;

  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });
  if (!accessLevel || !['trial', 'full'].includes(accessLevel)) {
    return NextResponse.json({ error: 'invalid accessLevel' }, { status: 400 });
  }

  const { data: existing } = await admin
    .from('allowed_users')
    .select('id, is_admin')
    .eq('id', id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const { error: updErr } = await admin
    .from('allowed_users')
    .update({ access_level: accessLevel })
    .eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
