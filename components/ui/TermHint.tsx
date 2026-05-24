"use client";

/**
 * Shared inline term-tooltip used across Soul Studio tools (numerology,
 * moon-phase, etc.). Renders the children with a little Info icon next to
 * them; tap/click (mobile) or hover (desktop) reveals a popover.
 *
 * Rendered via React Portal into <body> so it never clips inside parent
 * containers with overflow:hidden or transforms (e.g. inside a closed
 * <details> summary). Position is computed relative to the trigger button
 * and clamped to the viewport so it stays fully visible on every edge.
 *
 * `textTransform: none` + `normal-case` prevent inheritance from labels
 * styled with the `uppercase` class.
 *
 * Originally lived in app/[lang]/studio/numerology/_components.tsx; lifted
 * here when the moon-phase tool started reusing the pattern. Numerology
 * still re-exports it from its _components.tsx so existing imports work.
 */

import { useState, useId, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

export function TermHint({ children, hint }: { children: React.ReactNode; hint: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  // Defer portal creation to after first client mount so SSR doesn't try
  // to render into a non-existent document.body. setState-in-effect is the
  // accepted "hydrated yet?" pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const openTip = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipWidth = Math.min(280, window.innerWidth - 16);
    const center = rect.left + rect.width / 2;
    let left = center - tipWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));
    setPos({ top: rect.bottom + 8, left, width: tipWidth });
    setOpen(true);
  }, []);

  const closeTip = useCallback(() => setOpen(false), []);

  // Close on scroll/resize — trigger may move and the fixed-position tooltip
  // would drift. Cheaper than recomputing on every scroll event.
  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", closeTip, true);
    window.addEventListener("resize", closeTip);
    return () => {
      window.removeEventListener("scroll", closeTip, true);
      window.removeEventListener("resize", closeTip);
    };
  }, [open, closeTip]);

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {children}
      <button
        ref={btnRef}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-label={hint}
        onClick={(e) => { e.preventDefault(); if (open) closeTip(); else openTip(); }}
        onBlur={closeTip}
        onMouseEnter={openTip}
        onMouseLeave={closeTip}
        className="inline-flex items-center justify-center text-[#C4A97A] hover:text-[#B8883A] transition-colors flex-shrink-0"
      >
        <Info size={13} aria-hidden="true" />
      </button>
      {mounted && open && pos && createPortal(
        <span
          id={id}
          role="tooltip"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
            fontFamily: "var(--font-cormorant)",
            fontSize: "13px",
            textTransform: "none",
            letterSpacing: "normal",
            lineHeight: 1.45,
          }}
          className="p-3 rounded-lg bg-[#1C1512] text-white/95 shadow-2xl border border-[rgba(196,169,122,0.4)] pointer-events-none normal-case"
        >
          {hint}
        </span>,
        document.body,
      )}
    </span>
  );
}
