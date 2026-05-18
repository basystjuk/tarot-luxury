import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from '@/contexts/LanguageContext';

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ellen Soul — Таролог онлайн | Розклади таро на відносини",
    template: "%s | Ellen Soul",
  },
  description:
    "Ellen Soul — таролог-емпат з 5+ роками практики та 500+ консультаціями. Розклади таро на відносини, любов, вибір шляху. Онлайн-консультації від $20.",
  keywords: [
    "таролог онлайн",
    "таро консультація",
    "розклад таро на відносини",
    "таро онлайн",
    "таро на любов",
    "таролог",
    "Ellen Soul таро",
    "таро відносини",
    "онлайн таро",
    "розклад таро",
  ],
  authors: [{ name: "Ellen Soul" }],
  creator: "Ellen Soul",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://tarot-olena.com",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://tarot-olena.com",
    siteName: "Ellen Soul Таро",
    title: "Ellen Soul — Таролог онлайн | Розклади таро на відносини",
    description:
      "Таролог-емпат з 5+ роками практики. Розклади на відносини, любов, вибір шляху. Онлайн від $20.",
    images: [
      {
        url: "https://tarot-olena.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ellen Soul — таролог онлайн",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellen Soul — Таролог онлайн",
    description: "Розклади таро на відносини, любов та вибір шляху. Онлайн від $20.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uk"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#1C1512]">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
