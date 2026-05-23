"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ALL_TOOL_IDS, type ToolId } from "@/lib/tools-config";
import { useLanguage } from "@/hooks/useLanguage";

type GateState = "loading" | "open" | "blocked";

interface ToolGateProps {
  id: ToolId;
  children: React.ReactNode;
}

/**
 * Wrap a tool page in <ToolGate id="..."> ... </ToolGate>.
 *
 *   - Fetches /api/content (cached; cheap).
 *   - If the tool is enabled, renders children.
 *   - If disabled and the visitor has no preview cookie, renders a polished
 *     "Coming Soon" stub instead of the real tool.
 *   - In preview mode, a small badge is shown so the owner can tell they're
 *     looking at a disabled tool.
 */
export default function ToolGate({ id, children }: ToolGateProps) {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const [state, setState] = useState<GateState>("loading");
  const [previewActive, setPreviewActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const enabledMap: Partial<Record<ToolId, boolean>> = d?.tools_enabled ?? {};
        // Default enabled if the API doesn't know about this tool yet.
        const enabled = enabledMap[id] !== false;
        const preview = Boolean(d?.preview);
        setPreviewActive(preview);
        setState(enabled || preview ? "open" : "blocked");
      })
      .catch(() => {
        // On API failure, fail open — better to show the tool than to break
        // public pages because of a transient blob fetch.
        if (!cancelled) setState("open");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="w-8 h-8 rounded-full border-2 border-[#C4A97A]/30 border-t-[#C4A97A] animate-spin" />
      </div>
    );
  }

  if (state === "blocked") {
    return <ComingSoon language={language} />;
  }

  return (
    <>
      {previewActive && (
        <div className="fixed top-3 right-3 z-[60] pointer-events-none">
          <div className="bg-[#1C1512] text-[#C4A97A] text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border border-[#C4A97A]/40 shadow-lg">
            {isRu ? "Режим превью" : isEn ? "Preview mode" : "Режим прев'ю"}
          </div>
        </div>
      )}
      {children}
    </>
  );

  function ComingSoon({ language }: { language: string }) {
    const isRu = language === "ru";
    const isEn = language === "en";
    return (
      <section className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 py-24">
        <div className="max-w-xl w-full text-center">
          <div className="text-6xl mb-8" style={{ fontFamily: "var(--font-cormorant)" }}>
            ✦
          </div>
          <p className="text-[#C4A97A] text-xs tracking-[0.22em] uppercase mb-4">
            {isRu ? "Готується" : isEn ? "In the works" : "Готується"}
          </p>
          <h1
            className="text-4xl text-[#1C1512] mb-6 leading-tight"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
          >
            {isRu
              ? "Інструмент скоро з'явиться"
              : isEn
              ? "This tool is coming soon"
              : "Інструмент скоро з'явиться"}
          </h1>
          <p className="text-[#7A6A58] leading-relaxed mb-10">
            {isRu
              ? "Я дорабатываю этот инструмент, чтобы он работал на совесть. Возвращайтесь скоро — а пока загляните в Soul Studio: там уже всё готово."
              : isEn
              ? "I'm polishing this tool so it works the way it should. Come back soon — meanwhile, the rest of Soul Studio is ready for you."
              : "Я допрацьовую цей інструмент, щоб він працював на совість. Повертайтесь скоро — а поки загляньте в Soul Studio: там уже все готово."}
          </p>
          <Link
            href={`/${language}/studio`}
            className="inline-flex items-center gap-2 text-[#B8883A] hover:text-[#1C1512] transition-colors text-sm tracking-wide"
          >
            <ArrowLeft size={15} />
            {isRu ? "В Soul Studio" : isEn ? "Back to Soul Studio" : "До Soul Studio"}
          </Link>
        </div>
      </section>
    );
  }
}

// Re-export helpers so future code can rely on a single import surface.
export { ALL_TOOL_IDS };
export type { ToolId };
