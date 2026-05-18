import { MetadataRoute } from "next";

const BASE_URL = "https://tarot-olena.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { url: BASE_URL,                        priority: 1.0,  changeFrequency: "weekly"  as const },
    { url: `${BASE_URL}/about`,             priority: 0.9,  changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/services`,          priority: 0.95, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/blog`,              priority: 0.85, changeFrequency: "weekly"  as const },
    { url: `${BASE_URL}/studio`,             priority: 0.8,  changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/studio/natal-chart`, priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/studio/moon-phase`,  priority: 0.75, changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/studio/compatibility`,priority:0.7,  changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/studio/daily-card`,  priority: 0.7,  changeFrequency: "daily"   as const },
    { url: `${BASE_URL}/studio/numerology`,  priority: 0.7,  changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/faq`,               priority: 0.8,  changeFrequency: "monthly" as const },
    { url: `${BASE_URL}/contacts`,          priority: 0.9,  changeFrequency: "monthly" as const },
  ];

  const blogSlugs = [
    "znaky-karti-vidnosyny",
    "taro-zakohanykh-arkan",
    "chy-vartyi-vin-vashykh-slez",
    "misyats-emocii-astrolohiya",
    "pytannya-taro-pro-lyubov",
    "koly-vidstupy-karty-kazhuty-dosyt",
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    priority: 0.75,
    changeFrequency: "monthly" as const,
    lastModified: now,
  }));

  return [
    ...staticPages.map((p) => ({ ...p, lastModified: now })),
    ...blogPages,
  ];
}
