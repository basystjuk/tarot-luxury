import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Про мене — Ellen Soul, таролог-емпат з 5+ роками практики",
  description:
    "Ellen Soul — емпат та таро-консультант з 5+ роками практики та 500+ консультаціями. Головний напрямок — любов і відносини. Поєдную таро з сучасною психологією.",
  openGraph: {
    title: "Про мене — Ellen Soul, таролог-емпат",
    description:
      "5+ років практики, 500+ консультацій. Відчуваю людей і те, що стоїть за їхнім запитом — навіть якщо він звучить зовсім інакше, ніж болить насправді.",
    url: "https://tarot-olena.com/about",
  },
  alternates: {
    canonical: "https://tarot-olena.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
