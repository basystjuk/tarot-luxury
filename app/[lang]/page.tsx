import { list } from "@vercel/blob";
import HomePageClient from "./HomePageClient";

const FALLBACK_PHOTO = "/images/ellen-soul-hero.jpg";

// ISR: regenerate at most once per hour, then serve from edge cache.
// Admin photo uploads appear within 1h without manual revalidation.
export const revalidate = 3600;

async function getPhotoUrl(): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return FALLBACK_PHOTO;
  try {
    const { blobs } = await list({ prefix: "ellen-soul-taro-konsultant" });
    const sorted = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return sorted[0]?.url ?? FALLBACK_PHOTO;
  } catch {
    return FALLBACK_PHOTO;
  }
}

export default async function HomePage() {
  const photoUrl = await getPhotoUrl();
  return <HomePageClient photoUrl={photoUrl} />;
}
