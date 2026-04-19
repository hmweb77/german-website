import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';

export async function PATCH(request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const patch = {};
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if ('description' in body) patch.description = body.description || null;
  if (typeof body.slug === 'string') patch.slug = body.slug.trim();
  if (typeof body.level === 'string') patch.level = body.level;
  if (typeof body.order_index === 'number') patch.order_index = body.order_index;
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;

  const { error: updErr } = await admin.from('courses').update(patch).eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { error: delErr } = await admin.from('courses').delete().eq('id', id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
