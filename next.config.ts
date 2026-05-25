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

// ── Supabase project defaults (Phase В) ─────────────────────────────────────
// URL + anon key are public by Supabase's security model — every Supabase
// SDK call from the browser sends them, and Row Level Security on the
// database side enforces who can read/write what. Baking them in means
// no Vercel env-var setup is required for the auth/profile cabinet to work.
// SUPABASE_SERVICE_ROLE_KEY is the real secret and is NEVER baked here —
// it stays in Vercel env only.
const SUPABASE_URL_DEFAULT  = "https://mkwchhvaaycmuvlsitfn.supabase.co";
const SUPABASE_ANON_DEFAULT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd2NoaHZhYXljbXV2bHNpdGZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDUwMTYsImV4cCI6MjA5NTI4MTAxNn0.I4oLt7KTaN_GPGWgWNf4F_Nlgr2QIaWt32MunQOm2OY";

// Telegram channel + bot username are also public — only the bot TOKEN is
// secret. Channel handle is whatever Ellen uses; bot username is fixed by
// BotFather. Set TELEGRAM_BOT_TOKEN in Vercel env to activate notifications.
const TELEGRAM_CHANNEL_DEFAULT  = "@ellen_rouge";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_POSTHOG_KEY:       process.env.NEXT_PUBLIC_POSTHOG_KEY       ?? POSTHOG_KEY_DEFAULT,
    NEXT_PUBLIC_POSTHOG_HOST:      process.env.NEXT_PUBLIC_POSTHOG_HOST      ?? POSTHOG_HOST_DEFAULT,
    NEXT_PUBLIC_SUPABASE_URL:      process.env.NEXT_PUBLIC_SUPABASE_URL      ?? SUPABASE_URL_DEFAULT,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_ANON_DEFAULT,
    TELEGRAM_CHANNEL_ID:           process.env.TELEGRAM_CHANNEL_ID           ?? TELEGRAM_CHANNEL_DEFAULT,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ellen-soul.com" },
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
