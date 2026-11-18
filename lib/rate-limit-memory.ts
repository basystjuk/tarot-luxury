/**
 * In-memory counter: the fallback when the shared limiter (Supabase) is not
 * reachable. Each server instance counts on its own, so it is weaker, but a
 * database hiccup never removes the limits altogether.
 */

const MAX_TRACKED_KEYS = 5000;

export function consumeMemoryLimit(
  store: Map<string, { count: number; resetAt: number }>,
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): boolean {
  if (store.size >= MAX_TRACKED_KEYS) {
    for (const [k, entry] of store) if (entry.resetAt <= now) store.delete(k);
    // Still full of live keys: drop the oldest rather than grow without bound.
    if (store.size >= MAX_TRACKED_KEYS) store.delete(store.keys().next().value as string);
  }
  const entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return limit >= 1;
  }
  entry.count += 1;
  return entry.count <= limit;
}
