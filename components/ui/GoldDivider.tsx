import { cn } from "@/lib/utils";

interface GoldDividerProps {
  className?: string;
  width?: "full" | "short" | "medium";
}

export default function GoldDivider({ className, width = "full" }: GoldDividerProps) {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-[#C4A97A] to-transparent mx-auto",
        width === "short" && "max-w-[80px]",
        width === "medium" && "max-w-[240px]",
        width === "full" && "w-full",
        className
      )}
    />
  );
}
