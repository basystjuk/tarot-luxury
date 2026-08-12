"use client";

/**
 * PostHog provider — mounted once at the root layout.
 *
 * Initialises PostHog on first client mount, then renders a small
 * page-view tracker that emits one $pageview event per App-Router
 * navigation (Next.js doesn't fire a real navigation event we can
 * listen to, so we watch pathname + searchParams).
 *
 * Suspense wraps the tracker because `useSearchParams()` triggers the
 * "should be wrapped in Suspense" warning in Next.js 16. The suspense
 * boundary has no fallback because PostHog tracking is invisible.
 */

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  initPostHog, trackPageview, track, identifyUser, resetAnalyticsIdentity,
} from "@/lib/analytics/posthog";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageview(url);
  }, [pathname, searchParams]);
  return null;
}

/**
 * Ties events to a stable person once someone is signed in.
 *
 * PostHog runs with `person_profiles: "identified_only"`, and identify() was
 * never called anywhere — so no person profiles existed at all, which makes
 * retention and any cross-session funnel impossible to compute. Signed-out
 * visitors stay anonymous exactly as before.
 *
 * The Supabase user id is an opaque UUID and it is the ONLY thing sent.
 * No email, no name, no birth date — those are the PII this project must not
 * hand to a third party (owner's call, 2026-08-12).
 *
 * Sign-up and sign-in are one magic-link flow, so a brand-new account is
 * recognised by how recently Supabase created the user rather than by a
 * separate callback.
 */
type AuthedUser = { id: string; created_at?: string };

function IdentityTracker() {
  useEffect(() => {
    const supa = getSupabaseBrowser();
    if (!supa) return;
    let currentId: string | null = null;

    const apply = (user: AuthedUser | null) => {
      if (!user) {
        if (currentId) { resetAnalyticsIdentity(); currentId = null; }
        return;
      }
      if (user.id === currentId) return;
      currentId = user.id;
      identifyUser(user.id);                       // UUID only — no traits
      const createdMs = user.created_at ? Date.parse(user.created_at) : NaN;
      const isNew = Number.isFinite(createdMs) && Date.now() - createdMs < 120_000;
      track(isNew ? "account_created" : "signed_in");
    };

    supa.auth
      .getUser()
      .then((res: { data: { user: AuthedUser | null } }) => apply(res.data.user ?? null))
      .catch(() => { /* analytics must never break auth */ });

    const { data: sub } = supa.auth.onAuthStateChange(
      (_event: string, session: { user?: AuthedUser | null } | null) =>
        apply(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <IdentityTracker />
      {children}
    </>
  );
}
