/**
 * PWA manifest (Phase M12).
 *
 * Lets users install Ellen Soul as an app and — more importantly —
 * enables web-push notifications on iOS (16.4+) and all desktop browsers.
 *
 * Icons currently re-use the favicon; proper 192/512 PNGs can be added
 * later without affecting push behaviour.
 */

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ellen Soul — Тарологічна студія",
    short_name: "Ellen Soul",
    description: "Особистий гороскоп, натальна карта, нумерологія, таро та місячний провідник.",
    start_url: "/uk/studio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0b09",
    theme_color: "#0e0b09",
    lang: "uk",
    categories: ["lifestyle", "education"],
    icons: [
      { src: "/favicon.ico", sizes: "any",   type: "image/x-icon" },
      { src: "/images/ellen-soul-hero-280.jpg", sizes: "280x280", type: "image/jpeg", purpose: "any" },
    ],
  };
}
