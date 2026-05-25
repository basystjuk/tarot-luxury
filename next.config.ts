import type { NextConfig } from "next";

// ── PostHog defaults baked at build time ────────────────────────────────────
// `NEXT_PUBLIC_*` env vars are inlined into the client bundle by design and
// visible to every visitor (PostHog officially supports this — see
// https://posthog.com/docs/libraries/js). We ship the project key as a build-
// time default so analytics work without any Vercel env-var configuration.
//
// If you ever rotate the key or fork the project, just override via Vercel
// env vars — Vercel env values take priority over this default.
const POSTHOG_KEY_DEFAULT  = "phc_qoKe2aS3cw2kEsxnja8JpeXqRckn8WmRU3b9aT7QkVbe";
const POSTHOG_HOST_DEFAULT = "/ingest"; // reverse-proxy via the rewrites below

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_POSTHOG_KEY:  process.env.NEXT_PUBLIC_POSTHOG_KEY  ?? POSTHOG_KEY_DEFAULT,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? POSTHOG_HOST_DEFAULT,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "tarot-olena.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    // WebP only — AVIF encoding on Vercel free tier first-hit takes 5–10s
    // and blows up LCP. WebP first-hit is sub-second.
    formats: ["image/webp"],
    minimumCacheTTL: 86400,
  },
  reactStrictMode: true,
  compress: true,
  // Reverse-proxy PostHog through /ingest so ad-blockers don't strip
  // analytics requests. The SDK is configured with `api_host: "/ingest"`,
  // so all event POSTs hit our own origin and we forward them to PostHog
  // EU. The /static/* rewrite covers the SDK bootstrap files.
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*",        destination: "https://eu.i.posthog.com/:path*" },
      { source: "/ingest/decide",        destination: "https://eu.i.posthog.com/decide" },
    ];
  },
  // Required when reverse-proxying PostHog through Next.js rewrites — the
  // SDK relies on exact paths without trailing-slash redirects.
  skipTrailingSlashRedirect: true,
  experimental: {
    // Tree-shake icons and Radix subpackages.
    // framer-motion EXCLUDED — its package structure conflicts with optimizePackageImports
    // and can cause large TBT regressions.
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-tabs",
    ],
  },
};

export default nextConfig;
