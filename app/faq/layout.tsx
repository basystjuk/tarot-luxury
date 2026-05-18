import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Питання та відповіді — Таро консультації Ellen Soul",
  description:
    "Відповіді на найпоширеніші питання: як проходить таро-консультація онлайн, чи потрібна підготовка, чи передбачає таро майбутнє, скільки коштує сесія.",
  keywords: [
    "таро FAQ",
    "як проходить таро консультація",
    "таро онлайн питання",
    "чи передбачає таро майбутнє",
    "підготовка до таро сесії",
  ],
  openGraph: {
    title: "Питання та відповіді — Таро консультації",
    description:
      "Як проходить сесія, чи потрібна підготовка, що можна дізнатись з таро — відповіді на всі запитання.",
    url: "https://tarot-olena.com/faq",
  },
  alternates: {
    canonical: "https://tarot-olena.com/faq",
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
