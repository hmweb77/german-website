import { getResendClient, getFromAddress } from './client';
import InviteEmail from './templates/InviteEmail';
import OtpEmail from './templates/OtpEmail';
import RevokeEmail from './templates/RevokeEmail';
import ResetEmail from './templates/ResetEmail';

export async function sendInviteEmail({ to, activateUrl }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Votre accès à DeutschMaroc est prêt',
    react: <InviteEmail activateUrl={activateUrl} />,
  });
}

export async function sendOtpEmail({ to, code }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: `Code DeutschMaroc : ${code}`,
    react: <OtpEmail code={code} />,
  });
}

export async function sendResetEmail({ to, resetUrl }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Réinitialisation de votre mot de passe DeutschMaroc',
    react: <ResetEmail resetUrl={resetUrl} />,
  });
}

export async function sendRevokeEmail({ to }) {
  const resend = getResendClient();
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: 'Votre accès DeutschMaroc a été mis à jour',
    react: <RevokeEmail />,
  });
}
