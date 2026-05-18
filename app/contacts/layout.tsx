import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Записатись на консультацію — Ellen Soul Таро",
  description:
    "Запишіться на таро-консультацію до Ellen Soul. Зв'яжіться через Telegram @ellen_soul_taro або заповніть форму. Відповідь протягом 24 годин.",
  keywords: [
    "записатись до таролога",
    "таро консультація запис",
    "таролог telegram",
    "онлайн таро записатись",
  ],
  openGraph: {
    title: "Записатись на консультацію — Ellen Soul Таро",
    description:
      "Зв'яжіться через Telegram або форму. Відповідь протягом 24 годин.",
    url: "https://tarot-olena.com/contacts",
  },
  alternates: {
    canonical: "https://tarot-olena.com/contacts",
  },
};

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
