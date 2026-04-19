import { SignJWT, importPKCS8 } from 'jose';

/**
 * Generate a signed Stream playback token.
 * Requires a PKCS8 private key created via the CF API
 * (CLOUDFLARE_STREAM_SIGNING_KEY_PEM) and its ID (CLOUDFLARE_STREAM_SIGNING_KEY_ID).
 */
export async function signPlaybackToken({ videoUid, expSeconds = 3600 } = {}) {
  const kid = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_ID;
  const pem = process.env.CLOUDFLARE_STREAM_SIGNING_KEY_PEM;
  if (!kid || !pem) {
    throw new Error(
      'CLOUDFLARE_STREAM_SIGNING_KEY_ID and CLOUDFLARE_STREAM_SIGNING_KEY_PEM are required'
    );
  }

  const key = await importPKCS8(pem.replace(/\\n/g, '\n'), 'RS256');
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ kid, sub: videoUid })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt(now)
    .setExpirationTime(now + expSeconds)
    .sign(key);
}
