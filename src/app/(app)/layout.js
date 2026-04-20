import "../globals.css";

export const metadata = {
  title: "DeutschMaroc — Espace élève",
  description:
    "Plateforme d'apprentissage de l'allemand pour les apprenants marocains : cours vidéo A1.1 à A2.2, progression personnalisée, certificats.",
};

export default function AppLayout({ children }) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        {/* Warm up Cloudflare Stream origins before the student clicks into a
            lesson — DNS + TLS are done by the time the iframe mounts. */}
        <link rel="preconnect" href="https://iframe.videodelivery.net" crossOrigin="" />
        <link rel="preconnect" href="https://videodelivery.net" crossOrigin="" />
        <link rel="preconnect" href="https://embed.cloudflarestream.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://customer-cdn.cloudflarestream.com" />
        {/* Load the Stream SDK eagerly here instead of on VideoPlayer mount
            so window.Stream is already parsed by the time a lesson renders. */}
        <script src="https://embed.cloudflarestream.com/embed/sdk.latest.js" async />
      </head>
      <body className="app-ltr antialiased text-left selection:bg-[#FFCC00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
