import type { ReactNode } from "react";
import ToolSchema from "@/components/seo/ToolSchema";

export default async function HoroscopeLayout({
  children, params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang === "ru" ? "ru" : lang === "en" ? "en" : "uk";
  return (
    <>
      <ToolSchema id="horoscope" lang={l} />
      {children}
    </>
  );
}
