import { signPlaybackToken } from '@/lib/cloudflare/signedUrl';

/**
 * Server component. Emits <link rel="prefetch" as="document"> hints for
 * Cloudflare Stream iframe URLs so the browser warms DNS/TLS + Cloudflare
 * warms its per-video CDN cache before the student clicks into the lesson.
 *
 * Accepts a list of lessons ({ id, cloudflare_video_id }); skips entries
 * without a UID. The signed token is short-lived (30 min) — if the user
 * delays past that, the lesson page re-signs at render time.
 *
 * Safe to call with an empty/undefined list — renders nothing.
 */
export default async function VideoPrefetch({ lessons }) {
  const items = (lessons || []).filter((l) => l && l.cloudflare_video_id);
  if (items.length === 0) return null;

  const hrefs = [];
  for (const l of items) {
    try {
      const token = await signPlaybackToken({
        videoUid: l.cloudflare_video_id,
        expSeconds: 30 * 60,
      });
      hrefs.push(`https://iframe.videodelivery.net/${token}?preload=true`);
    } catch {
      // Token signing should be stable — if it fails the lesson page will
      // surface the error at render time. Silently skip here.
    }
  }

  if (hrefs.length === 0) return null;

  return (
    <>
      {hrefs.map((href) => (
        <link key={href} rel="prefetch" as="document" href={href} />
      ))}
    </>
  );
}
