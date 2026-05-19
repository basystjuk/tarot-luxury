import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, contact, topic, message, language } = await req.json();

    if (!name?.trim() || !contact?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      // Silently succeed if not configured (dev/preview)
      return NextResponse.json({ ok: true });
    }

    const flag = language === "ru" ? "🇷🇺" : language === "en" ? "🇬🇧" : "🇺🇦";
    const text = [
      `📩 *Новий запит з сайту*`,
      ``,
      `👤 *Ім'я:* ${escape(name)}`,
      `📬 *Контакт:* ${escape(contact)}`,
      `📋 *Тема:* ${escape(topic || "—")}`,
      message?.trim() ? `💬 *Повідомлення:* ${escape(message)}` : null,
      ``,
      `${flag} Мова: ${language ?? "uk"}`,
    ]
      .filter(Boolean)
      .join("\n");

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

function escape(text: string): string {
  // Escape Markdown special chars
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
