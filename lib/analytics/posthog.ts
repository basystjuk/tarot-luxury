/**
 * PostHog analytics wrapper (Phase B).
 *
 * Single import point for all event tracking. If PostHog isn't configured
 * (env vars missing), every call is a no-op — so the rest of the app can
 * freely call `track("event_name", {...})` without conditional checks and
 * without errors in dev / preview / fresh forks.
 *
 * Privacy posture:
 *   - We never log personally identifying info — no full names, no
 *     birthdates, no questions the user typed into a card or moon form.
 *   - Anonymous distinct_id is auto-managed by PostHog (cookieless on
 *     first visit if the browser blocks cookies).
 *   - Reverse-proxied through /ingest (see next.config.ts) so adblockers
 *     don't drop events on the network path.
 *
 * Event taxonomy (kept tight on purpose — analytics rot when too rich):
 *   tool_viewed              { tool }
 *   daily_card_drawn         { reversed, has_question, arcana }
 *   daily_card_clarify_used  { reversed, arcana }
 *   daily_card_pdf_shared    { from }                    // "current" | "history"
 *   daily_card_weekly_drawn  { reversed, arcana }
 *   numerology_calculated    { life_path, has_master_number, has_karmic_debt }
 *   numerology_expanded      {}
 *   moon_event_calculated    { sign }
 *   moon_natal_saved         {}                          // no birth details, just the action
 *   moon_natal_cleared       {}
 *   moon_ai_message_open     { sign }
 *   moon_recs_requested      { sign }
 *   cta_book_session         { from }                    // surface name
 */

import posthog from "posthog-js";

let initialised = false;

export function initPostHog(): void {
  if (typeof window === "undefined") return;
  if (initialised) return;
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";
  if (!key) return; // not configured — silently disabled
  posthog.init(key, {
    api_host: host,
    ui_host: "https://eu.posthog.com",
    capture_pageview: false,         // we send pageviews manually per-route
    capture_pageleave: true,
    autocapture: true,
    person_profiles: "identified_only", // anonymous unless we ever call identify()
    persistence: "localStorage+cookie",
    // Session recording disabled — it captures every click/scroll on the
    // page and uploads it as a replayable video. Useful for debugging UX
    // bugs, but eats both PostHog's event budget and the user's bandwidth.
    // Re-enable per-incident by setting NEXT_PUBLIC_POSTHOG_REPLAY=1.
    disable_session_recording: process.env.NEXT_PUBLIC_POSTHOG_REPLAY !== "1",
    loaded: () => {
      initialised = true;
    },
  });
  initialised = true;
}

/** Track an event. Safe to call before init (call queues until ready). */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch { /* never let analytics break the app */ }
}

/** Manually record a pageview — called from PostHogPageView on route change. */
export function trackPageview(url: string): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture("$pageview", { $current_url: url });
  } catch { /* */ }
}

/** Reset distinct_id on logout (used in Phase В with Supabase). */
export function resetAnalyticsIdentity(): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try { posthog.reset(); } catch { /* */ }
}

/** Identify the current visitor by a stable user id (Phase В). */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try { posthog.identify(userId, traits); } catch { /* */ }
}
