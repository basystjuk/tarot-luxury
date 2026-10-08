/**
 * Props for an inline `<script type="application/ld+json">`.
 *
 * JSON-LD carries text from the admin panel and YouTube, so `<` is escaped:
 * otherwise a string containing `</script>` would close the tag and let the
 * rest run as HTML on a public page. `<` is the same character to any
 * JSON parser, so search engines read identical data.
 */
export function jsonLd(data: unknown): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
