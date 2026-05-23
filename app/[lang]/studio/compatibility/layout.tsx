import ToolGate from "@/components/tools/ToolGate";

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return <ToolGate id="compatibility">{children}</ToolGate>;
}
