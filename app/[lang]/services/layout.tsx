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
    title: getTranslation(lang, 'meta.services.title'),
    description: getTranslation(lang, 'meta.services.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/services`,
      languages: {
        uk: `${SITE_URL}/uk/services`,
        ru: `${SITE_URL}/ru/services`,
        en: `${SITE_URL}/en/services`,
        'x-default': `${SITE_URL}/uk/services`,
      },
    },
  };
}

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
