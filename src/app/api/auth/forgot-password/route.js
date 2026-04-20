import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { sendResetEmail } from '@/lib/email/send';
import { emailSchema } from '@/lib/validation/schemas';
import { getAppUrl } from '@/lib/appUrl';

/**
 * Password reset — generates the recovery link via the Supabase admin API
 * (doesn't send the email itself) and delivers it with Resend. This avoids
 * Supabase's built-in email rate limit entirely.
 */
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
  const email = emailParsed.data;

  const admin = createSupabaseAdminClient();
  const appUrl = getAppUrl();

  // generateLink returns a link *without* triggering Supabase's mailer —
  // no rate limit, no 429. The user must exist in auth.users.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${appUrl}/reset-password` },
  });

  // Always respond OK to avoid leaking whether an account exists. Failures
  // are logged server-side only.
  if (error) {
    console.error('generateLink recovery failed:', error.message);
    return NextResponse.json({ ok: true });
  }

  // Bypass Supabase's /auth/v1/verify redirect entirely by pointing the
  // email at our own /auth/confirm handler with the token_hash. This avoids
  // Site-URL/allowlist fallbacks and the implicit-flow hash-fragment format.
  const tokenHash =
    data?.properties?.hashed_token || data?.properties?.hashedToken;
  const resetUrl = tokenHash
    ? `${appUrl}/auth/confirm?token_hash=${encodeURIComponent(
        tokenHash
      )}&type=recovery&next=/reset-password`
    : data?.properties?.action_link;

  if (!resetUrl) {
    console.error('No reset URL available from generateLink response');
    return NextResponse.json({ ok: true });
  }

  try {
    await sendResetEmail({ to: email, resetUrl });
  } catch (err) {
    console.error('sendResetEmail failed:', err);
  }

  return NextResponse.json({ ok: true });
}
