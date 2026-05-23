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
