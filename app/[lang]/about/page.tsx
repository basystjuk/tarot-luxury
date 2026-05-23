import { list } from "@vercel/blob";
import AboutPageClient from "./AboutPageClient";

const FALLBACK_PHOTO = "/images/ellen-soul-hero.jpg";

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

export default async function AboutPage() {
  const photoUrl = await getPhotoUrl();
  return <AboutPageClient photoUrl={photoUrl} />;
}
