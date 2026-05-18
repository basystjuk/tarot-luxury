import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Послуги та ціни — Таро консультації онлайн від $20",
  description:
    "Особиста таро-консультація, розклад на відносини, прогноз на місяць, розклад на рік та інші послуги. Онлайн від $20. Ellen Soul — таролог з 5+ роками практики.",
  keywords: [
    "таро консультація ціна",
    "розклад таро онлайн",
    "таро на відносини",
    "таро прогноз на місяць",
    "таролог онлайн ціна",
    "скільки коштує таро",
  ],
  openGraph: {
    title: "Послуги та ціни — Таро консультації від $20",
    description:
      "Особиста консультація, розклад на відносини, прогноз на місяць. Онлайн. Від $20.",
    url: "https://tarot-olena.com/services",
  },
  alternates: {
    canonical: "https://tarot-olena.com/services",
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
