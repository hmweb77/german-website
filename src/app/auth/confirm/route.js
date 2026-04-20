import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Handles Supabase email confirmation links that use `token_hash` + `type`
 * (e.g. password recovery, email change). After a successful verifyOtp,
 * redirects the user to `next` (defaults to `/dashboard`).
 *
 * Expected Supabase email-template link format (set in the dashboard):
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const nextParam = searchParams.get('next') || '/dashboard';
  const safeNext = nextParam.startsWith('/') ? nextParam : '/dashboard';

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
    console.error('verifyOtp failed:', error);
  }

  const url = new URL('/login', origin);
  url.searchParams.set('error', 'verify_failed');
  return NextResponse.redirect(url);
}
