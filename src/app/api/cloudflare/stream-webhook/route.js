import { NextResponse } from 'next/server';
import { verifyStreamWebhook } from '@/lib/cloudflare/webhook';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const rawBody = await request.text();
  const secret = process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET;
  const sigHeader = request.headers.get('webhook-signature');

  const ok = verifyStreamWebhook({
    rawBody,
    signatureHeader: sigHeader,
    secret,
  });
  if (!ok) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const uid = payload?.uid;
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
  }

  const status = payload?.status?.state;
  const duration = typeof payload?.duration === 'number' ? Math.round(payload.duration) : null;
  const thumbnail = payload?.thumbnail || `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`;

  // Only persist metadata once Cloudflare has finished transcoding.
  if (status && status !== 'ready') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = createSupabaseAdminClient();
  const patch = {};
  if (duration !== null) patch.duration_seconds = duration;
  if (thumbnail) patch.thumbnail_url = thumbnail;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error: updErr } = await admin
    .from('lessons')
    .update(patch)
    .eq('cloudflare_video_id', uid);
  if (updErr) {
    console.error('stream-webhook update failed:', updErr.message);
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
