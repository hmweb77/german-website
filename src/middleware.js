import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { updateSession } from '@/lib/supabase/middleware';
import { ensureAdminProfile } from '@/lib/supabase/bootstrapAdmin';

const PROTECTED_PREFIXES = ['/dashboard', '/courses', '/admin'];
const AUTH_ONLY_PATHS = ['/login', '/activate', '/access-denied'];

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthOnly(pathname) {
  return AUTH_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  // Unauthenticated — only allow auth pages.
  if (!user) {
    if (isProtected(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Authenticated — fetch profile via service-role to avoid RLS recursion.
  // (Supabase anon key would be refused by RLS on allowed_users when the
  //  policy uses is_active_user(), which itself reads allowed_users.)
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  let { data: profile } = await admin
    .from('allowed_users')
    .select('status, is_admin, display_name')
    .eq('id', user.id)
    .maybeSingle();

  // Auto-create/repair the admin's allowed_users row based on ADMIN_EMAIL env.
  // Lets the designated admin(s) always reach the dashboard even if their
  // allowed_users row was never seeded.
  const bootstrapped = await ensureAdminProfile({ user, admin });
  if (bootstrapped) {
    profile = {
      status: bootstrapped.status,
      is_admin: bootstrapped.is_admin,
      display_name: bootstrapped.display_name,
    };
  }

  // Signed-in user landing on /login — only fast-track to /dashboard when
  // the profile is fully active and set up. If the profile is missing,
  // pending, revoked, etc., let /login render so the user can sign out and
  // try a different account instead of being bounced to /access-denied.
  if (pathname === '/login') {
    if (profile && profile.status === 'active' && profile.display_name) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // /reset-password must be reachable for anyone with a valid session
  // (the Supabase recovery flow temporarily signs you in even before you've
  // finished choosing a new password — don't block it on status or profile).
  if (pathname === '/reset-password') {
    return response;
  }

  // No profile row at all → send to /activate so set-display-name can
  // create one. /access-denied is only for confirmed revoked/blocked users.
  if (!profile) {
    if (pathname.startsWith('/activate') || pathname === '/access-denied') {
      return response;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/activate';
    return NextResponse.redirect(url);
  }

  // Pending users → let them finish activation at /activate, don't dead-end
  // them on /access-denied. Revoked / other non-active → /access-denied.
  if (profile.status !== 'active') {
    if (profile.status === 'pending') {
      if (pathname.startsWith('/activate')) return response;
      const url = request.nextUrl.clone();
      url.pathname = '/activate';
      return NextResponse.redirect(url);
    }
    if (pathname !== '/access-denied') {
      const url = request.nextUrl.clone();
      url.pathname = '/access-denied';
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Active users without display_name → force /activate to finish setup.
  if (!profile.display_name && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/activate';
    return NextResponse.redirect(url);
  }

  // Admin gate.
  if (pathname.startsWith('/admin') && !profile.is_admin) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on app routes + auth pages, skip the marketing landing, static assets,
  // and the Cloudflare webhook (it validates its own HMAC, no session needed).
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/admin/:path*',
    '/login',
    '/activate/:path*',
    '/access-denied',
    '/reset-password',
  ],
};
