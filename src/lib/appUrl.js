/** Public site origin (no trailing slash). Used for Supabase redirectTo and email links. */
export function getAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'https://deutschmaroc.com';
  return raw.replace(/\/$/, '');
}
