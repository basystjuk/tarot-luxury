import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { isPreviewFromRequest } from "@/lib/preview";
import { renderTemplate, resolvePrompt, getLanguageName, type PromptOverrides } from "@/lib/ai-prompts";
import { loadPromptOverrides } from "@/lib/server-content";

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
    moonSpeedDegPerDay,
    moonSpeedClass,
    moonDeclination,
    isOutOfBounds,
    element,
    isDayChart,
    rulerActive,
    rulerDay,
    rulerNight,
    rulerParticipating,
    eclipseType,
    eclipseProximity,
  } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  // Context labels — explicitly direct AI behaviour per context.
  // "today"  — current sky right now (live energy).
  // "event"  — any other date (past or future): qualitative window of that day.
  // "natal"  — kept for the upcoming natal-mode work; not currently sent from UI.
  // "future" — legacy alias of "event"; kept for backward compatibility.
  const contextDirectiveUk =
    usageContext === "natal"
      ? "Це натальний Місяць — людина народилась з цією конфігурацією. НЕ описуй зовнішні події цього дня. Опиши їхню внутрішню емоційну природу, реакції на стрес, що дає відчуття безпеки, материнські патерни, спосіб насичувати душу."
      : (usageContext === "event" || usageContext === "future")
      ? "Це конкретна дата — користувач дивиться на якісне вікно саме цього дня (минулого чи майбутнього). Опиши для чого цей день добрий, що краще НЕ робити, який тип дії резонує з цією місячною енергією. Якщо дата у минулому — допоможи побачити, чому той день міг відчуватися саме так."
      : "Це поточний момент — місячна енергія прямо зараз. Опиши що відбувається в полі емоцій і інтуїції людей сьогодні.";
  const contextDirectiveRu =
    usageContext === "natal"
      ? "Это натальная Луна — человек родился с этой конфигурацией. НЕ описывай внешние события этого дня. Опиши их внутреннюю эмоциональную природу, реакции на стресс, что даёт чувство безопасности, материнские паттерны, способ напитывать душу."
      : (usageContext === "event" || usageContext === "future")
      ? "Это конкретная дата — пользователь смотрит на качественное окно именно этого дня (прошлого или будущего). Опиши для чего этот день хорош, что лучше НЕ делать, какой тип действия резонирует с этой лунной энергией. Если дата в прошлом — помоги увидеть, почему тот день мог ощущаться именно так."
      : "Это текущий момент — лунная энергия прямо сейчас. Опиши что происходит в поле эмоций и интуиции людей сегодня.";
  const contextDirectiveEn =
    usageContext === "natal"
      ? "This is a natal Moon — the person was born with this configuration. DO NOT describe external events of this day. Describe their inner emotional nature, stress responses, what gives them safety, mother patterns, how they nourish their soul."
      : (usageContext === "event" || usageContext === "future")
      ? "This is a specific date — the user is looking at the qualitative window of this exact day (past or future). Describe what this day is good for, what to AVOID, what type of action resonates with this lunar energy. If the date is in the past, help the user see why that day may have felt the way it did."
      : "This is the current moment — lunar energy right now. Describe what is happening in the emotional and intuitive field today.";

  const sunBlockUk = sunSign ? `\nЗнак Сонця: ${sunSign} — врахуй діалог Місяця і Сонця.` : "";
  const sunBlockRu = sunSign ? `\nЗнак Солнца: ${sunSign} — учти диалог Луны и Солнца.` : "";
  const sunBlockEn = sunSign ? `\nSun sign: ${sunSignEn ?? sunSign} — consider the Moon–Sun dialogue.` : "";

  // Extra astrological context blocks
  // Moon speed / OOB phrasing — only included when the AI should care.
  // "normal" speed is the default and not worth mentioning; fast/slow
  // changes how a window unfolds. OOB is rare (~25% of months) but
  // always carries weight when present.
  const speedNum = typeof moonSpeedDegPerDay === "number" ? moonSpeedDegPerDay.toFixed(1) : null;
  const declNum  = typeof moonDeclination === "number" ? moonDeclination.toFixed(1) : null;
  const speedBlockUk = moonSpeedClass === "fast"
    ? `Місяць ШВИДКИЙ (${speedNum}°/добу) — події розгортаються стрімко, рішення «приклеюються» швидко, вікно VoC коротке.`
    : moonSpeedClass === "slow"
    ? `Місяць ПОВІЛЬНИЙ (${speedNum}°/добу) — темп уповільнений, можливі затягування, VoC триває довше; ситуації потребують терпіння.`
    : "";
  const speedBlockRu = moonSpeedClass === "fast"
    ? `Луна БЫСТРАЯ (${speedNum}°/сутки) — события разворачиваются стремительно, решения «приклеиваются» быстро, окно VoC короткое.`
    : moonSpeedClass === "slow"
    ? `Луна МЕДЛЕННАЯ (${speedNum}°/сутки) — темп замедлен, возможны затягивания, VoC длится дольше; ситуации требуют терпения.`
    : "";
  const speedBlockEn = moonSpeedClass === "fast"
    ? `The Moon is FAST (${speedNum}°/day) — events unfold quickly, decisions stick fast, the VoC window is short.`
    : moonSpeedClass === "slow"
    ? `The Moon is SLOW (${speedNum}°/day) — slower tempo, possible delays, longer VoC; situations require patience.`
    : "";
  const oobUk = isOutOfBounds ? `Місяць OUT OF BOUNDS (декліннація ${declNum}°) — енергія дика, неприборкана; можливі несподівані рішення, ірраціональні пориви, креативні прориви.` : "";
  const oobRu = isOutOfBounds ? `Луна OUT OF BOUNDS (склонение ${declNum}°) — энергия дикая, неприручённая; возможны неожиданные решения, иррациональные порывы, креативные прорывы.` : "";
  const oobEn = isOutOfBounds ? `The Moon is OUT OF BOUNDS (declination ${declNum}°) — wild, unrestrained energy; expect unexpected decisions, irrational impulses, creative breakthroughs.` : "";

  // Triplicity rulers — name the active ruler so the AI can call out
  // through-which-planet the day's energy lands. We send English planet
  // tokens; the prompt is locale-aware, so we translate inline here.
  const PLANET_LOCAL: Record<string, { uk: string; ru: string; en: string }> = {
    sun:     { uk: "Сонце",   ru: "Солнце",   en: "Sun"     },
    moon:    { uk: "Місяць",  ru: "Луна",     en: "Moon"    },
    mercury: { uk: "Меркурій", ru: "Меркурий", en: "Mercury" },
    venus:   { uk: "Венера",  ru: "Венера",   en: "Venus"   },
    mars:    { uk: "Марс",    ru: "Марс",     en: "Mars"    },
    jupiter: { uk: "Юпітер",  ru: "Юпитер",   en: "Jupiter" },
    saturn:  { uk: "Сатурн",  ru: "Сатурн",   en: "Saturn"  },
  };
  const ELEMENT_LOCAL: Record<string, { uk: string; ru: string; en: string }> = {
    fire:  { uk: "Вогню", ru: "Огня",    en: "Fire"  },
    earth: { uk: "Землі", ru: "Земли",   en: "Earth" },
    air:   { uk: "Повітря", ru: "Воздуха", en: "Air"   },
    water: { uk: "Води",  ru: "Воды",    en: "Water" },
  };
  const tripBlockUk = (element && rulerActive)
    ? `Триплицитет стихії ${ELEMENT_LOCAL[element]?.uk}: активний управитель — ${PLANET_LOCAL[rulerActive]?.uk} (${isDayChart ? "денна" : "нічна"} секта). Денний: ${PLANET_LOCAL[rulerDay]?.uk}, нічний: ${PLANET_LOCAL[rulerNight]?.uk}, помічник: ${PLANET_LOCAL[rulerParticipating]?.uk}. Це шепіт планети, через яку «звучить» стихія саме зараз.`
    : "";
  const tripBlockRu = (element && rulerActive)
    ? `Триплицитет стихии ${ELEMENT_LOCAL[element]?.ru}: активный управитель — ${PLANET_LOCAL[rulerActive]?.ru} (${isDayChart ? "дневная" : "ночная"} секта). Дневной: ${PLANET_LOCAL[rulerDay]?.ru}, ночной: ${PLANET_LOCAL[rulerNight]?.ru}, помощник: ${PLANET_LOCAL[rulerParticipating]?.ru}. Это шёпот планеты, через которую «звучит» стихия именно сейчас.`
    : "";
  const tripBlockEn = (element && rulerActive)
    ? `Triplicity of ${ELEMENT_LOCAL[element]?.en}: active ruler is ${PLANET_LOCAL[rulerActive]?.en} (${isDayChart ? "diurnal" : "nocturnal"} sect). Day ruler: ${PLANET_LOCAL[rulerDay]?.en}, night ruler: ${PLANET_LOCAL[rulerNight]?.en}, participating: ${PLANET_LOCAL[rulerParticipating]?.en}. This is the whisper of the planet through which the element 'speaks' right now.`
    : "";

  // Eclipse — strongest single signal we can flag. Days near an eclipse
  // carry a "fated chapter turn" weight that's worth naming explicitly.
  const eclipseProxNote = typeof eclipseProximity === "number" && eclipseProximity > 0
    ? ` (${eclipseProximity}% alignment)` : "";
  const eclipseBlockUk = eclipseType === "solar"
    ? `Сьогодні СОНЯЧНЕ ЗАТЕМНЕННЯ${eclipseProxNote} — момент переписаних сценаріїв на осі вузлів. Не запускай нічого нового; спостерігай, відпускай, бачи що стає видимим.`
    : eclipseType === "lunar"
    ? `Сьогодні МІСЯЧНЕ ЗАТЕМНЕННЯ${eclipseProxNote} — пришвидшене завершення розділу. Те, що було приховане, виходить на світло. Не починай нового; дай циклу закритися.`
    : "";
  const eclipseBlockRu = eclipseType === "solar"
    ? `Сегодня СОЛНЕЧНОЕ ЗАТМЕНИЕ${eclipseProxNote} — момент переписанных сценариев на оси узлов. Не запускай ничего нового; наблюдай, отпускай, замечай что становится видимым.`
    : eclipseType === "lunar"
    ? `Сегодня ЛУННОЕ ЗАТМЕНИЕ${eclipseProxNote} — ускоренное завершение главы. То, что было скрыто, выходит на свет. Не начинай нового; дай циклу закрыться.`
    : "";
  const eclipseBlockEn = eclipseType === "solar"
    ? `Today is a SOLAR ECLIPSE${eclipseProxNote} — a moment of scripts rewritten on the nodal axis. Don't launch anything new; observe, release, notice what becomes visible.`
    : eclipseType === "lunar"
    ? `Today is a LUNAR ECLIPSE${eclipseProxNote} — an accelerated chapter ending. What was hidden surfaces. Don't start anything new; let the cycle close.`
    : "";

  const extraBlockUk = [
    eclipseBlockUk,
    isDarkMoon ? "Зараз ТЕМНИЙ МІСЯЦЬ (передноволуння) — енергія повного спокою, інтроверсія, ритуали відпускання, не починай нічого нового." : "",
    voidOfCourse ? "Місяць ПУСТИЙ (Void of Course) — рішення цього періоду рідко реалізуються; добре для рутини, відпочинку, медитації; не підписуй контрактів." : "",
    speedBlockUk,
    oobUk,
    tripBlockUk,
    northNodeSign ? `Північний вузол (Раху): ${northNodeSign} — карматичне зростання тут.` : "",
    southNodeSign ? `Південний вузол (Кету): ${southNodeSign} — звички з минулих циклів.` : "",
    lilithSign ? `Чорна Луна Ліліт у ${lilithSign} — тінь, табу, дикість, що просить визнання.` : "",
  ].filter(Boolean).join(" ");
  const extraBlockRu = [
    eclipseBlockRu,
    isDarkMoon ? "Сейчас ТЁМНАЯ ЛУНА (предноволуние) — энергия полного покоя, интроверсия, ритуалы отпускания, не начинай ничего нового." : "",
    voidOfCourse ? "Луна ПУСТАЯ (Void of Course) — решения этого периода редко реализуются; хорошо для рутины, отдыха, медитации; не подписывай контрактов." : "",
    speedBlockRu,
    oobRu,
    tripBlockRu,
    northNodeSign ? `Северный узел (Раху): ${northNodeSign} — кармическое развитие здесь.` : "",
    southNodeSign ? `Южный узел (Кету): ${southNodeSign} — привычки из прошлых циклов.` : "",
    lilithSign ? `Чёрная Луна Лилит в ${lilithSign} — тень, табу, дикость, просящая признания.` : "",
  ].filter(Boolean).join(" ");
  const extraBlockEn = [
    eclipseBlockEn,
    isDarkMoon ? "It is currently the DARK MOON (pre-new) — energy of complete rest, introversion, release rituals; do not start anything new." : "",
    voidOfCourse ? "The Moon is VOID OF COURSE — decisions made in this window rarely manifest; good for routine, rest, meditation; do not sign contracts." : "",
    speedBlockEn,
    oobEn,
    tripBlockEn,
    northNodeSign ? `North Node (Rahu): ${northNodeSign} — karmic growth lies here.` : "",
    southNodeSign ? `South Node (Ketu): ${southNodeSign} — habits from previous cycles.` : "",
    lilithSign ? `Black Moon Lilith in ${lilithSign} — the shadow, the taboo, the wildness asking to be acknowledged.` : "",
  ].filter(Boolean).join(" ");

  // Pick localized blocks for the template variables (admin only sees finals).
  const sunBlock = language === "en" ? sunBlockEn : language === "ru" ? sunBlockRu : sunBlockUk;
  const extraBlockRaw = language === "en" ? extraBlockEn : language === "ru" ? extraBlockRu : extraBlockUk;
  const extraBlock = extraBlockRaw ? "\n" + extraBlockRaw : "";
  const contextDirective = language === "en" ? contextDirectiveEn : language === "ru" ? contextDirectiveRu : contextDirectiveUk;
  const moonSignResolved = language === "en" ? (moonSignEn ?? moonSign) : moonSign;

  const overrides = (await loadPromptOverrides()) as PromptOverrides | null;
  const tpl = resolvePrompt("moon-reading", overrides);
  const vars = {
    language_name: getLanguageName(language),
    moonDegree,
    moonSign: moonSignResolved,
    phaseName,
    illumination,
    contextDirective,
    sunBlock,
    extraBlock,
  };
  const SYSTEM_PROMPT = renderTemplate(tpl.system, vars);
  const prompt = renderTemplate(tpl.user, vars);

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
