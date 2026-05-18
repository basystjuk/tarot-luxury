import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Безкоштовні інструменти — Карта дня, Місячний календар",
  description:
    "Безкоштовні таро-інструменти від Ellen Soul: карта дня з тлумаченням, місячний календар, нумерологія. Отримай щоденне послання від Таро.",
  keywords: [
    "карта дня таро",
    "таро безкоштовно",
    "карта таро онлайн",
    "місячний календар",
    "таро онлайн безкоштовно",
    "щоденна карта таро",
  ],
  openGraph: {
    title: "Безкоштовні таро-інструменти — Ellen Soul",
    description:
      "Карта дня з тлумаченням, місячний календар та інші безкоштовні інструменти.",
    url: "https://tarot-olena.com/tools",
  },
  alternates: {
    canonical: "https://tarot-olena.com/tools",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
