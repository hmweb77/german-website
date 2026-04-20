import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { emailSchema } from '@/lib/validation/schemas';
import { getAppUrl } from '@/lib/appUrl';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const emailParsed = emailSchema.safeParse(body.email);
  if (!emailParsed.success) {
    return NextResponse.json({ error: 'E-mail invalide' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(emailParsed.data, {
    redirectTo: `${getAppUrl()}/auth/callback?next=/reset-password`,
  });

  // Always respond OK to avoid leaking whether an account exists.
  return NextResponse.json({ ok: true });
}
