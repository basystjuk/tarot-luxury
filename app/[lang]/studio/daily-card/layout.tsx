import ToolGate from "@/components/tools/ToolGate";

export default function DailyCardLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate id="daily-card">{children}</ToolGate>;
}
