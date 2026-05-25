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
import { initPostHog, trackPageview } from "@/lib/analytics/posthog";

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

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
