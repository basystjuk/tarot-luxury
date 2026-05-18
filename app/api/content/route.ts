import { list, head } from "@vercel/blob";
import { NextResponse } from "next/server";
import { DEFAULT_SERVICES, DEFAULT_ORG } from "@/lib/data/services";
import { testimonials as DEFAULT_TESTIMONIALS } from "@/lib/data/testimonials";

const CONTENT_BLOB = "site-content.json";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    const blob = blobs[0];
    if (!blob) {
      return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
    }
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ ...defaults(), ...data }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(defaults(), { headers: { "Cache-Control": "no-store" } });
  }
}

function defaults() {
  return {
    services: DEFAULT_SERVICES,
    org: DEFAULT_ORG,
    testimonials: DEFAULT_TESTIMONIALS,
    blog: {
      title_ru: "Telegram-канал",
      desc_ru: "Там я регулярно публикую расклады, пишу о картах и делюсь мыслями.",
      btn_ru: "Перейти в канал",
      title_uk: "Telegram-канал",
      desc_uk: "Там я регулярно публікую розклади, пишу про карти та ділюся думками.",
      btn_uk: "Перейти в канал",
      link: "https://t.me/ellen_soul_taro",
    },
    contacts: {
      telegram_handle: "@ellen_soul_taro",
      telegram_url: "https://t.me/ellen_soul_taro",
      whatsapp_url: "https://wa.me/380000000000",
      instagram_handle: "@ellen_soul_taro",
      instagram_url: "https://instagram.com/ellen_soul_taro",
    },
    faq_uk: [
      { id: "1", category: "Процес", q: "Як відбувається онлайн-консультація?", a: "Консультація проходить через Zoom або Telegram-відеодзвінок. Після запису я надсилаю посилання та невелику анкету." },
      { id: "2", category: "Розуміння таро", q: "Чи гарантуєте ви точність передбачень?", a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції та ресурси. Я ніколи не гарантую конкретних подій." },
      { id: "3", category: "Оплата та організація", q: "Як відбувається оплата?", a: "Оплата здійснюється до початку сесії. Приймаю картку, PayPal або Binance Pay." },
      { id: "4", category: "Конфіденційність", q: "Чи зберігатиметься запис нашої сесії?", a: "Я записую сесії лише за вашою згодою. Конфіденційність — основа моєї практики." },
    ],
    faq_ru: [
      { id: "1", category: "Процесс", q: "Как проходит онлайн-консультация?", a: "Консультация проходит через Zoom или Telegram-видеозвонок. После записи я отправляю ссылку и небольшую анкету." },
      { id: "2", category: "Понимание таро", q: "Гарантируете ли вы точность предсказаний?", a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции и ресурсы. Я никогда не гарантирую конкретных событий." },
      { id: "3", category: "Оплата и организация", q: "Как происходит оплата?", a: "Оплата производится до начала сессии. Принимаю карту, PayPal или Binance Pay." },
      { id: "4", category: "Конфиденциальность", q: "Будет ли сохраняться запись нашей сессии?", a: "Я записываю сессии только с вашего согласия. Конфиденциальность — основа моей практики." },
    ],
    faq_en: [
      { id: "1", category: "Process", q: "How does an online consultation work?", a: "Consultations take place via Zoom or Telegram video call. After booking I send a link and a short questionnaire." },
      { id: "2", category: "Understanding Tarot", q: "Do you guarantee accuracy of predictions?", a: "Tarot is not fortune-telling — it's a tool for awareness. Cards show tendencies and resources. I never guarantee specific events." },
      { id: "3", category: "Payment & Organisation", q: "How does payment work?", a: "Payment is made before the session begins. I accept card, PayPal or Binance Pay." },
      { id: "4", category: "Confidentiality", q: "Will our session be recorded?", a: "I record sessions only with your consent. Confidentiality is the foundation of my practice." },
    ],
  };
}
