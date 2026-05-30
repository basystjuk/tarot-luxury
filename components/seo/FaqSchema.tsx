/**
 * FAQPage JSON-LD.
 *
 * Wins a Google rich snippet that expands FAQ questions inline in the
 * search result for queries that match. Each <Question, acceptedAnswer>
 * pair is a separate SERP feature, so a FAQ page with 5 questions can
 * dominate vertical screen real estate.
 *
 * Fed FAQs are server-loaded from the same source the page renders, so
 * markup and visible content never diverge (a Google ranking penalty if
 * they do).
 */

export interface FaqEntry { q: string; a: string }

export default function FaqSchema({ faqs }: { faqs: FaqEntry[] }) {
  if (!faqs || faqs.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
