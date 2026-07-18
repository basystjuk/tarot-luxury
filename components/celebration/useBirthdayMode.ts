"use client";

/**
 * Shared client hook for Birthday Mode. One module-level cached fetch of
 * /api/celebration is reused by every consumer (atmosphere, footer scene,
 * browser signals), so the living-site layer costs a single tiny request.
 */

import { useEffect, useState } from "react";
import {
  DEFAULT_CELEBRATION,
  normalizeCelebration,
  isCelebrationActive,
  todayLocalISO,
  type CelebrationConfig,
} from "@/lib/celebration";

let cached: Promise<CelebrationConfig> | null = null;

function loadConfig(): Promise<CelebrationConfig> {
  if (!cached) {
    cached = fetch("/api/celebration", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => normalizeCelebration(j?.celebration))
      .catch(() => DEFAULT_CELEBRATION);
  }
  return cached;
}

export interface BirthdayMode {
  config: CelebrationConfig | null;
  /** enabled AND today within the date window. */
  active: boolean;
  /** active AND the living-site layer is switched on. */
  atmosphere: boolean;
  ready: boolean;
}

export function useBirthdayMode(): BirthdayMode {
  const [config, setConfig] = useState<CelebrationConfig | null>(null);

  useEffect(() => {
    let alive = true;
    loadConfig().then((c) => {
      if (alive) setConfig(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  const active = !!config && isCelebrationActive(config, todayLocalISO());
  return {
    config,
    active,
    atmosphere: active && !!config?.atmosphere,
    ready: config !== null,
  };
}
