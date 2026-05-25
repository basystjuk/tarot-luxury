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
    title: getTranslation(lang, 'meta.studio.title'),
    description: getTranslation(lang, 'meta.studio.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/studio`,
      languages: {
        uk: `${SITE_URL}/uk/studio`,
        ru: `${SITE_URL}/ru/studio`,
        en: `${SITE_URL}/en/studio`,
        'x-default': `${SITE_URL}/uk/studio`,
      },
    },
  };
}

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
