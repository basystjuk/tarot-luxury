import { list } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_SERVICES, DEFAULT_ORG } from "@/lib/data/services";
import { testimonials as DEFAULT_TESTIMONIALS } from "@/lib/data/testimonials";
import { DEFAULT_TOOLS_ENABLED } from "@/lib/tools-config";
import { isPreviewFromRequest } from "@/lib/preview";

const CONTENT_BLOB = "site-content.json";
// Short edge cache so admin tool-toggles propagate within ~60s.
// Preview-mode callers always bypass cache (per-request cookie).
const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";
const PREVIEW_CACHE = "private, no-store";


export async function GET(req: NextRequest) {
  const preview = isPreviewFromRequest(req);
  const cacheHeader = preview ? PREVIEW_CACHE : PUBLIC_CACHE;
  const respond = (payload: Record<string, unknown>) =>
    NextResponse.json({ ...payload, preview }, { headers: { "Cache-Control": cacheHeader } });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return respond(defaults());
  }

  try {
    const { blobs } = await list({ prefix: CONTENT_BLOB });
    const blob = blobs[0];
    if (!blob) return respond(defaults());
    const res = await fetch(blob.url, { cache: "no-store" });
    const data = await res.json();
    // Merge tools_enabled so newly added tool IDs always have a default.
    // Blob values normally win — but for tools the owner explicitly switched
    // off in code (DEFAULT_TOOLS_ENABLED === false) we keep them off, even
    // if a stale blob entry says otherwise. This is the safety net for
    // "code-disabled" tools that shouldn't surface to the public.
    const blobToolsEnabled = (data?.tools_enabled ?? {}) as Partial<typeof DEFAULT_TOOLS_ENABLED>;
    const effectiveToolsEnabled = { ...DEFAULT_TOOLS_ENABLED, ...blobToolsEnabled };
    for (const [id, defaultOn] of Object.entries(DEFAULT_TOOLS_ENABLED)) {
      if (defaultOn === false) {
        effectiveToolsEnabled[id as keyof typeof DEFAULT_TOOLS_ENABLED] = false;
      }
    }
    const merged = {
      ...defaults(),
      ...data,
      tools_enabled: effectiveToolsEnabled,
    };
    return respond(merged);
  } catch {
    return respond(defaults());
  }
}

