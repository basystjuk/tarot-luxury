"use client";

/**
 * Read the current user's profile (Phase В).
 *
 * Lightweight client-side hook. Returns `{ profile, loading, refresh }`.
 * If the user is signed out, `profile` is `null` and `loading` is `false` —
 * callers can fall back to localStorage (Moon Guide natal data) or just
 * leave the form blank (Numerology).
 *
 * The fetch is cached in module-level state for the lifetime of the page;
 * mounting the hook a second time returns the cached value immediately
 * while still kicking a background refresh.
 */

import { useCallback, useEffect, useState } from "react";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  birth_lat: number | null;
  birth_lon: number | null;
  birth_tz: string | null;
  natal_moon_lon: number | null;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  subscribed_to_channel: boolean;
}

let cachedProfile: Profile | null | undefined; // undefined = never fetched

export function useProfile(): {
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [profile, setProfile] = useState<Profile | null>(cachedProfile ?? null);
  const [loading, setLoading] = useState(cachedProfile === undefined);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/account/profile", { cache: "no-store" });
      if (res.status === 401 || res.status === 503) {
        cachedProfile = null;
        setProfile(null);
        return;
      }
      const data = await res.json();
      cachedProfile = (data.profile as Profile) ?? null;
      setProfile(cachedProfile);
    } catch {
      cachedProfile = null;
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cachedProfile === undefined) {
      fetchProfile();
    } else {
      // Already cached — silently refresh in background.
      fetchProfile();
    }
  }, [fetchProfile]);

  return { profile, loading, refresh: fetchProfile };
}

/** Drop the cached profile (call after sign-out or successful save). */
export function invalidateProfileCache(): void {
  cachedProfile = undefined;
}
