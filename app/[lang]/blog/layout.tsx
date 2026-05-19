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
    title: getTranslation(lang, 'meta.blog.title'),
    description: getTranslation(lang, 'meta.blog.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/blog`,
      languages: {
        uk: `${SITE_URL}/uk/blog`,
        ru: `${SITE_URL}/ru/blog`,
        en: `${SITE_URL}/en/blog`,
        'x-default': `${SITE_URL}/uk/blog`,
      },
    },
  };
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
