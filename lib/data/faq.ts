/**
 * Shared FAQ defaults.
 *
 * Authoritative baseline for /faq + FAQPage schema. The admin can override
 * via /api/content blob; the FAQ page loads the live values for display
 * AND the layout reads the same shape to emit JSON-LD so SERP markup
 * never diverges from visible content.
 */

export interface FaqItem { id: string; category: string; q: string; a: string }

export const DEFAULT_FAQ_UK: FaqItem[] = [
  { id: "1", category: "Процес", q: "Як відбувається онлайн-консультація?", a: "Консультація проходить через WhatsApp або Telegram-відеодзвінок." },
  { id: "2", category: "Розуміння таро", q: "Чи гарантуєте ви точність передбачень?", a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції та ресурси. Я ніколи не можу гарантувати конкретних подій. Пам'ятайте, що консультація — це інструмент для розуміння себе та своєї ситуації, але ваше життя та вибори знаходяться у ваших руках. Довіряйте собі та своєму внутрішньому голосу." },
  { id: "3", category: "Оплата та організація", q: "Як відбувається оплата?", a: "Оплата здійснюється до початку сесії. Приймаю картку, PayPal або Binance Pay." },
  { id: "4", category: "Конфіденційність", q: "Чи зберігатиметься запис нашої сесії?", a: "Я записую сесії лише за вашою згодою. Конфіденційність — основа моєї практики." },
];

export const DEFAULT_FAQ_RU: FaqItem[] = [
  { id: "1", category: "Процесс", q: "Как проходит онлайн-консультация?", a: "Консультация проходит через WhatsApp или Telegram-видеозвонок." },
  { id: "2", category: "Понимание таро", q: "Гарантируете ли вы точность предсказаний?", a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции и ресурсы. Я никогда не могу гарантировать конкретных событий. Помните, что консультация — это инструмент для понимания себя и своей ситуации, но ваша жизнь и выборы находятся в ваших руках. Доверяйте себе и своему внутреннему голосу." },
  { id: "3", category: "Оплата и организация", q: "Как происходит оплата?", a: "Оплата производится до начала сессии. Принимаю карту, PayPal или Binance Pay." },
  { id: "4", category: "Конфиденциальность", q: "Будет ли сохраняться запись нашей сессии?", a: "Я записываю сессии только с вашего согласия. Конфиденциальность — основа моей практики." },
];

export const DEFAULT_FAQ_EN: FaqItem[] = [
  { id: "1", category: "Process", q: "How does an online consultation work?", a: "Consultations take place via WhatsApp or Telegram video call." },
  { id: "2", category: "Understanding Tarot", q: "Do you guarantee accuracy of predictions?", a: "Tarot is not fortune-telling — it's a tool for awareness. Cards show tendencies and resources. I can never guarantee specific events. Remember, a consultation is a tool for understanding yourself and your situation, but your life and choices are in your hands. Trust yourself and your inner voice." },
  { id: "3", category: "Payment & Organisation", q: "How does payment work?", a: "Payment is made before the session begins. I accept card, PayPal or Binance Pay." },
  { id: "4", category: "Confidentiality", q: "Will our session be recorded?", a: "I record sessions only with your consent. Confidentiality is the foundation of my practice." },
];

export function faqFor(lang: "uk" | "ru" | "en"): FaqItem[] {
  return lang === "ru" ? DEFAULT_FAQ_RU : lang === "en" ? DEFAULT_FAQ_EN : DEFAULT_FAQ_UK;
}
