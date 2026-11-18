/**
 * Client-side calls to the admin API.
 *
 * Access relies on the httpOnly session cookie set by /api/admin/login. No
 * password or secret belongs in this file: everything here ships to the browser.
 */

/** Fired when the server no longer accepts the session, to show sign-in again. */
export const ADMIN_SESSION_EXPIRED_EVENT = "ellen-admin-session-expired";

export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(input, { cache: "no-store", ...init });
  if (res.status === 401) window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  return res;
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
