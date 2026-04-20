/**
 * Ensures that if the signed-in user's email matches one of the addresses in
 * the `ADMIN_EMAIL` env var (comma-separated), they get an `allowed_users`
 * row with `is_admin=true`, `status='active'`, and `access_level='full'`.
 *
 * Idempotent: returns the final profile (existing or newly created/updated).
 * Safe to call on every request — only issues writes when something is out
 * of sync.
 */
export async function ensureAdminProfile({ user, admin }) {
  if (!user || !user.email) return null;

  const allowList = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const shouldBeAdmin = allowList.includes(user.email.toLowerCase());

  let { data: existing, error: existingErr } = await admin
    .from('allowed_users')
    .select('id, email, status, is_admin, display_name, access_level, invited_at, activated_at')
    .eq('id', user.id)
    .maybeSingle();

  // access_level column missing (migration 0002 not applied yet) — retry legacy.
  if (existingErr) {
    const { data: legacy } = await admin
      .from('allowed_users')
      .select('id, email, status, is_admin, display_name, invited_at, activated_at')
      .eq('id', user.id)
      .maybeSingle();
    if (legacy) existing = { ...legacy, access_level: 'full' };
  }

  if (!shouldBeAdmin) return existing || null;

  // Admin email — ensure the row exists and has the right flags.
  if (!existing) {
    const fallbackName = user.email.split('@')[0];
    const insertRow = {
      id: user.id,
      email: user.email,
      status: 'active',
      is_admin: true,
      display_name: fallbackName,
      activated_at: new Date().toISOString(),
    };
    let { data: inserted, error: insertErr } = await admin
      .from('allowed_users')
      .insert({ ...insertRow, access_level: 'full' })
      .select('id, email, status, is_admin, display_name, access_level, invited_at, activated_at')
      .single();
    if (insertErr) {
      // Retry without access_level in case migration 0002 isn't applied.
      const retry = await admin
        .from('allowed_users')
        .insert(insertRow)
        .select('id, email, status, is_admin, display_name, invited_at, activated_at')
        .single();
      if (retry.data) inserted = { ...retry.data, access_level: 'full' };
    }
    return inserted || null;
  }

  const patch = {};
  if (existing.status !== 'active') patch.status = 'active';
  if (existing.is_admin !== true) patch.is_admin = true;
  if (existing.access_level !== 'full') patch.access_level = 'full';
  if (!existing.display_name) patch.display_name = user.email.split('@')[0];
  if (!existing.activated_at) patch.activated_at = new Date().toISOString();

  if (Object.keys(patch).length === 0) return existing;

  let { data: updated, error: updateErr } = await admin
    .from('allowed_users')
    .update(patch)
    .eq('id', user.id)
    .select('id, email, status, is_admin, display_name, access_level, invited_at, activated_at')
    .single();
  if (updateErr) {
    // Retry without access_level.
    const { access_level, ...patchLegacy } = patch;
    void access_level;
    const retry = await admin
      .from('allowed_users')
      .update(patchLegacy)
      .eq('id', user.id)
      .select('id, email, status, is_admin, display_name, invited_at, activated_at')
      .single();
    if (retry.data) updated = { ...retry.data, access_level: 'full' };
  }
  return updated || existing;
}
