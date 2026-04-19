import crypto from 'node:crypto';

/**
 * Verify a Cloudflare Stream webhook signature.
 * Header format: `time=<unix>,sig1=<hex>` — signed body is `<time>.<rawBody>`.
 */
export function verifyStreamWebhook({ rawBody, signatureHeader, secret, toleranceSeconds = 300 }) {
  if (!signatureHeader || !secret) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => kv.split('=').map((s) => s.trim()))
  );
  const ts = parts.time;
  const sig = parts.sig1;
  if (!ts || !sig) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > toleranceSeconds) return false;

  const signed = `${ts}.${rawBody}`;
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(sig, 'hex')
    );
  } catch {
    return false;
  }
}
