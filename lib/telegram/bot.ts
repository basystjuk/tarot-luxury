/**
 * Telegram Bot API helpers (Phase Д).
 *
 * Thin wrappers around the Bot API methods we actually use:
 *   - sendMessage
 *   - getChatMember (channel subscription check)
 *   - getMe (sanity check)
 *
 * All functions return either the parsed result or `null` on failure —
 * no throwing. The cron job iterates many users and one Telegram hiccup
 * shouldn't abort the run.
 *
 * Env vars:
 *   TELEGRAM_BOT_TOKEN       — from BotFather, never exposed to client
 *   TELEGRAM_CHANNEL_ID      — "@ellen_rouge" or numeric chat id of channel
 *   TELEGRAM_WEBHOOK_SECRET  — random string we set in the webhook URL +
 *                              verify in the X-Telegram-Bot-Api-Secret-Token
 *                              header on inbound updates
 */

const TG_BASE = "https://api.telegram.org";

function token(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

async function tgFetch<T = unknown>(method: string, params: Record<string, unknown>): Promise<T | null> {
  const t = token();
  if (!t) return null;
  try {
    const res = await fetch(`${TG_BASE}/bot${t}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`telegram ${method} failed:`, res.status, errText);
      return null;
    }
    const data = await res.json() as { ok: boolean; result?: T; description?: string };
    if (!data.ok) {
      console.error(`telegram ${method} not ok:`, data.description);
      return null;
    }
    return data.result ?? null;
  } catch (e) {
    console.error(`telegram ${method} threw:`, e);
    return null;
  }
}

/** Send a plain-text or Markdown message to a chat. */
export async function sendMessage(chatId: number | string, text: string, opts?: {
  parse_mode?: "MarkdownV2" | "HTML";
  disable_web_page_preview?: boolean;
  reply_markup?: unknown;
}): Promise<boolean> {
  const result = await tgFetch("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: opts?.parse_mode ?? "HTML",
    disable_web_page_preview: opts?.disable_web_page_preview ?? true,
    ...(opts?.reply_markup ? { reply_markup: opts.reply_markup } : {}),
  });
  return result !== null;
}

/** Check whether a user is a member of a channel (any role except "left"/"kicked"). */
export async function isChannelMember(userChatId: number | string): Promise<boolean | null> {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) return null;
  type ChatMember = { status: "creator" | "administrator" | "member" | "restricted" | "left" | "kicked" };
  const result = await tgFetch<ChatMember>("getChatMember", {
    chat_id: channelId,
    user_id: userChatId,
  });
  if (!result) return null;
  return ["creator", "administrator", "member", "restricted"].includes(result.status);
}

/** Sanity-check the token. Returns the bot username if OK. */
export async function getMe(): Promise<string | null> {
  type Me = { username?: string };
  const result = await tgFetch<Me>("getMe", {});
  return result?.username ?? null;
}

/** Bot deeplink for the cabinet "Connect Telegram" button. */
export function botDeeplink(token: string): string | null {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) return null;
  return `https://t.me/${username}?start=${encodeURIComponent(token)}`;
}

// ── Markdown escape helpers ────────────────────────────────────────────────
// Reserved for templates we might add later; HTML mode is enough for now.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
