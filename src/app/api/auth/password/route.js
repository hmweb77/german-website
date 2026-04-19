import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { emailSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

const passwordSchema = z.string().min(6).max(200);

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const emailParsed = emailSchema.safeParse(body.email);
  const pwParsed = passwordSchema.safeParse(body.password);
  if (!emailParsed.success || !pwParsed.success) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailParsed.data,
    password: pwParsed.data,
  });

  if (error || !data?.user) {
    return NextResponse.json(
      { error: 'E-mail ou mot de passe incorrect' },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
