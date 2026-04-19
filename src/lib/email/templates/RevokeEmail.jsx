import { Heading, Text } from '@react-email/components';
import EmailLayout from './Layout';

export default function RevokeEmail() {
  return (
    <EmailLayout preview="Votre accès à DeutschMaroc a été mis à jour.">
      <Heading style={{ color: '#e6edf3', fontSize: 22, marginTop: 0 }}>
        Votre accès a été mis à jour
      </Heading>
      <Text style={{ color: '#d1d5db', lineHeight: 1.6 }}>
        L'accès à votre compte DeutschMaroc a été désactivé. Si vous pensez
        qu'il s'agit d'une erreur, contactez-nous à{' '}
        <a href="mailto:support@deutschmaroc.com" style={{ color: '#FFCC00' }}>
          support@deutschmaroc.com
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
