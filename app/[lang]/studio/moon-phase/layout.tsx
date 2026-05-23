import ToolGate from "@/components/tools/ToolGate";

export default function MoonPhaseLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate id="moon-phase">{children}</ToolGate>;
}
