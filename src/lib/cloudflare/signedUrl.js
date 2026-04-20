import { createPrivateKey } from 'node:crypto';
import { SignJWT, importPKCS8 } from 'jose';

/**
 * Normalize a PEM string coming from an env var. Handles the common shapes:
 *   - literal "\n" escapes produced by single-line secret stores
 *   - surrounding double/single quotes
 *   - CRLF line endings
 *   - full base64-encoded blob (Cloudflare's API "jwk" response embeds the
 *     PEM as a single base64 string)
 * Throws if the result still doesn't carry the PKCS#8 BEGIN/END markers.
 */
function normalizePkcs8Pem(raw) {
  let s = String(raw).trim();

  // Strip wrapping quotes (common when pasting into .env files that quote values).
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }

  // Convert literal "\n" to real newlines; normalize CRLF.
  s = s.replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');

  // Cloudflare's POST /stream/keys response embeds the PEM as a single
  // base64 blob inside BEGIN/END markers with no newlines, i.e.:
  //   -----BEGIN RSA PRIVATE KEY-----<base64-of-the-real-PEM>-----END RSA PRIVATE KEY-----
  // Detect that shape and unwrap: the base64 body decodes to the real
  // multi-line PEM.
  const wrapped = s.match(/^-----BEGIN [^-]+-----([A-Za-z0-9+/=]+)-----END [^-]+-----\s*$/);
  if (wrapped) {
    try {
      const decoded = Buffer.from(wrapped[1], 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        s = decoded.replace(/\r\n?/g, '\n').trim() + '\n';
      }
    } catch {
      // fall through — the outer-marker PEM wasn't unwrappable, let the
      // standard path below report the mismatch.
    }
  }

  // If it doesn't already look like PEM at all, try base64-decoding the whole
  // blob (covers the case where the env var is just the base64 of a PEM file).
  if (!s.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(s, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) {
        s = decoded.replace(/\r\n?/g, '\n');
      }
    } catch {
      // fall through to the error below
    }
  }

  // PKCS#1 RSA keys ("-----BEGIN RSA PRIVATE KEY-----") are accepted too:
  // Node's crypto can read them directly, and we re-export as PKCS#8 so the
  // rest of the code path (jose.importPKCS8) is unchanged.
  if (!s.includes('-----BEGIN PRIVATE KEY-----')) {
    if (s.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      const keyObject = createPrivateKey({ key: s, format: 'pem', type: 'pkcs1' });
      return keyObject.export({ type: 'pkcs8', format: 'pem' });
    }
    throw new Error(
      'CLOUDFLARE_STREAM_SIGNING_KEY_PEM must be a PEM-formatted private key ' +
        '(either PKCS#8 "-----BEGIN PRIVATE KEY-----" or PKCS#1 "-----BEGIN RSA PRIVATE KEY-----").'
    );
  }

  return s;
}

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

  const key = await importPKCS8(normalizePkcs8Pem(pem), 'RS256');
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ kid, sub: videoUid })
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt(now)
    .setExpirationTime(now + expSeconds)
    .sign(key);
}
