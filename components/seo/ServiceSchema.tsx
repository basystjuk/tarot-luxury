/**
 * Service + Offer JSON-LD for each consulting product.
 *
 * Lets Google show prices and a "starts at $X" badge in the SERP for
 * branded queries ("ellen soul послуги"). Each service is its own
 * Service entity provided by the central Organization, with an Offer
 * carrying the price + USD currency.
 */

import type { ServiceItem } from "@/lib/data/services";

const SITE = "https://ellen-soul.com";

function priceNumber(p: string): string {
  const m = p.match(/(\d+)/);
  return m ? m[1] : "0";
}

export default function ServiceSchema({
  services, lang,
}: { services: ServiceItem[]; lang: "uk" | "ru" | "en" }) {
  if (!services || services.length === 0) return null;
  const data = services.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE}/${lang}/services#${s.id}`,
    name:
      lang === "ru" ? s.title_ru : lang === "en" ? s.title_en : s.title_uk,
    description:
      lang === "ru" ? s.desc_ru : lang === "en" ? s.desc_en : s.desc_uk,
    url: `${SITE}/${lang}/services#${s.id}`,
    provider: { "@id": `${SITE}/#organization` },
    serviceType:
      lang === "ru" ? s.subtitle_ru : lang === "en" ? s.subtitle_en : s.subtitle_uk,
    areaServed: { "@type": "Country", name: "Worldwide" },
    offers: {
      "@type": "Offer",
      price: priceNumber(s.price),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE}/${lang}/services#${s.id}`,
    },
  }));
  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
