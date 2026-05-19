import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { type Language, getTranslation } from '@/lib/i18n/translations';

const VALID_LANGS = ['uk', 'ru', 'en'] as const;
const SITE_URL = 'https://tarot-olena.com';

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
    title: getTranslation(lang, 'meta.faq.title'),
    description: getTranslation(lang, 'meta.faq.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/faq`,
      languages: {
        uk: `${SITE_URL}/uk/faq`,
        ru: `${SITE_URL}/ru/faq`,
        en: `${SITE_URL}/en/faq`,
        'x-default': `${SITE_URL}/uk/faq`,
      },
    },
  };
}

export default function FaqLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
