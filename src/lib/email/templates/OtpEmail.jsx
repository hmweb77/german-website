import { Heading, Text } from '@react-email/components';
import EmailLayout from './Layout';

export default function OtpEmail({ code }) {
  return (
    <EmailLayout preview={`Votre code de connexion DeutschMaroc : ${code}`}>
      <Heading style={{ color: '#e6edf3', fontSize: 22, marginTop: 0 }}>
        Votre code de connexion
      </Heading>
      <Text style={{ color: '#d1d5db', lineHeight: 1.6 }}>
        Entrez ce code pour vous connecter à votre espace DeutschMaroc. Il
        expire dans 10 minutes.
      </Text>
      <div
        style={{
          backgroundColor: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 12,
          padding: '18px 24px',
          margin: '20px 0',
          fontFamily: "'DM Sans', monospace",
          fontSize: 32,
          letterSpacing: '0.35em',
          fontWeight: 700,
          color: '#FFCC00',
          textAlign: 'center',
        }}
      >
        {code}
      </div>
      <Text style={{ color: '#9ca3af', fontSize: 13 }}>
        Si vous n'avez pas demandé ce code, ignorez simplement cet e-mail.
      </Text>
    </EmailLayout>
  );
}
