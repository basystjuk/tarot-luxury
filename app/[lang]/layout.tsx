import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const VALID_LANGS = ['uk', 'ru', 'en'] as const;
type Lang = typeof VALID_LANGS[number];

const SITE_URL = 'https://tarot-olena.com';

const PAGE_META: Record<Lang, { title: string; description: string }> = {
  uk: {
    title: 'Ellen Soul — Таролог онлайн | Розклади таро на відносини',
    description: 'Ellen Soul — таролог-емпат з 5+ роками практики та 500+ консультаціями. Розклади таро на відносини, любов, вибір шляху. Онлайн від $20.',
  },
  ru: {
    title: 'Ellen Soul — Таролог онлайн | Расклады таро на отношения',
    description: 'Ellen Soul — таролог-эмпат с 5+ годами практики и 500+ консультациями. Расклады таро на отношения, любовь, выбор пути. Онлайн от $20.',
  },
  en: {
    title: 'Ellen Soul — Online Tarot Reader | Tarot Readings for Relationships',
    description: 'Ellen Soul — empath tarot reader with 5+ years of practice and 500+ consultations. Tarot readings for relationships, love and life choices. Online from $20.',
  },
};

export function generateStaticParams() {
  return VALID_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = VALID_LANGS.includes(rawLang as Lang) ? (rawLang as Lang) : 'uk';
  const meta = PAGE_META[lang];

  const localeMap: Record<Lang, string> = { uk: 'uk_UA', ru: 'ru_RU', en: 'en_US' };

  return {
    title: {
      default: meta.title,
      template: `%s | Ellen Soul`,
    },
    description: meta.description,
    alternates: {
      canonical: `${SITE_URL}/${lang}`,
      languages: {
        'uk': `${SITE_URL}/uk`,
        'ru': `${SITE_URL}/ru`,
        'en': `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/uk`,
      },
    },
    openGraph: {
      type: 'website',
      locale: localeMap[lang],
      url: `${SITE_URL}/${lang}`,
      siteName: 'Ellen Soul Tarot',
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Ellen Soul — Tarot Reader',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function LangLayout({
  children,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  return <>{children}</>;
}
