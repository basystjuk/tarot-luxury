import HomePageClient from "./HomePageClient";

// Hero photo is served as a static asset (4 pre-generated sizes in /public).
// Blob-uploaded admin photos are intentionally NOT used for the hero — direct
// Blob URLs require a healthy public store, and using /_next/image to proxy
// them adds 1-2s LCP delay on cold paths. To swap the hero photo, replace
// public/images/ellen-soul-hero-{280,310,560,620}.jpg via git.
const HERO_PHOTO = "/images/ellen-soul-hero.jpg";

export default function HomePage() {
  return <HomePageClient photoUrl={HERO_PHOTO} />;
}
