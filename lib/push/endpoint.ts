/**
 * Which Web Push endpoints the server may call. A subscription is client input,
 * so without this list any signed-in user could point our server at an
 * arbitrary address (or at one that never answers and stalls the daily cron).
 */

const EXACT_HOSTS = new Set(["fcm.googleapis.com"]);
const HOST_SUFFIXES = [".push.apple.com", ".push.services.mozilla.com", ".notify.windows.com"];

export function isAllowedPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length > 1024) return false;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  return EXACT_HOSTS.has(host) || HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

/** Base64url subscription key of a sane length. */
export function isValidPushKey(key: unknown): key is string {
  return typeof key === "string" && key.length <= 128 && /^[A-Za-z0-9_-]+={0,2}$/.test(key);
}
