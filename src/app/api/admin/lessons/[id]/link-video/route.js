import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/adminGuard';
import { getVideoInfo } from '@/lib/cloudflare/api';

// Matches a Cloudflare Stream UID: 32-char lowercase hex. If the admin pastes
// a full URL (e.g. https://iframe.videodelivery.net/<uid>), pull the UID out.
const UID_RE = /[a-f0-9]{32}/i;

function extractUid(input) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(UID_RE);
  return match ? match[0].toLowerCase() : null;
}

export async function POST(request, { params }) {
  const { error, admin } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const uid = extractUid(body.cloudflare_video_id);
  if (!uid) {
    return NextResponse.json(
      { error: 'UID Cloudflare invalide (32 caractères hex attendus).' },
      { status: 400 }
    );
  }

  // Make sure the lesson exists before we hit Cloudflare.
  const { data: lesson, error: qErr } = await admin
    .from('lessons')
    .select('id, cloudflare_video_id')
    .eq('id', id)
    .maybeSingle();
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 400 });
  if (!lesson) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

  // Validate the UID against Cloudflare and pull metadata. We intentionally do
  // NOT delete the previously-linked video here — admin owns those videos in
  // Cloudflare and may be re-pointing between them.
  let info;
  try {
    info = await getVideoInfo(uid);
  } catch (e) {
    return NextResponse.json(
      { error: `Vidéo introuvable sur Cloudflare: ${e.message}` },
      { status: 404 }
    );
  }

  const patch = {
    cloudflare_video_id: uid,
    duration_seconds:
      typeof info.duration === 'number' ? Math.round(info.duration) : null,
    thumbnail_url: typeof info.thumbnail === 'string' ? info.thumbnail : null,
  };

  const { error: updErr } = await admin
    .from('lessons')
    .update(patch)
    .eq('id', id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 400 });

  // Return the full updated lesson so the client can refresh its row state.
  const { data: updated } = await admin
    .from('lessons')
    .select(
      'id, course_id, title, description, cloudflare_video_id, duration_seconds, thumbnail_url, order_index, is_published'
    )
    .eq('id', id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    lesson: updated,
    readyToStream: !!info.readyToStream,
    state: info.status?.state || null,
  });
}
