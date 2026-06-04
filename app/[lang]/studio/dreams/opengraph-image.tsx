import { renderToolOg } from "@/lib/seo/og-tool";
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ellen Soul · Сонник";
export default async function OG({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return renderToolOg("dreams", lang);
}
