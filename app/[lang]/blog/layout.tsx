import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { type Language, getTranslation } from '@/lib/i18n/translations';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

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

export default async function BlogLayout({
  children, params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (VALID_LANGS.includes(rawLang as Language) ? rawLang : 'uk') as 'uk' | 'ru' | 'en';
  const home = lang === 'ru' ? 'Главная' : lang === 'en' ? 'Home' : 'Головна';
  const blog = lang === 'ru' ? 'Дневник таролога' : lang === 'en' ? 'Tarot Diary' : 'Щоденник таролога';
  return (
    <>
      <Breadcrumbs items={[
        { name: home, url: `${SITE_URL}/${lang}` },
        { name: blog, url: `${SITE_URL}/${lang}/blog` },
      ]} />
      {children}
    </>
  );
}
