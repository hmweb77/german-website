import { createSupabaseServerClient } from './server';
import { createSupabaseAdminClient } from './admin';

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
  const { data: profile } = await admin
    .from('allowed_users')
    .select('id, email, status, is_admin, display_name, invited_at, activated_at')
    .eq('id', user.id)
    .single();

  return { user, profile: profile || null };
}

export function isActiveUser(profile) {
  return !!profile && profile.status === 'active';
}

export function isAdmin(profile) {
  return !!profile && profile.is_admin === true && profile.status === 'active';
}
