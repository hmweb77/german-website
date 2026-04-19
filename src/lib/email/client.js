import { Resend } from 'resend';

let cached;

export function getResendClient() {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not configured');
  cached = new Resend(key);
  return cached;
}

export function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL || 'contact@hmwebs.com>';
}
