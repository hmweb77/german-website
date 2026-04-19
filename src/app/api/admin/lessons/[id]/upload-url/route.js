import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { createDirectUploadUrl, deleteVideo } from '@/lib/cloudflare/api';

export async function POST(_request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const { data: lesson, error: qErr } = await admin
    .from('lessons')
    .select('id, cloudflare_video_id')
    .eq('id', id)
    .maybeSingle();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 400 });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  // Best-effort: remove the previous CF video if this lesson is being re-uploaded.
  if (lesson.cloudflare_video_id) {
    try {
      await deleteVideo(lesson.cloudflare_video_id);
    } catch (e) {
      console.error('cloudflare deleteVideo (reupload) failed:', e.message);
    }
  }

  let cfResult;
  try {
    cfResult = await createDirectUploadUrl({
      maxDurationSeconds: 7200,
      meta: { lesson_id: id },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }

  const { error: updErr } = await admin
    .from('lessons')
    .update({
      cloudflare_video_id: cfResult.uid,
      duration_seconds: null,
      thumbnail_url: null,
    })
    .eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  return NextResponse.json({ uid: cfResult.uid, uploadURL: cfResult.uploadURL });
}
