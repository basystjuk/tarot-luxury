import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Щоденник таролога — Ellen Soul",
  description:
    "Статті про таро, психологію відносин та жіночу мудрість від Ellen Soul. Як читати карти, розуміти себе і своїх близьких. Незабаром нові публікації.",
  openGraph: {
    title: "Щоденник таролога — Ellen Soul",
    description:
      "Статті про таро, психологію відносин та жіночу мудрість. Незабаром нові публікації.",
    url: "https://tarot-olena.com/blog",
  },
  alternates: {
    canonical: "https://tarot-olena.com/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
