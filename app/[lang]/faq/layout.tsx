import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { type Language, getTranslation } from '@/lib/i18n/translations';
import FaqSchema from '@/components/seo/FaqSchema';
import { faqFor } from '@/lib/data/faq';
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

export default async function FaqLayout({
  children, params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (VALID_LANGS.includes(rawLang as Language) ? rawLang : 'uk') as 'uk' | 'ru' | 'en';
  const home = lang === 'ru' ? 'Главная' : lang === 'en' ? 'Home' : 'Головна';
  const faq = lang === 'ru' ? 'Вопросы и ответы' : lang === 'en' ? 'FAQ' : 'Питання та відповіді';
  return (
    <>
      <FaqSchema faqs={faqFor(lang)} />
      <Breadcrumbs items={[
        { name: home, url: `${SITE_URL}/${lang}` },
        { name: faq, url: `${SITE_URL}/${lang}/faq` },
      ]} />
      {children}
    </>
  );
}
