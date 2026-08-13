"use client";

/**
 * Tropical or sidereal — one setting, read by every tool.
 *
 * The toggle already existed in the Moon Guide and was already persisted to
 * `localStorage["ellen-soul:zodiac"]`, but only the Moon Guide's natal block
 * honoured it. A visitor who switched to sidereal saw their Sun in one sign
 * there and another sign on the natal chart, the horoscope, the year forecast
 * and the compatibility tool — a ~24° difference (the Lahiri ayanamsa) with
 * nothing to explain it. Owner's decision (2026-08-13): it applies everywhere.
 *
 * Deliberately not React Context: these tools are separate route segments that
 * never share a provider, so the shared surface has to be the storage key plus
 * a subscription. `storage` events cover other tabs; a module-level listener
 * set covers components in this one.
 */

import { useCallback, useEffect, useState } from "react";
import type { ZodiacMode } from "@/lib/astro/natal-snapshot";

export type { ZodiacMode };

const STORAGE_KEY = "ellen-soul:zodiac";

function read(): ZodiacMode {
  if (typeof window === "undefined") return "tropical";
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "sidereal" ? "sidereal" : "tropical";
  } catch {
    return "tropical";
  }
}

/** Components in THIS tab, so a change in one panel repaints the others. */
const listeners = new Set<(m: ZodiacMode) => void>();

export function useZodiacMode(): [ZodiacMode, (m: ZodiacMode) => void] {
  // Always start "tropical" so server and first client render agree; the real
  // value lands in the effect below. Reading localStorage during render is a
  // hydration mismatch waiting to happen.
  const [mode, setMode] = useState<ZodiacMode>("tropical");

  useEffect(() => {
    setMode(read());

    const onLocal = (m: ZodiacMode) => setMode(m);
    listeners.add(onLocal);

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setMode(read());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      listeners.delete(onLocal);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback((m: ZodiacMode) => {
    try { window.localStorage.setItem(STORAGE_KEY, m); } catch { /* private mode */ }
    for (const fn of listeners) fn(m);
  }, []);

  return [mode, update];
}
