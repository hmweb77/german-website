import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { deleteVideo } from '@/lib/cloudflare/api';

export async function GET(_request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { data, error: qErr } = await admin
    .from('lessons')
    .select('id, course_id, title, description, cloudflare_video_id, duration_seconds, thumbnail_url, order_index, is_published')
    .eq('id', id)
    .maybeSingle();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ lesson: data });
}

export async function PATCH(request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const patch = {};
  if (typeof body.title === 'string') patch.title = body.title.trim();
  if ('description' in body) patch.description = body.description || null;
  if (typeof body.order_index === 'number') patch.order_index = body.order_index;
  if (typeof body.is_published === 'boolean') patch.is_published = body.is_published;
  if (typeof body.cloudflare_video_id === 'string' || body.cloudflare_video_id === null) {
    patch.cloudflare_video_id = body.cloudflare_video_id;
  }
  if (typeof body.duration_seconds === 'number') patch.duration_seconds = body.duration_seconds;
  if (typeof body.thumbnail_url === 'string') patch.thumbnail_url = body.thumbnail_url;

  const { error: updErr } = await admin.from('lessons').update(patch).eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { data: existing } = await admin
    .from('lessons')
    .select('cloudflare_video_id')
    .eq('id', id)
    .maybeSingle();

  const { error: delErr } = await admin.from('lessons').delete().eq('id', id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  if (existing?.cloudflare_video_id) {
    try {
      await deleteVideo(existing.cloudflare_video_id);
    } catch (e) {
      // Non-fatal: orphaned CF video can be cleaned up later.
      console.error('cloudflare deleteVideo failed:', e.message);
    }
  }

  return NextResponse.json({ ok: true });
}
