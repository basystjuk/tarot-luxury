/**
 * IndexNow client.
 *
 * Pings IndexNow-supporting search engines (Bing, Yandex, Naver, Seznam,
 * Yep) the moment new content lands. One push reaches the whole IndexNow
 * federation, so we send the canonical "api.indexnow.org" endpoint.
 *
 * The key file at /<KEY>.txt must contain only the key text; we publish
 * it under public/. Bing verifies ownership by fetching that URL.
 *
 * No-op when no key is configured. Errors swallowed — indexing is
 * best-effort, never block the user-facing flow on it.
 */

export const INDEXNOW_KEY = "2c1552baa71894d5f5acf619039f218e";
const HOST = "ellen-soul.com";
const KEY_URL = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/** Submit up to 10 000 URLs to IndexNow in one call. Returns whether
 *  the call was attempted (false = misconfigured / empty / dev). */
export async function indexNowSubmit(urls: string[]): Promise<{ ok: boolean; status?: number; error?: string }> {
  const list = Array.from(new Set(urls.filter((u) => u.startsWith(`https://${HOST}/`)))).slice(0, 10000);
  if (list.length === 0) return { ok: false, error: "no_urls" };
  if (process.env.NODE_ENV !== "production") {
    return { ok: false, error: "non_production" };
  }
  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_URL,
        urlList: list,
      }),
    });
    // 200 / 202 = accepted; 422 = invalid (still log); 429 = rate-limited.
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Convenience: ping the journal page when new videos sync, including the
 *  three locale variants so each canonical URL is announced. */
export function journalUrls(): string[] {
  return [
    `https://${HOST}/uk/blog`,
    `https://${HOST}/ru/blog`,
    `https://${HOST}/en/blog`,
    `https://${HOST}/sitemap-videos.xml`,
  ];
}
