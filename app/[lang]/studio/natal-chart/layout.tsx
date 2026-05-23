import ToolGate from "@/components/tools/ToolGate";

export default function NatalChartLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate id="natal-chart">{children}</ToolGate>;
}
