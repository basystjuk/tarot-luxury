/**
 * Site-wide JSON-LD: Organization + Person + WebSite.
 *
 * Three top-tier entities Google uses for the Knowledge Graph and the
 * branded SERP block:
 *
 *   • Organization — the brand (Ellen Soul). Anchors social profile
 *     consolidation through sameAs.
 *   • Person — the practitioner (Олена Соул). Lets Google attach the
 *     "Author" entity to readings/posts and surface the photo in SERP.
 *   • WebSite + potentialAction=SearchAction — enables the branded
 *     "search this site" box that Google can show under the main result
 *     for queries like "ellen soul".
 *
 * Mounted once in the root layout so every page inherits these signals.
 */

const SITE = "https://ellen-soul.com";

const json = (data: object) => ({
  __html: JSON.stringify(data, null, 0),
});

export default function GlobalSchema() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: "Ellen Soul",
    alternateName: ["Ellen Soul Таро", "Ellen Soul Tarot"],
    url: SITE,
    logo: {
      "@type": "ImageObject",
      url: `${SITE}/og-image.jpg`,
      width: 1200,
      height: 630,
    },
    image: `${SITE}/og-image.jpg`,
    description:
      "Таролог-емпат Ellen Soul: онлайн-консультації, інструменти Таро, астрології та нумерології. Щоденник таролога — авторські відео-розбори.",
    sameAs: [
      "https://www.youtube.com/channel/UChGlgY6oZj9ttZ_GQfI9lKw",
      "https://instagram.com/ellen_soul_taro",
      "https://www.tiktok.com/@ellen_soul_taro",
      "https://t.me/ellen_soul_taro",
    ],
    foundingDate: "2020",
    knowsAbout: ["Таро", "Астрологія", "Нумерологія", "Тарологія", "Психологія"],
    areaServed: { "@type": "Country", name: "UA" },
  };

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE}/#person`,
    name: "Олена Соул",
    alternateName: ["Ellen Soul"],
    url: SITE,
    image: `${SITE}/og-image.jpg`,
    jobTitle: "Таролог · Астролог · Нумеролог",
    description: "Авторка проєкту Ellen Soul. 5+ років практики, 500+ консультацій.",
    worksFor: { "@id": `${SITE}/#organization` },
    knowsAbout: ["Таро", "Астрологія", "Нумерологія", "Тарологія", "Психологія"],
    sameAs: [
      "https://www.youtube.com/channel/UChGlgY6oZj9ttZ_GQfI9lKw",
      "https://instagram.com/ellen_soul_taro",
      "https://t.me/ellen_soul_taro",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: SITE,
    name: "Ellen Soul",
    inLanguage: ["uk-UA", "ru-RU", "en-US"],
    publisher: { "@id": `${SITE}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/uk?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={json(organization)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={json(person)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={json(website)} />
    </>
  );
}
