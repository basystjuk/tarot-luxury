import ToolGate from "@/components/tools/ToolGate";
import ToolSchema from "@/components/seo/ToolSchema";

export default async function ToolLayout({
  children, params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const l = lang === "ru" ? "ru" : lang === "en" ? "en" : "uk";
  return (
    <>
      <ToolSchema id="daily-card" lang={l} />
      <ToolGate id="daily-card">{children}</ToolGate>
    </>
  );
}
