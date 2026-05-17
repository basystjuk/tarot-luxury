import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tarot-olena.com",
      },
    ],
  },
  // Enable strict mode for production safety
  reactStrictMode: true,
};

export default nextConfig;
