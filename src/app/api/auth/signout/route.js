import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}

/**
 * GET variant — signs out and redirects. Useful for plain `<a>` links
 * (e.g. "se déconnecter et réessayer" on /access-denied).
 */
export async function GET(request) {
  const { origin, searchParams } = new URL(request.url);
  const nextParam = searchParams.get('next') || '/login';
  const safeNext = nextParam.startsWith('/') ? nextParam : '/login';

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(safeNext, origin));
}
