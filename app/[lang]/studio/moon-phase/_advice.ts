/**
 * Structured "what this means for you today" content for the lunar
 * conditions that trigger an expand block on the Moon Guide page.
 *
 * Used by the page's <details> blocks below the Dark Moon and Void of
 * Course badges. The text is static (same for every Dark Moon / every
 * VoC) — the personal AI message at the bottom of the page is what
 * brings the day's specific nuance.
 *
 * Tone matches the rest of the tool: warm, practical, mildly mystical
 * but no fluff. The "do / don't" lists are intentionally concrete so
 * a first-time visitor walks away knowing exactly what to do with the
 * next few hours.
 */

type Lang = "uk" | "ru" | "en";

export interface MoonAdvice {
  intro: string;       // 1–2 sentences: what this condition means right now.
  doTitle: string;     // localised heading for the "do" list.
  doList: string[];    // bullets — things that resonate with this energy.
  avoidTitle: string;  // localised heading for the "avoid" list.
  avoidList: string[]; // bullets — things to postpone.
  ritualTitle: string; // localised heading for the closing ritual.
  ritual: string;      // one short, doable ritual / micro-action.
}

export type AdviceKey = "darkMoon" | "voc";

const ADVICE: Record<AdviceKey, Record<Lang, MoonAdvice>> = {
  darkMoon: {
    uk: {
      intro:
        "Це триденне вікно перед новим Місяцем — час, коли енергія повністю опускається в землю перед новим циклом. Якщо ти відчуваєш втому, апатію або бажання сховатися — це не криза, це природа моменту. Тіло й душа просять паузи.",
      doTitle: "Що добре зараз",
      doList: [
        "тиша, ранній сон, тепла ванна",
        "водні ритуали — душ, плавання, вмивання",
        "прибрати простір, очистити робочий стіл, винести непотріб",
        "записи у щоденник, рефлексія, мрії на папері",
        "медитація, дихальні практики, проста йога",
        "прогулянка наодинці, без навушників",
        "легка їжа, відмова від алкоголю та цукру",
      ],
      avoidTitle: "Що краще відкласти",
      avoidList: [
        "підписувати договори чи важливі документи",
        "починати нові проєкти, кампанії, презентації",
        "зʼясовувати стосунки, складні розмови",
        "приймати кардинальні рішення",
        "перевантажуватися людьми та подіями",
      ],
      ritualTitle: "Маленький ритуал відпускання",
      ritual:
        "Запали свічку. Напиши на папері 3 речі, від яких готова попрощатися — звичка, образа, очікування. Через кілька діб, на новий Місяць, спали папір з вдячністю — і посій нові наміри на чистому місці.",
    },
    ru: {
      intro:
        "Это трёхдневное окно перед новолунием — время, когда энергия полностью опускается в землю перед новым циклом. Если ты чувствуешь усталость, апатию или желание спрятаться — это не кризис, это природа момента. Тело и душа просят паузы.",
      doTitle: "Что хорошо сейчас",
      doList: [
        "тишина, ранний сон, тёплая ванна",
        "водные ритуалы — душ, плавание, умывание",
        "прибрать пространство, очистить рабочий стол, вынести ненужное",
        "записи в дневник, рефлексия, мечты на бумаге",
        "медитация, дыхательные практики, простая йога",
        "прогулка в одиночестве, без наушников",
        "лёгкая еда, отказ от алкоголя и сахара",
      ],
      avoidTitle: "Что лучше отложить",
      avoidList: [
        "подписывать договоры или важные документы",
        "начинать новые проекты, кампании, презентации",
        "выяснять отношения, сложные разговоры",
        "принимать кардинальные решения",
        "перегружаться людьми и событиями",
      ],
      ritualTitle: "Маленький ритуал отпускания",
      ritual:
        "Зажги свечу. Напиши на бумаге 3 вещи, от которых готова попрощаться — привычка, обида, ожидание. Через несколько суток, в новолуние, сожги бумагу с благодарностью — и посей новые намерения на чистом месте.",
    },
    en: {
      intro:
        "This is the three-day window before the new moon — when energy fully settles into the ground before a new cycle begins. If you feel tired, apathetic, or want to hide, this isn't a crisis — it's the nature of the moment. Body and soul are asking for a pause.",
      doTitle: "What's good right now",
      doList: [
        "silence, early sleep, a warm bath",
        "water rituals — shower, swim, gentle wash",
        "tidy the space, clear your desk, discard what's not needed",
        "journal, reflect, write down dreams",
        "meditation, breathwork, simple yoga",
        "a solo walk — no headphones",
        "light food, skip alcohol and sugar",
      ],
      avoidTitle: "What to postpone",
      avoidList: [
        "signing contracts or important documents",
        "launching new projects, campaigns, presentations",
        "starting difficult conversations or confrontations",
        "making major decisions",
        "overloading on people and events",
      ],
      ritualTitle: "A small release ritual",
      ritual:
        "Light a candle. Write down three things you're ready to part with — a habit, a resentment, an expectation. A few days from now, at the new moon, burn the paper with gratitude — and plant fresh intentions on the cleared ground.",
    },
  },
  voc: {
    uk: {
      intro:
        "Місяць «не звʼязаний» з іншими планетами — наче пауза між дзвінками. Те, що ти зараз вирішуєш чи розпочинаєш, рідко доводиться до завершення у запланованому вигляді. Це не «поганий час» — це час, який підходить для іншого типу справ.",
      doTitle: "Що добре зараз",
      doList: [
        "рутина — те, що ти і так робиш щодня",
        "повторення знайомого, технічні дрібниці",
        "відпочинок, сон, нічого-не-роблення",
        "медитація, прогулянки, теплий чай",
        "мрії, ідеї, нотатки без зобовʼязань",
        "легкі побутові справи — прибирання, прання",
      ],
      avoidTitle: "Що краще відкласти",
      avoidList: [
        "підписувати документи, договори, оплати",
        "відправляти важливі повідомлення, листи, заявки",
        "починати щось нове — проєкт, курс, стосунки",
        "робити дорогі покупки",
        "призначати ключові зустрічі та переговори",
      ],
      ritualTitle: "Маленький жест",
      ritual:
        "Відклади важливе на завтра без вини. Завари чай і просто побудь з собою — це не «втрачений» час, це підготовка до моменту, коли Місяць знову візьме нитку і твої дії знайдуть продовження.",
    },
    ru: {
      intro:
        "Луна «не связана» с другими планетами — словно пауза между звонками. То, что ты сейчас решаешь или начинаешь, редко доводится до завершения в запланированном виде. Это не «плохое время» — это время, которое подходит для другого типа дел.",
      doTitle: "Что хорошо сейчас",
      doList: [
        "рутина — то, что ты и так делаешь каждый день",
        "повторение знакомого, технические мелочи",
        "отдых, сон, ничегонеделание",
        "медитация, прогулки, тёплый чай",
        "мечты, идеи, заметки без обязательств",
        "лёгкие бытовые дела — уборка, стирка",
      ],
      avoidTitle: "Что лучше отложить",
      avoidList: [
        "подписывать документы, договоры, оплаты",
        "отправлять важные сообщения, письма, заявки",
        "начинать что-то новое — проект, курс, отношения",
        "делать дорогие покупки",
        "назначать ключевые встречи и переговоры",
      ],
      ritualTitle: "Маленький жест",
      ritual:
        "Отложи важное на завтра без чувства вины. Завари чай и просто побудь с собой — это не «потерянное» время, это подготовка к моменту, когда Луна снова возьмёт нить и твои действия найдут продолжение.",
    },
    en: {
      intro:
        "The Moon is 'not connected' to other planets — like a pause between calls. Whatever you decide or start right now rarely lands in the form you planned. This isn't a 'bad time' — it's a window that suits a different kind of activity.",
      doTitle: "What's good right now",
      doList: [
        "routine — the things you do every day anyway",
        "repeating the familiar, technical small tasks",
        "rest, sleep, doing nothing",
        "meditation, walks, warm tea",
        "dreams, ideas, notes without commitments",
        "light housework — tidying, laundry",
      ],
      avoidTitle: "What to postpone",
      avoidList: [
        "signing documents, contracts, payments",
        "sending important messages, emails, applications",
        "starting anything new — a project, a course, a relationship",
        "making expensive purchases",
        "scheduling key meetings or negotiations",
      ],
      ritualTitle: "A small gesture",
      ritual:
        "Postpone what matters until tomorrow — without guilt. Brew tea and simply be with yourself. This isn't 'wasted' time — it's preparation for the moment the Moon picks up the thread again and your actions can continue.",
    },
  },
};

export function moonAdvice(language: string, key: AdviceKey): MoonAdvice {
  const lang: Lang = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  return ADVICE[key][lang];
}
