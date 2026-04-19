import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { emailSchema, otpSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const emailParsed = emailSchema.safeParse(body.email);
  const otpParsed = otpSchema.safeParse(body.code);
  if (!emailParsed.success || !otpParsed.success) {
    return NextResponse.json({ error: 'Champs invalides' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: emailParsed.data,
    token: otpParsed.data,
    type: 'email',
  });

  if (error || !data?.user) {
    return NextResponse.json({ error: 'Code incorrect ou expiré' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
