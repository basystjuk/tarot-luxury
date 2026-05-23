import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPreviewFromRequest } from "@/lib/preview";

export const maxDuration = 30;

// Rate limit: 1 reading per IP per Kyiv calendar day
const ipMap = new Map<string, { day: string }>();

function getKyivDay(): string {
  return new Date().toLocaleDateString("uk-UA", { timeZone: "Europe/Kiev" });
}

function checkRateLimit(ip: string): boolean {
  const today = getKyivDay();
  const entry = ipMap.get(ip);
  if (!entry || entry.day !== today) {
    ipMap.set(ip, { day: today });
    return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // Preview-cookie bypass: lets the owner iterate without burning quota.
  if (!isPreviewFromRequest(req) && !checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "rate_limit", message: "Ліміт 1 послання на добу вичерпано." },
      { status: 429 }
    );
  }

  const {
    language,
    phaseName,
    moonSign,
    moonSignEn,
    moonDegree,
    illumination,
    sunSign,
    sunSignEn,
    usageContext,
    isDarkMoon,
    voidOfCourse,
    northNodeSign,
    southNodeSign,
    lilithSign,
  } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // Context labels — explicitly direct AI behaviour per context
  const contextDirectiveUk =
    usageContext === "natal"
      ? "Це натальний Місяць — людина народилась з цією конфігурацією. НЕ описуй зовнішні події цього дня. Опиши їхню внутрішню емоційну природу, реакції на стрес, що дає відчуття безпеки, материнські патерни, спосіб насичувати душу."
      : usageContext === "future"
      ? "Це планування майбутнього — користувач дивиться вперед. Опиши якісне вікно для запланованої події/наміру саме в цей день: для чого цей день добрий, що краще НЕ робити, який тип дії резонує з цією місячною енергією."
      : "Це поточний момент — місячна енергія прямо зараз. Опиши що відбувається в полі емоцій і інтуїції людей сьогодні.";
  const contextDirectiveRu =
    usageContext === "natal"
      ? "Это натальная Луна — человек родился с этой конфигурацией. НЕ описывай внешние события этого дня. Опиши их внутреннюю эмоциональную природу, реакции на стресс, что даёт чувство безопасности, материнские паттерны, способ напитывать душу."
      : usageContext === "future"
      ? "Это планирование будущего — пользователь смотрит вперёд. Опиши качественное окно для запланированного события/намерения именно в этот день: для чего этот день хорош, что лучше НЕ делать, какой тип действия резонирует с этой лунной энергией."
      : "Это текущий момент — лунная энергия прямо сейчас. Опиши что происходит в поле эмоций и интуиции людей сегодня.";
  const contextDirectiveEn =
    usageContext === "natal"
      ? "This is a natal Moon — the person was born with this configuration. DO NOT describe external events of this day. Describe their inner emotional nature, stress responses, what gives them safety, mother patterns, how they nourish their soul."
      : usageContext === "future"
      ? "This is future planning — the user is looking ahead. Describe the qualitative window for a planned event/intention on this exact day: what this day is good for, what to AVOID, what type of action resonates with this lunar energy."
      : "This is the current moment — lunar energy right now. Describe what is happening in the emotional and intuitive field today.";

  const sunBlockUk = sunSign ? `\nЗнак Сонця: ${sunSign} — врахуй діалог Місяця і Сонця.` : "";
  const sunBlockRu = sunSign ? `\nЗнак Солнца: ${sunSign} — учти диалог Луны и Солнца.` : "";
  const sunBlockEn = sunSign ? `\nSun sign: ${sunSignEn ?? sunSign} — consider the Moon–Sun dialogue.` : "";

  // Extra astrological context blocks
  const extraBlockUk = [
    isDarkMoon ? "Зараз ТЕМНИЙ МІСЯЦЬ (передноволуння) — енергія повного спокою, інтроверсія, ритуали відпускання, не починай нічого нового." : "",
    voidOfCourse ? "Місяць ПУСТИЙ (Void of Course) — рішення цього періоду рідко реалізуються; добре для рутини, відпочинку, медитації; не підписуй контрактів." : "",
    northNodeSign ? `Північний вузол (Раху): ${northNodeSign} — карматичне зростання тут.` : "",
    southNodeSign ? `Південний вузол (Кету): ${southNodeSign} — звички з минулих циклів.` : "",
    lilithSign ? `Чорна Луна Ліліт у ${lilithSign} — тінь, табу, дикість, що просить визнання.` : "",
  ].filter(Boolean).join(" ");
  const extraBlockRu = [
    isDarkMoon ? "Сейчас ТЁМНАЯ ЛУНА (предноволуние) — энергия полного покоя, интроверсия, ритуалы отпускания, не начинай ничего нового." : "",
    voidOfCourse ? "Луна ПУСТАЯ (Void of Course) — решения этого периода редко реализуются; хорошо для рутины, отдыха, медитации; не подписывай контрактов." : "",
    northNodeSign ? `Северный узел (Раху): ${northNodeSign} — кармическое развитие здесь.` : "",
    southNodeSign ? `Южный узел (Кету): ${southNodeSign} — привычки из прошлых циклов.` : "",
    lilithSign ? `Чёрная Луна Лилит в ${lilithSign} — тень, табу, дикость, просящая признания.` : "",
  ].filter(Boolean).join(" ");
  const extraBlockEn = [
    isDarkMoon ? "It is currently the DARK MOON (pre-new) — energy of complete rest, introversion, release rituals; do not start anything new." : "",
    voidOfCourse ? "The Moon is VOID OF COURSE — decisions made in this window rarely manifest; good for routine, rest, meditation; do not sign contracts." : "",
    northNodeSign ? `North Node (Rahu): ${northNodeSign} — karmic growth lies here.` : "",
    southNodeSign ? `South Node (Ketu): ${southNodeSign} — habits from previous cycles.` : "",
    lilithSign ? `Black Moon Lilith in ${lilithSign} — the shadow, the taboo, the wildness asking to be acknowledged.` : "",
  ].filter(Boolean).join(" ");

  const SYSTEM_PROMPT =
    language === "en"
      ? "You are an expert lunar astrologer — perceptive, poetic, feminine, mystical. You know lunar astrology at a professional depth: phases, signs, degrees, void of course, nodes, Lilith, dark moon. Your readings are never generic: search for nuance, avoid clichés, name the unexpected angle. Write exclusively in English — not a single word, hieroglyph or character from any other language or script."
      : language === "ru"
      ? "Ты — эксперт лунной астрологии: проницательный, поэтичный, женственный, мистический. Знаешь лунную астрологию на профессиональной глубине: фазы, знаки, градусы, void of course, узлы, Лилит, тёмная луна. Прочтения никогда не банальны: ищи нюансы, избегай клише, называй неожиданный угол. Пиши исключительно на русском языке — ни единого иероглифа, латинского слова или символа другого алфавита."
      : "Ти — експерт лунної астрології: проникливий, поетичний, жіночний, містичний. Знаєш лунну астрологію на професійній глибині: фази, знаки, градуси, void of course, вузли, Ліліт, темний місяць. Прочитання ніколи не банальні: шукай нюанси, уникай кліше, називай несподіваний кут. Пиши виключно українською мовою — жодного ієрогліфа, латинського слова або символу іншого алфавіту.";

  const prompt =
    language === "en"
      ? `The Moon is at ${moonDegree}° ${moonSignEn} in the ${phaseName} phase (${illumination}% illumination). Context: ${usageContext}.${sunBlockEn}${extraBlockEn ? "\n" + extraBlockEn : ""}

${contextDirectiveEn}

Write the message in 3 paragraphs (no headers, no bullet points, no greeting):
1) Energy (2 sentences — the precise quality of ${moonDegree}° ${moonSignEn} in this phase: name the specific archetype, tension or gift active right now; go deeper than "this is a time for...")
2) Concrete advice (1–2 sentences — name ONE specific ritual or action appropriate exactly for this phase in this sign; AVOID banalities like "meditate", "journal", "breathe deeply")
3) Affirmation (ONE short, powerful sentence starting with "I", NO MORE THAN 15 WORDS, directly tied to ${moonDegree}° ${moonSignEn})

Write exclusively in English — absolutely no other language, script or hieroglyphs.`
      : language === "ru"
      ? `Луна на ${moonDegree}° ${moonSign} в фазе ${phaseName} (${illumination}% освещения). Контекст: ${usageContext}.${sunBlockRu}${extraBlockRu ? "\n" + extraBlockRu : ""}

${contextDirectiveRu}

Напиши послание в 3 абзаца (без заголовков, без маркеров, без приветствия):
1) Энергия (2 предложения — точное качество ${moonDegree}° ${moonSign} в этой фазе: назови специфический архетип, напряжение или дар, активный прямо сейчас; иди глубже, чем «это время для...»)
2) Конкретный совет (1–2 предложения — назови ОДИН конкретный ритуал или действие, уместный именно для этой фазы в этом знаке; ИЗБЕГАЙ банальностей вроде «медитируйте», «ведите дневник», «дышите глубоко»)
3) Аффирмация (ОДНО короткое мощное предложение, начинается со слова «Я», НЕ БОЛЕЕ 15 СЛОВ, прямо связано с энергией ${moonDegree}° ${moonSign})

Пиши исключительно на русском языке — абсолютно никаких иероглифов, других языков или алфавитов.`
      : `Місяць на ${moonDegree}° ${moonSign} у фазі ${phaseName} (${illumination}% освітлення). Контекст: ${usageContext}.${sunBlockUk}${extraBlockUk ? "\n" + extraBlockUk : ""}

${contextDirectiveUk}

Напиши послання у 3 абзаци (без заголовків, без маркерів, без вітання):
1) Енергія (2 речення — точна якість ${moonDegree}° ${moonSign} у цій фазі: назви специфічний архетип, напругу або дар, активний прямо зараз; іди глибше, ніж «це час для...»)
2) Конкретна порада (1–2 речення — назви ОДИН конкретний ритуал або дію, доречний саме для цієї фази в цьому знаку; УНИКАЙ банальностей на кшталт «медитуйте», «ведіть щоденник», «дихайте глибоко»)
3) Аффірмація (ОДНЕ коротке потужне речення, починається зі слова «Я», НЕ БІЛЬШЕ 15 СЛІВ, прямо пов'язане з енергією ${moonDegree}° ${moonSign})

Пиши виключно українською мовою — абсолютно жодних ієрогліфів, інших мов або алфавітів.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.85,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "groq_error" }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const parts = text.split(/\n\n+/).filter((s: string) => s.trim());

    return NextResponse.json({
      energy:      parts[0] ?? text,
      advice:      parts[1] ?? "",
      affirmation: parts[2] ?? "",
    });
  } catch (e) {
    console.error("moon-reading error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
