import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

const NAVY = '#0d1117';
const SURFACE = '#161b22';
const BORDER = '#30363d';
const BRAND = '#FFCC00';
const TEXT = '#e6edf3';
const MUTED = '#9ca3af';

export default function EmailLayout({ preview, children }) {
  return (
    <Html>
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body
        style={{
          backgroundColor: NAVY,
          color: TEXT,
          fontFamily: "'DM Sans', 'Cairo', -apple-system, sans-serif",
          margin: 0,
          padding: '32px 0',
        }}
      >
        <Container
          style={{
            backgroundColor: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            maxWidth: 560,
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              backgroundColor: BRAND,
              color: '#0d1117',
              padding: '20px 28px',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              DeutschMaroc
            </Text>
          </Section>
          <Section style={{ padding: '28px' }}>{children}</Section>
          <Section
            style={{
              padding: '16px 28px',
              borderTop: `1px solid ${BORDER}`,
              color: MUTED,
              fontSize: 12,
            }}
          >
            <Text style={{ margin: 0 }}>
              © {new Date().getFullYear()} DeutschMaroc · Apprenez l'allemand,
              pas à pas.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
