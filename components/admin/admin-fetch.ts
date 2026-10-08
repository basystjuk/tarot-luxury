/**
 * Client-side calls to the admin API.
 *
 * Access still relies on the shared admin password header (to be replaced by
 * per-person accounts) — kept in this one module rather than in every page.
 */

export const ADMIN_PASSWORD = "ellensoul2025";

export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("x-admin-password", ADMIN_PASSWORD);
  return fetch(input, { cache: "no-store", ...init, headers });
}

/** Plain-language versions of the API's error codes. */
const HUMAN: Record<string, string> = {
  no_admin_client: "Немає підключення до бази даних (ключ Supabase не налаштовано)",
  Unauthorized: "Немає доступу — увійдіть в адмінку знову",
  "Not found": "Немає доступу або розділ недоступний — оновіть сторінку",
  "Blob storage not configured": "Сховище файлів не налаштовано",
  "Blob not configured": "Сховище файлів не налаштовано",
  telegram_not_configured: "Telegram-бот не налаштовано",
  not_linked: "Користувач не підключив Telegram",
  not_configured: "Сервіс не налаштовано",
  db_error: "Помилка бази даних",
  preview_read_only: "Це прев'ю-деплой: зміни вимкнено, бо сховище спільне з живим сайтом",
};

/** Readable message from a failed response ("409: …"). */
export async function responseError(res: Response): Promise<string> {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json();
      const raw = j?.message || j?.error || JSON.stringify(j);
      return `${res.status}: ${HUMAN[j?.error] ?? HUMAN[raw] ?? raw}`;
    }
    if (res.status === 404) return `404: ${HUMAN["Not found"]}`;
    const txt = await res.text();
    return `${res.status}: ${txt.slice(0, 200) || res.statusText}`;
  } catch {
    return `${res.status}: ${res.statusText || "Unknown"}`;
  }
}

/**
 * The users/videos admin APIs authorise via the preview cookie — set it before
 * calling them (idempotent). Awaited, so the first request never races it.
 */
export async function ensureAdminCookie(): Promise<void> {
  await adminFetch("/api/admin/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: true }),
  });
}

/** Lets the browser save `data` as a JSON file. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
