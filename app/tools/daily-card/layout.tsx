import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Карта дня Таро — Щоденне послання",
  description:
    "Отримай свою карту дня від Старших Арканів Таро. Тлумачення значення карти та аффірмація на сьогодні. Безкоштовно від Ellen Soul.",
  keywords: [
    "карта дня таро",
    "таро на сьогодні",
    "щоденна карта таро",
    "старші аркани таро значення",
    "таро безкоштовно онлайн",
  ],
  openGraph: {
    title: "Карта дня Таро — Щоденне послання від Ellen Soul",
    description:
      "Яка карта супроводжує тебе сьогодні? Отримай тлумачення та аффірмацію на день.",
    url: "https://tarot-olena.com/tools/daily-card",
  },
  alternates: {
    canonical: "https://tarot-olena.com/tools/daily-card",
  },
};

export default function DailyCardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
