import "../globals.css";
import MetaPixel from "@/components/analytics/MetaPixel";

export const metadata = {
  title: "Maroc Deutsch، تعلم الألمانية من الصفر حتى B2",
  description:
    "كورسات كاملة بالفيديو لتعلم الألمانية من الصفر حتى مستوى B2. منظمين خطوة بخطوة مع تمارين وامتحانات.",
};

export default function MarketingLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased text-right selection:bg-[#FFCC00] selection:text-black">
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
