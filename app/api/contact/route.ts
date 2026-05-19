import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SERVICES } from "@/lib/data/services";

export async function POST(req: NextRequest) {
  try {
    const { name, contactType, contact, topic, message, currency } =
      await req.json();

    if (!name?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      // Silently succeed if not configured (dev/preview)
      return NextResponse.json({ ok: true });
    }

    // ── Resolve topic → Russian title + price ──────────────────────────────
    const matched = DEFAULT_SERVICES.find(
      s =>
        s.title_ru === topic ||
        s.title_uk === topic ||
        s.title_en === topic
    );
    const topicLine = matched
      ? `${matched.title_ru} ${matched.price}`
      : topic || "Личный запрос";

    // ── Contact line ───────────────────────────────────────────────────────
    const methodLabel =
      contactType === "whatsapp"
        ? "WhatsApp"
        : contactType === "instagram"
        ? "Instagram"
        : "Telegram";
    const contactLine = `${methodLabel} ${contact}`;

    // ── Currency line ──────────────────────────────────────────────────────
    const currencyLine = currency?.trim() ? `💰 ${currency.trim()}` : null;

    // ── Assemble message ───────────────────────────────────────────────────
    const parts: (string | null)[] = [
      `📋 *${escMd(topicLine)}*`,
      ``,
      `Name: ${escMd(name.trim())}`,
      escMd(contactLine),
      currencyLine ? escMd(currencyLine) : null,
      message?.trim() ? `\n${escMd(message.trim())}` : null,
    ];

    const text = parts.filter(p => p !== null).join("\n");

    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram error:", err);
      return NextResponse.json({ error: "Telegram error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Escape Markdown special chars for Telegram MarkdownV1 */
function escMd(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
