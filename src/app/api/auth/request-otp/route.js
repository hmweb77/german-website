import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendOtpEmail } from '@/lib/email/send';
import { emailSchema } from '@/lib/validation/schemas';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const parsed = emailSchema.safeParse(body.email);
  if (!parsed.success) {
    return NextResponse.json({ error: 'E-mail invalide' }, { status: 400 });
  }
  const email = parsed.data;

  const admin = createSupabaseAdminClient();

  // Only allow OTP for known, non-revoked users.
  const { data: profile } = await admin
    .from('allowed_users')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (!profile) {
    // Deliberately vague — don't leak which emails exist.
    return NextResponse.json({ ok: true });
  }
  if (profile.status === 'revoked') {
    return NextResponse.json({ ok: true });
  }

  // generateLink with type: 'magiclink' returns both the link and an email_otp.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (error || !data?.properties?.email_otp) {
    console.error('generateLink failed:', error);
    return NextResponse.json(
      { error: "Impossible d'envoyer le code pour l'instant" },
      { status: 502 }
    );
  }

  try {
    await sendOtpEmail({ to: email, code: data.properties.email_otp });
  } catch (err) {
    console.error('sendOtpEmail failed:', err);
    return NextResponse.json(
      { error: "Échec d'envoi de l'e-mail" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
