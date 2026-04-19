import { Button, Heading, Text } from '@react-email/components';
import EmailLayout from './Layout';

export default function InviteEmail({ activateUrl }) {
  return (
    <EmailLayout preview="Votre accès à DeutschMaroc est prêt.">
      <Heading style={{ color: '#e6edf3', fontSize: 22, marginTop: 0 }}>
        Bienvenue sur DeutschMaroc 🇩🇪
      </Heading>
      <Text style={{ color: '#d1d5db', lineHeight: 1.6 }}>
        Votre accès à la plateforme est prêt. Cliquez sur le bouton ci-dessous
        pour activer votre compte et choisir votre nom.
      </Text>
      <Button
        href={activateUrl}
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
        Activer mon compte
      </Button>
      <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 24 }}>
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
        <br />
        <span style={{ color: '#e6edf3', wordBreak: 'break-all' }}>
          {activateUrl}
        </span>
      </Text>
    </EmailLayout>
  );
}
