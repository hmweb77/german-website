import { createSupabaseServerClient } from './server';
import { createSupabaseAdminClient } from './admin';
import { ensureAdminProfile } from './bootstrapAdmin';

/**
 * Fetch the current session + `allowed_users` profile in one helper.
 * Returns { user: null, profile: null } when not signed in.
 */
export async function getSessionAndProfile() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  // Use service-role read to bypass RLS recursion when reading own row.
  const admin = createSupabaseAdminClient();
  let { data: profile, error: profileErr } = await admin
    .from('allowed_users')
    .select('id, email, status, is_admin, display_name, invited_at, activated_at, access_level')
    .eq('id', user.id)
    .maybeSingle();

  // Fallback if migration 0002 (access_level column) hasn't been applied yet.
  // Re-query without the new column so we still return a valid profile.
  if (profileErr) {
    console.warn('allowed_users select failed, retrying without access_level:', profileErr.message);
    const { data: legacy } = await admin
      .from('allowed_users')
      .select('id, email, status, is_admin, display_name, invited_at, activated_at')
      .eq('id', user.id)
      .maybeSingle();
    if (legacy) profile = { ...legacy, access_level: 'full' };
  }

  // Auto-bootstrap admin from ADMIN_EMAIL env var.
  const bootstrapped = await ensureAdminProfile({ user, admin });
  if (bootstrapped) profile = bootstrapped;

  return { user, profile: profile || null };
}

export function isActiveUser(profile) {
  return !!profile && profile.status === 'active';
}

export function isAdmin(profile) {
  return !!profile && profile.is_admin === true && profile.status === 'active';
}
