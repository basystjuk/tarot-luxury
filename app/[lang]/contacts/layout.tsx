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
    title: getTranslation(lang, 'meta.contacts.title'),
    description: getTranslation(lang, 'meta.contacts.desc'),
    alternates: {
      canonical: `${SITE_URL}/${lang}/contacts`,
      languages: {
        uk: `${SITE_URL}/uk/contacts`,
        ru: `${SITE_URL}/ru/contacts`,
        en: `${SITE_URL}/en/contacts`,
        'x-default': `${SITE_URL}/uk/contacts`,
      },
    },
  };
}

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
