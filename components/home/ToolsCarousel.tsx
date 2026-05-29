"use client";

/**
 * Soul Studio carousel — infinite (looping) horizontal strip with prev/next
 * buttons AND native swipe/scroll.
 *
 * Loop technique: render the items 3× and keep the scroll position inside the
 * middle copy. Because all three copies are identical, repositioning by exactly
 * one copy-width when the user drifts past a copy boundary is visually seamless
 * — the content under the viewport is the same before and after the jump.
 *
 * Buttons scroll by one card; the same boundary-wrap keeps them infinite.
 */

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselTool {
  href: string; glyph: string; accent: string;
  title: string; subtitle: string; desc: string;
}

export default function ToolsCarousel({ tools, openLabel }: { tools: CarouselTool[]; openLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Loop only when there are enough cards to make a copy meaningful.
  const looping = tools.length > 2;
  const rendered = looping ? [...tools, ...tools, ...tools] : tools;

  // Width of ONE copy (cards + gaps), measured exactly so padding cancels.
  const copyWidth = useCallback(() => {
    const el = ref.current;
    if (!el || el.children.length === 0) return 0;
    const first = el.children[0] as HTMLElement;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 20;
    return (first.offsetWidth + gap) * tools.length;
  }, [tools.length]);

  const recenter = useCallback(() => {
    const el = ref.current;
    if (!el || !looping) return;
    el.scrollLeft = copyWidth(); // start of the middle copy
  }, [looping, copyWidth]);

  useEffect(() => {
    // Recenter after layout settles (fonts/images can shift widths).
    const id = setTimeout(recenter, 60);
    window.addEventListener("resize", recenter);
    return () => { clearTimeout(id); window.removeEventListener("resize", recenter); };
  }, [recenter]);

  // Seamless boundary wrap on any scroll (drag, wheel, button).
  useEffect(() => {
    const el = ref.current;
    if (!el || !looping) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const one = copyWidth();
        if (one <= 0) return;
        if (el.scrollLeft < one - 1) el.scrollLeft += one;
        else if (el.scrollLeft >= 2 * one - 1) el.scrollLeft -= one;
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [looping, copyWidth]);

  const step = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 20;
    const card = first ? first.offsetWidth + gap : 280;
    el.scrollBy({ left: dir * card, behavior: "smooth" });
  }, []);

  return (
    <div className="relative">
      {/* Prev / Next controls */}
      <button
        type="button" aria-label="Previous" onClick={() => step(-1)}
        className="absolute left-1 lg:-left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 border border-[rgba(196,169,122,0.4)] text-[#9A6E28] shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button" aria-label="Next" onClick={() => step(1)}
        className="absolute right-1 lg:-right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 border border-[rgba(196,169,122,0.4)] text-[#9A6E28] shadow-md flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
      >
        <ChevronRight size={20} />
      </button>

      <div className="-mx-6 lg:mx-0">
        <div
          ref={ref}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {rendered.map((tool, i) => (
            <div key={`${tool.href}-${i}`} className="snap-start flex-shrink-0 w-[78vw] sm:w-[44vw] lg:w-[calc(25%-1rem)]">
              <Link href={tool.href} className="group block h-full">
                <div className="h-full flex flex-col p-7 rounded-2xl border border-[rgba(196,169,122,0.2)] bg-white/60 hover:bg-white/90 hover:border-[rgba(196,169,122,0.4)] transition-all duration-300 shadow-sm">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.accent} flex items-center justify-center text-white text-2xl mb-5 transition-transform duration-300 group-hover:scale-110`}
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {tool.glyph}
                  </div>
                  <span className="text-xs text-[#C4A97A] tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-jost)" }}>
                    {tool.subtitle}
                  </span>
                  <h3
                    className="text-2xl text-[#1C1512] mb-3 group-hover:text-[#B8883A] transition-colors"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {tool.title}
                  </h3>
                  <p className="text-[#7A6A58] text-sm leading-relaxed flex-1 mb-5">{tool.desc}</p>
                  <div className="flex items-center gap-2 text-[#C4A97A] text-sm mt-auto">
                    {openLabel}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
