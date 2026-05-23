/**
 * HeroPhoto — LCP-critical image for the home/about hero.
 *
 * Two paths:
 *  1) photoUrl points to /images/ellen-soul-hero.jpg (no admin override)
 *     → serve via plain <img srcset> with pre-generated sizes.
 *     Zero /_next/image overhead, ~16–30 KiB transferred on mobile.
 *
 *  2) photoUrl is a Vercel Blob URL (admin uploaded a new portrait)
 *     → serve directly from Blob CDN (single rendition, no responsive).
 *     Still no /_next/image overhead — Blob CDN is fast on cold path.
 */
type Props = {
  photoUrl: string;
  alt: string;
  /** logical display width in CSS pixels (the 1x size) */
  width: number;
  /** logical display height */
  height: number;
  className?: string;
};

const STATIC_BASE = "/images/ellen-soul-hero";

export default function HeroPhoto({ photoUrl, alt, width, height, className }: Props) {
  const isStatic = photoUrl.startsWith("/images/");

  if (isStatic) {
    // Pre-generated variants: 280, 310, 560, 620 px wide.
    // Pick the closest 1x source for the `src` fallback.
    const closest = width <= 295 ? 280 : 310;
    const sizes = `(max-width: 1024px) ${Math.min(width, 280)}px, ${width}px`;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`${STATIC_BASE}-${closest}.jpg`}
        srcSet={`${STATIC_BASE}-280.jpg 280w, ${STATIC_BASE}-310.jpg 310w, ${STATIC_BASE}-560.jpg 560w, ${STATIC_BASE}-620.jpg 620w`}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        fetchPriority="high"
        decoding="async"
        className={className}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
        }}
      />
    );
  }

  // Blob CDN — direct, no /_next/image transformation.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt={alt}
      width={width}
      height={height}
      fetchPriority="high"
      decoding="async"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "top",
      }}
    />
  );
}
