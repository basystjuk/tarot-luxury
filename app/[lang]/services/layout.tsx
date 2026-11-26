import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { type Language, getTranslation } from '@/lib/i18n/translations';
import ServiceSchema from '@/components/seo/ServiceSchema';
import { DEFAULT_SERVICES, lowestPrice, type ServiceItem } from '@/lib/data/services';
import { getCachedPublicContent } from '@/lib/public-content';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const VALID_LANGS = ['uk', 'ru', 'en'] as const;
const SITE_URL = 'https://ellen-soul.com';

/** Prices and names as edited in the admin (what the page shows), not code defaults. */
async function servicesFromAdmin(): Promise<ServiceItem[]> {
  const content = await getCachedPublicContent();
  const stored = content.services as ServiceItem[] | undefined;
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_SERVICES;
}

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

  // "From $X" follows the admin prices; the code list is only a fallback.
  const services = await servicesFromAdmin();
  const from = lowestPrice(services) ?? lowestPrice(DEFAULT_SERVICES) ?? '';

  return {
    title: getTranslation(lang, 'meta.services.title'),
    description: getTranslation(lang, 'meta.services.desc').replace('{price}', from),
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

export default async function ServicesLayout({
  children, params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (VALID_LANGS.includes(rawLang as Language) ? rawLang : 'uk') as 'uk' | 'ru' | 'en';
  const home = lang === 'ru' ? 'Главная' : lang === 'en' ? 'Home' : 'Головна';
  const servicesLabel = lang === 'ru' ? 'Услуги' : lang === 'en' ? 'Services' : 'Послуги';
  const services = await servicesFromAdmin();
  return (
    <>
      <ServiceSchema services={services} lang={lang} />
      <Breadcrumbs items={[
        { name: home, url: `${SITE_URL}/${lang}` },
        { name: servicesLabel, url: `${SITE_URL}/${lang}/services` },
      ]} />
      {children}
    </>
  );
}
