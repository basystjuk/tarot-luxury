'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { isToolEnabled, type ToolId } from "@/lib/tools-config";
import { STUDIO_TOOL_CARDS, studioToolTexts, type StudioToolOverride } from "@/lib/data/studio-tools";

export default function StudioPage() {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const [apiTools, setApiTools] = useState<StudioToolOverride[] | null>(null);
  const [toolsEnabled, setToolsEnabled] = useState<Partial<Record<ToolId, boolean>> | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then(d => {
        if (d.studio_tools?.length) setApiTools(d.studio_tools);
        if (d.tools_enabled) setToolsEnabled(d.tools_enabled);
        setPreviewMode(Boolean(d.preview));
      })
      .catch(() => {});
  }, []);

  // Order and built-in texts live in lib/data/studio-tools.ts (shared with the
  // admin, which can override any tool's title and description).
  const tools = STUDIO_TOOL_CARDS.map((card) => ({
    ...card,
    href: `/${language}/studio/${card.id}`,
    subtitle: isRu ? card.subtitle_ru : isEn ? card.subtitle_en : card.subtitle_uk,
  }));

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "С любовью" : isEn ? "With love" : "З любов'ю"}
            </span>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              Soul Studio
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Таро, астрология и нумерология — всё в одном месте."
                : isEn
                ? "Tarot, astrology and numerology — all in one place."
                : "Таро, астрологія та нумерологія — все в одному місці."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {tools
              // In preview mode show everything (with badge); otherwise hide
              // tools the admin has disabled.
              .filter((tool) => previewMode || isToolEnabled(tool.id, toolsEnabled))
              .map((tool, i) => {
              const disabled = !isToolEnabled(tool.id, toolsEnabled);
              const texts = studioToolTexts(tool, apiTools);
              const title = isRu ? texts.title_ru : isEn ? texts.title_en : texts.title_uk;
              const description = isRu ? texts.desc_ru : isEn ? texts.desc_en : texts.desc_uk;
              return (
              <AnimatedSection key={tool.href} delay={i * 0.1}>
                <Link href={tool.href} className="group block h-full">
                  <div className={`card-luxury h-full flex flex-col relative ${disabled ? 'ring-1 ring-[#C4A97A]/40' : ''}`}>
                    {disabled && previewMode && (
                      <span className="absolute top-3 right-3 text-[9px] tracking-[0.18em] uppercase bg-[#1C1512] text-[#C4A97A] px-2 py-0.5 rounded-full">
                        {isRu ? "Превью" : isEn ? "Preview" : "Прев'ю"}
                      </span>
                    )}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white text-3xl mb-6 transition-transform duration-300 group-hover:scale-110`} style={{ fontFamily: "var(--font-cormorant)" }}>
                      {tool.glyph}
                    </div>
                    <span className="text-xs text-[#C4A97A] tracking-[0.12em] uppercase mb-2" style={{ fontFamily: "var(--font-jost)" }}>{tool.subtitle}</span>
                    <h2 className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{title}</h2>
                    <p className="text-[#7A6A58] text-sm leading-relaxed flex-1 mb-6">{description}</p>
                    <div className="flex items-center gap-2 text-[#B8883A] text-sm mt-auto">
                      {isRu ? "Открыть" : isEn ? "Open" : "Відкрити"}
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
