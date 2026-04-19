const CF_API = 'https://api.cloudflare.com/client/v4';

function requireEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_API_TOKEN;
  if (!accountId || !token) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN are required');
  }
  return { accountId, token };
}

/**
 * Create a one-time direct-creator upload URL.
 * Browser PUTs the file directly to Cloudflare; nothing touches our server.
 */
export async function createDirectUploadUrl({ maxDurationSeconds = 3600, meta = {} } = {}) {
  const { accountId, token } = requireEnv();
  const res = await fetch(
    `${CF_API}/accounts/${accountId}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: true,
        meta,
      }),
    }
  );

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(
      `Cloudflare direct_upload failed: ${json?.errors?.[0]?.message || res.status}`
    );
  }
  return { uid: json.result.uid, uploadURL: json.result.uploadURL };
}

export async function getVideoInfo(uid) {
  const { accountId, token } = requireEnv();
  const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(
      `Cloudflare getVideoInfo failed: ${json?.errors?.[0]?.message || res.status}`
    );
  }
  return json.result;
}

export async function deleteVideo(uid) {
  const { accountId, token } = requireEnv();
  const res = await fetch(`${CF_API}/accounts/${accountId}/stream/${uid}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 404) {
    const json = await res.json().catch(() => ({}));
    throw new Error(
      `Cloudflare deleteVideo failed: ${json?.errors?.[0]?.message || res.status}`
    );
  }
  return true;
}