function defaults() {
  return {
    tools_enabled: DEFAULT_TOOLS_ENABLED,
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
      telegram_handle: "@ellen_rouge",
      telegram_url: "https://t.me/ellen_rouge",
      whatsapp_url: "https://wa.me/380502318988",
      instagram_handle: "@ellen_soul_taro",
      instagram_url: "https://instagram.com/ellen_soul_taro",
    },
    faq_uk: [
      { id: "1", category: "Процес", q: "Як відбувається онлайн-консультація?", a: "Консультація проходить через WhatsApp або Telegram-відеодзвінок." },
      { id: "2", category: "Розуміння таро", q: "Чи гарантуєте ви точність передбачень?", a: "Таро — це не передбачення, а інструмент усвідомлення. Карти показують тенденції та ресурси. Я ніколи не можу гарантувати конкретних подій. Пам'ятайте, що консультація — це інструмент для розуміння себе та своєї ситуації, але ваше життя та вибори знаходяться у ваших руках. Довіряйте собі та своєму внутрішньому голосу." },
      { id: "3", category: "Оплата та організація", q: "Як відбувається оплата?", a: "Оплата здійснюється до початку сесії. Приймаю картку, PayPal або Binance Pay." },
      { id: "4", category: "Конфіденційність", q: "Чи зберігатиметься запис нашої сесії?", a: "Я записую сесії лише за вашою згодою. Конфіденційність — основа моєї практики." },
    ],
    faq_ru: [
      { id: "1", category: "Процесс", q: "Как проходит онлайн-консультация?", a: "Консультация проходит через WhatsApp или Telegram-видеозвонок." },
      { id: "2", category: "Понимание таро", q: "Гарантируете ли вы точность предсказаний?", a: "Таро — это не предсказание, а инструмент осознания. Карты показывают тенденции и ресурсы. Я никогда не могу гарантировать конкретных событий. Помните, что консультация — это инструмент для понимания себя и своей ситуации, но ваша жизнь и выборы находятся в ваших руках. Доверяйте себе и своему внутреннему голосу." },
      { id: "3", category: "Оплата и организация", q: "Как происходит оплата?", a: "Оплата производится до начала сессии. Принимаю карту, PayPal или Binance Pay." },
      { id: "4", category: "Конфиденциальность", q: "Будет ли сохраняться запись нашей сессии?", a: "Я записываю сессии только с вашего согласия. Конфиденциальность — основа моей практики." },
    ],
    faq_en: [
      { id: "1", category: "Process", q: "How does an online consultation work?", a: "Consultations take place via WhatsApp or Telegram video call." },
      { id: "2", category: "Understanding Tarot", q: "Do you guarantee accuracy of predictions?", a: "Tarot is not fortune-telling — it's a tool for awareness. Cards show tendencies and resources. I can never guarantee specific events. Remember, a consultation is a tool for understanding yourself and your situation, but your life and choices are in your hands. Trust yourself and your inner voice." },
      { id: "3", category: "Payment & Organisation", q: "How does payment work?", a: "Payment is made before the session begins. I accept card, PayPal or Binance Pay." },
      { id: "4", category: "Confidentiality", q: "Will our session be recorded?", a: "I record sessions only with your consent. Confidentiality is the foundation of my practice." },
    ],
    home: {
      hero_tag_uk: "Таро провідник", hero_tag_ru: "Таро проводник", hero_tag_en: "Tarot Guide",
      hero_title_uk: "Коли слова не допомагають — карти розкажуть правду",
      hero_title_ru: "Когда слова не помогают — карты расскажут правду",
      hero_title_en: "When words fail — the cards will tell the truth",
      hero_sub_uk: "Емпат, відчуваю людей та їхні запити. Для мене Таро — це не «чарівна таблетка», а розмова з вами і вашою ситуацією. Головний напрямок роботи — любов і стосунки.",
      hero_sub_ru: "Эмпат, чувствую людей и их запросы. Для меня Таро — это не «волшебная пилюля», а разговор с вами и вашей ситуацией. Главное направление работы — любовь и отношения.",
      hero_sub_en: "Empath — I sense people and their requests. For me, Tarot is not a magic pill, it's a conversation with you and your situation. My main focus is love and relationships.",
    },
    about: {
      story_title_uk: "Від запитань без відповіді — до практики, яка змінює життя",
      story_title_ru: "От вопросов без ответа — к практике, которая меняет жизни",
      story_title_en: "From unanswered questions — to a practice that changes lives",
      story_text_uk: "Практикую Таро більше 5 років. Для мене Таро — це не «чарівна таблетка», а розмова. З вами, з вашою ситуацією, з тим, що ви в глибині вже знаєте — просто поки не дозволили собі почути. Головний напрям — любов і стосунки, але працюю з будь-яким запитом: вибір шляху, фінанси, робота, сім'я, внутрішній стан.",
      story_text_ru: "Практикую Таро больше 5 лет. Для меня Таро — это не «волшебная пилюля», а разговор. С вами, с вашей ситуацией, с тем, что вы в глубине уже знаете — просто пока не разрешили себе услышать. Главное направление — любовь и отношения, но работаю с любым запросом: выбор пути, финансы, работа, семья, внутреннее состояние.",
      story_text_en: "I have been practising Tarot for over 5 years. For me, Tarot is not a magic pill — it is a conversation. With you, with your situation, with what you already know deep down — you just haven't allowed yourself to hear it yet. My main focus is love and relationships, but I work with any request: life choices, finances, work, family, inner state.",
      quote_uk: "Таро розклади з душею.",
      quote_ru: "Таро расклады с душой.",
      quote_en: "Tarot readings with soul.",
    },
    studio_tools: [
      { id: "moon-phase", title_uk: "Місячний провідник", title_ru: "Лунный проводник", title_en: "Moon Guide", desc_uk: "Точна фаза, знак і градус Місяця на будь-яку дату. Темний Місяць, Void of Course, вузли, Ліліт — особисте місячне послання.", desc_ru: "Точная фаза, знак и градус Луны на любую дату. Тёмная Луна, Void of Course, узлы, Лилит — личное лунное послание.", desc_en: "The precise Moon phase, sign and degree for any date. Dark Moon, Void of Course, nodes, Lilith — a personal lunar message." },
      { id: "compatibility", title_uk: "Сумісність знаків", title_ru: "Совместимость знаков", title_en: "Sign Compatibility", desc_uk: "Перевірте астрологічну сумісність двох знаків Зодіаку. Сильні сторони, виклики та загальна оцінка пари.", desc_ru: "Проверьте астрологическую совместимость двух знаков Зодиака. Сильные стороны, вызовы и общая оценка пары.", desc_en: "Check the astrological compatibility of two Zodiac signs. Strengths, challenges and overall couple rating." },
      { id: "daily-card", title_uk: "Карта дня", title_ru: "Карта дня", title_en: "Card of the Day", desc_uk: "Щоденна карта Старшого Аркану — ваш орієнтир та медитація на сьогодні. Оновлюється щодня.", desc_ru: "Ежедневная карта Старшего Аркана — ваш ориентир и медитация на сегодня. Обновляется каждый день.", desc_en: "Daily Major Arcana card — your guide and meditation for today. Updated every day." },
      { id: "numerology", title_uk: "Нумерологія", title_ru: "Нумерология", title_en: "Numerology", desc_uk: "Ваше число Долі та число Життєвого Шляху за ім'ям і датою народження. З детальною інтерпретацією.", desc_ru: "Ваше число Судьбы и число Жизненного Пути по имени и дате рождения. С детальной интерпретацией.", desc_en: "Your Destiny number and Life Path number by name and date of birth. With a detailed interpretation." },
    ],
  };
}
