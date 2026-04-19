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
      </head>
      <body className="app-ltr antialiased text-left selection:bg-[#FFCC00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
