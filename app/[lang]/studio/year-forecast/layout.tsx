import ToolGate from "@/components/tools/ToolGate";

export default function YearForecastLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate id="year-forecast">{children}</ToolGate>;
}
