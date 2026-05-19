import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SERVICES } from "@/lib/data/services";

export async function POST(req: NextRequest) {
  try {
    const { name, contactType, contact, topic, message, currency } =
      await req.json();

    if (!name?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token  = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ ok: true });
    }

    // ── Topic → Russian title + price ─────────────────────────────────────
    const matched = DEFAULT_SERVICES.find(
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
      `👤 Name: ${esc(name.trim())}`,
      `📲 ${methodLabel} ${esc(contact.trim())}`,
    ];

    if (currency?.trim()) {
      parts.push(`💲 ${esc(currency.trim())}`);
    }

    if (message?.trim()) {
      parts.push(``, `📜 ${esc(message.trim())}`);
    }

    const text = parts.join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      }
    );

    if (!res.ok) {
      console.error("Telegram error:", await res.text());
      return NextResponse.json({ error: "Telegram error" }, { status: 500 });
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
