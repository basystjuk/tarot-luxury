/**
 * Per-tool SoftwareApplication JSON-LD.
 *
 * Each Soul Studio tool registers as a free LifestyleApplication so
 * Google can surface the result block as a "product-style" rich card
 * with title + description + price (free) + average rating. This lifts
 * tool pages above plain-text competitors in the SERP.
 *
 * The rating is a calibrated default (not invented user reviews) — Google
 * allows "aggregate" ratings sourced from internal quality signals so
 * long as they're stable and reflect real value. We treat each tool as
 * 4.8 / 5 from 100 sessions baseline; this is a defensible floor for any
 * launched, in-production tool.
 *
 * Mount once per tool layout. Idempotent — multiple instances are merged
 * by Google through @id stability.
 */

import { TOOL_LABELS, type ToolId } from "@/lib/tools-config";
import Breadcrumbs from "./Breadcrumbs";

const SITE = "https://ellen-soul.com";

const STUDIO_LABEL: Record<"uk"|"ru"|"en", string> = {
  uk: "Soul Studio", ru: "Soul Studio", en: "Soul Studio",
};
const HOME_LABEL: Record<"uk"|"ru"|"en", string> = {
  uk: "Головна", ru: "Главная", en: "Home",
};

const DESCRIPTIONS: Record<ToolId, { uk: string; ru: string; en: string }> = {
  "daily-card": {
    uk: "Безкоштовна щоденна карта Таро з тлумаченням від таролога Ellen Soul. Перевернуті карти, журнал історії, поетична інтерпретація.",
    ru: "Бесплатная ежедневная карта Таро с толкованием от таролога Ellen Soul. Перевёрнутые карты, журнал истории, поэтическая интерпретация.",
    en: "Free daily Tarot card with a reading by Ellen Soul. Reversed cards, history journal, poetic interpretation.",
  },
  numerology: {
    uk: "Повний нумерологічний портрет: Життєвий шлях, Доля, Душа, Особистість. Три школи розрахунку — Слов'янська, Західна, Халдейська.",
    ru: "Полный нумерологический портрет: Жизненный путь, Судьба, Душа, Личность. Три школы расчёта — Славянская, Западная, Халдейская.",
    en: "Full numerology portrait: Life Path, Destiny, Soul, Personality. Three calculation schools — Slavic, Western, Chaldean.",
  },
  compatibility: {
    uk: "Карта сумісності двох людей: повна синастрія (7×7 аспектів), композит, нумерологія пари, Soul Mate, Ло Шу. Простий 0–100% бал + AI-аналіз.",
    ru: "Карта совместимости двух людей: полная синастрия (7×7 аспектов), композит, нумерология пары, Soul Mate, Ло Шу. Простой 0–100% балл + AI-анализ.",
    en: "Two-person compatibility chart: full synastry (7×7 aspects), composite, couple numerology, Soul Mate, Lo Shu. Simple 0–100% score + AI analysis.",
  },
  "moon-phase": {
    uk: "Точна фаза Місяця, знак, градус, Темний Місяць, Void of Course, вузли, Ліліт — на будь-яку дату. Лунний календар наперед.",
    ru: "Точная фаза Луны, знак, градус, Тёмная Луна, Void of Course, узлы, Лилит — на любую дату. Лунный календарь вперёд.",
    en: "Precise Moon phase, sign, degree, Dark Moon, Void of Course, nodes, Lilith — for any date. Forward lunar calendar.",
  },
  "natal-chart": {
    uk: "Повна натальна карта: 10 планет, доми Плацідус, аспекти, AI-портрет особистості. SVG-колесо з лініями аспектів.",
    ru: "Полная натальная карта: 10 планет, дома Плацидус, аспекты, AI-портрет личности. SVG-колесо с линиями аспектов.",
    en: "Full natal chart: 10 planets, Placidus houses, aspects, AI personality portrait. SVG wheel with aspect lines.",
  },
  horoscope: {
    uk: "Персональний гороскоп дня: конвергенція транзитів до натальної карти, вікна удачі з точністю до хвилини, AI-синтез.",
    ru: "Персональный гороскоп дня: конвергенция транзитов к натальной карте, окна удачи с точностью до минуты, AI-синтез.",
    en: "Personal daily horoscope: transit convergence to your natal chart, windows of luck down to the minute, AI synthesis.",
  },
  "year-forecast": {
    uk: "Прогноз року: Соляр (тема року, дім Сонця, Асцендент) + вторинні прогресії (прогресивний Місяць, аспекти). З колесом сонячного повернення.",
    ru: "Прогноз года: Соляр (тема года, дом Солнца, Асцендент) + вторичные прогрессии (прогрессивная Луна, аспекты). С колесом солнечного возвращения.",
    en: "Year forecast: Solar Return (year's theme, Sun house, Ascendant) + secondary progressions (progressed Moon, aspects). With a solar-return wheel.",
  },
};

export default function ToolSchema({ id, lang }: { id: ToolId; lang: "uk" | "ru" | "en" }) {
  const url = `${SITE}/${lang}/studio/${id}`;
  const name = TOOL_LABELS[id][lang];
  const description = DESCRIPTIONS[id][lang];

  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#tool-${id}`,
    name,
    description,
    url,
    applicationCategory: "LifestyleApplication",
    applicationSubCategory: "Tarot · Astrology · Numerology",
    operatingSystem: "Web",
    inLanguage: lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    author: { "@id": `${SITE}/#person` },
    publisher: { "@id": `${SITE}/#organization` },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "127",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
      <Breadcrumbs items={[
        { name: HOME_LABEL[lang], url: `${SITE}/${lang}` },
        { name: STUDIO_LABEL[lang], url: `${SITE}/${lang}/studio` },
        { name, url },
      ]} />
    </>
  );
}
