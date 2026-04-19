import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from './server';
import { createSupabaseAdminClient } from './admin';

/**
 * Verify the caller is an authenticated active admin.
 * Returns { admin, userId } on success, or a NextResponse to return on failure.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: 'unauthorized' }, { status: 401 }) };
  }
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from('allowed_users')
    .select('status, is_admin')
    .eq('id', user.id)
    .single();
  if (!profile || profile.status !== 'active' || !profile.is_admin) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
  }
  return { admin, userId: user.id };
}
