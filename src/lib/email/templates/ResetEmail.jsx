import { Button, Heading, Text } from '@react-email/components';
import EmailLayout from './Layout';

export default function ResetEmail({ resetUrl }) {
  return (
    <EmailLayout preview="Réinitialisation du mot de passe DeutschMaroc.">
      <Heading style={{ color: '#e6edf3', fontSize: 22, marginTop: 0 }}>
        Réinitialiser votre mot de passe
      </Heading>
      <Text style={{ color: '#d1d5db', lineHeight: 1.6 }}>
        Vous avez demandé la réinitialisation de votre mot de passe DeutschMaroc.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
        Ce lien expire dans 1 heure.
      </Text>
      <Button
        href={resetUrl}
        style={{
          backgroundColor: '#FFCC00',
          color: '#0d1117',
          padding: '12px 24px',
          borderRadius: 10,
          fontWeight: 700,
          textDecoration: 'none',
          display: 'inline-block',
          marginTop: 16,
        }}
      >
        Choisir un nouveau mot de passe
      </Button>
      <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 24 }}>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        <br />
        <span style={{ color: '#e6edf3', wordBreak: 'break-all' }}>
          {resetUrl}
        </span>
      </Text>
      <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 16 }}>
        Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail —
        votre mot de passe ne sera pas modifié.
      </Text>
    </EmailLayout>
  );
}
