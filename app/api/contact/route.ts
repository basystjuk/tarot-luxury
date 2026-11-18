import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SERVICES, type ServiceItem } from "@/lib/data/services";
import { loadPublicContent } from "@/lib/public-content";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";
import { cleanText, readJsonBody } from "@/lib/request-limits";

const MAX_LEADS_PER_HOUR = 5;
const BODY_LIMIT_BYTES = 16 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!(await consumeRateLimit("contact", clientIp(req), MAX_LEADS_PER_HOUR, 60 * 60))) {
      return NextResponse.json({ error: "rate_limit" }, { status: 429 });
    }

    const parsed = await readJsonBody(req, BODY_LIMIT_BYTES);
    if (parsed.deny) return parsed.deny;

    // Caps keep the assembled text under Telegram's 4096-character limit.
    const { contactType } = parsed.data;
    const name = cleanText(parsed.data.name, 100);
    const contact = cleanText(parsed.data.contact, 200);
    const topic = cleanText(parsed.data.topic, 200);
    const message = cleanText(parsed.data.message, 3000);
    const currency = cleanText(parsed.data.currency, 20);

    if (!name || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    // Support both TELEGRAM_CHAT_IDS (comma-separated) and legacy TELEGRAM_CHAT_ID
    const rawIds = process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID ?? "";
    const chatIds = rawIds.split(",").map(s => s.trim()).filter(Boolean);

    if (!token || !chatIds.length) {
      // Nowhere to deliver the lead — say so, so the form can point the
      // visitor to Ellen's direct contacts instead of a false "received".
      console.error("[contact] Telegram delivery is not configured — lead not delivered");
      return NextResponse.json({ error: "delivery_unavailable" }, { status: 503 });
    }

    // ── Topic → Russian title + price ─────────────────────────────────────
    // Names and prices as currently on the site (edited in the admin) — the
    // form offers those titles, so matching against code defaults would miss
    // renamed services and report stale prices.
    const content = await loadPublicContent();
    const services = (Array.isArray(content.services) && content.services.length > 0
      ? content.services
      : DEFAULT_SERVICES) as ServiceItem[];
    const matched = services.find(
      s => s.title_ru === topic || s.title_uk === topic || s.title_en === topic
    );
    const topicLine = matched
      ? `${matched.title_ru} ${matched.price}`
      : topic || "Личный запрос";

    // ── Contact line ───────────────────────────────────────────────────────
    const methodLabel =
      contactType === "whatsapp"  ? "WhatsApp"  :
      contactType === "instagram" ? "Instagram" : "Telegram";

    // ── Assemble message ───────────────────────────────────────────────────
    const parts: string[] = [
      `❤️ *${esc(topicLine)}*`,
      ``,
      `👤 Name: ${esc(name)}`,
      `📲 ${methodLabel} ${esc(contact)}`,
    ];

    if (currency) {
      parts.push(`💲 ${esc(currency)}`);
    }

    if (message) {
      parts.push(``, `📜 ${esc(message)}`);
    }

    const text = parts.join("\n");

    // Send to all allowed chat IDs
    const results = await Promise.all(
      chatIds.map(id =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: id, text, parse_mode: "Markdown" }),
        })
      )
    );

    const failed = results.filter(r => !r.ok);
    if (failed.length) {
      const errs = await Promise.all(failed.map(r => r.text()));
      console.error("Telegram errors:", errs);
    }
    if (failed.length === results.length) {
      // Not a single recipient got it — the lead would be lost silently.
      return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Escape only Telegram MarkdownV1 special chars: _ * ` [
 * Do NOT escape +, -, ., etc. — they are plain text in MarkdownV1.
 */
function esc(text: string): string {
  return text.replace(/[_*`[]/g, "\\$&");
}
