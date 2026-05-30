/**
 * BreadcrumbList JSON-LD.
 *
 * Tells Google the page's place in the site hierarchy so the SERP can
 * render breadcrumb chips instead of a raw URL — cleaner result block
 * and slightly higher CTR.
 *
 * Pass items in order from root to current page. Each item is a label
 * the user actually sees, and the canonical URL it links to.
 */

export interface Crumb { name: string; url: string }

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items || items.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
