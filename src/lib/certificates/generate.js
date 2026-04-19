import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    padding: 48,
    fontSize: 12,
  },
  border: {
    borderWidth: 2,
    borderColor: '#FFCC00',
    borderStyle: 'solid',
    padding: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    textAlign: 'center',
  },
  brand: {
    color: '#FFCC00',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 1,
  },
  body: {
    textAlign: 'center',
  },
  label: {
    color: '#9ca3af',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 18,
  },
  line: {
    fontSize: 13,
    color: '#e6edf3',
    marginBottom: 8,
  },
  level: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e6edf3',
    marginTop: 6,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
});

function CertificateDoc({ displayName, level, issuedAt }) {
  const dateStr = new Date(issuedAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      React.createElement(
        View,
        { style: styles.border },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.brand }, 'DEUTSCHMAROC'),
          React.createElement(
            Text,
            { style: styles.subtitle },
            'Certificat d\'accomplissement'
          )
        ),
        React.createElement(
          View,
          { style: styles.body },
          React.createElement(Text, { style: styles.label }, 'Décerné à'),
          React.createElement(Text, { style: styles.name }, displayName),
          React.createElement(
            Text,
            { style: styles.line },
            'pour avoir complété avec succès toutes les leçons du niveau'
          ),
          React.createElement(Text, { style: styles.level }, level),
          React.createElement(
            Text,
            { style: styles.line },
            'du programme de langue allemande.'
          )
        ),
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(Text, null, `Délivré le ${dateStr}`),
          React.createElement(Text, null, 'DeutschMaroc — deutschmaroc.com')
        )
      )
    )
  );
}

export async function generateCertificatePdf({ displayName, level, issuedAt }) {
  const element = React.createElement(CertificateDoc, { displayName, level, issuedAt });
  return await renderToBuffer(element);
}
