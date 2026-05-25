import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
