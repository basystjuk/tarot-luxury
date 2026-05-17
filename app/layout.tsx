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
    default: "Ellen Soul — Таро-консультант і психолог відносин",
    template: "%s | Ellen Soul Таро",
  },
  description:
    "Ellen Soul — ліцензований психолог та сертифікований таро-консультант. Консультації з любові, відносин та особистісного розвитку. Онлайн та особисто.",
  keywords: [
    "таро консультація",
    "таро онлайн",
    "психолог відносин",
    "розклад таро",
    "любов стосунки таро",
    "таро Київ",
    "Ellen Soul таро",
    "психологія відносин",
  ],
  authors: [{ name: "Ellen Soul" }],
  creator: "Ellen Soul",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: "https://tarot-olena.com",
    siteName: "Ellen Soul Таро",
    title: "Ellen Soul — Таро-консультант і психолог відносин",
    description:
      "Коли слова не допомагають — карти розкажуть правду. Консультації з любові, відносин та особистісного зростання.",
    images: [
      {
        url: "https://tarot-olena.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ellen Soul Таро",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ellen Soul — Таро-консультант і психолог відносин",
    description: "Консультації з любові, відносин та особистісного зростання через таро.",
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
        <Header />
        <main className="flex-1"><LanguageProvider>{children}</LanguageProvider></main>
        <Footer />
      </body>
    </html>
  );
}
