import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { type Language, getTranslation } from '@/lib/i18n/translations';

const VALID_LANGS = ['uk', 'ru', 'en'] as const;
const SITE_URL = 'https://ellen-soul.com';

export function generateStaticParams() {
  return VALID_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Language = VALID_LANGS.includes(rawLang as Language) ? (rawLang as Language) : 'uk';

  return {
    title: getTranslation(lang, 'meta.about.title'),
    description: getTranslation(lang, 'meta.about.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/about`,
      languages: {
        uk: `${SITE_URL}/uk/about`,
        ru: `${SITE_URL}/ru/about`,
        en: `${SITE_URL}/en/about`,
        'x-default': `${SITE_URL}/uk/about`,
      },
    },
  };
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
