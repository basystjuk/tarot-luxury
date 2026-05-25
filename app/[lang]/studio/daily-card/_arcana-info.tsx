"use client";

/**
 * Tiny educational block under the daily card.
 *
 * Pros (taroists) and novices alike asked for the same thing: a quick way
 * to know "what is this card-type, and what does its suit mean?". Shown
 * collapsed by default to keep the result page clean; expand on tap.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TarotCard } from "@/lib/data/tarot-cards";

interface Props {
  card: TarotCard;
  language: string;
}

const ELEMENT_INFO: Record<string, {
  glyph: string;
  uk: { name: string; sphere: string };
  ru: { name: string; sphere: string };
  en: { name: string; sphere: string };
}> = {
  wands: {
    glyph: "🔥",
    uk: { name: "Жезли · Вогонь", sphere: "Дія, воля, проєкти, кар'єра, творча енергія, ентузіазм." },
    ru: { name: "Жезлы · Огонь",  sphere: "Действие, воля, проекты, карьера, творческая энергия, энтузиазм." },
    en: { name: "Wands · Fire",   sphere: "Action, willpower, projects, career, creative energy, enthusiasm." },
  },
  cups: {
    glyph: "💧",
    uk: { name: "Кубки · Вода",  sphere: "Емоції, стосунки, інтуїція, любов, чуттєвість, внутрішній світ." },
    ru: { name: "Кубки · Вода",  sphere: "Эмоции, отношения, интуиция, любовь, чувственность, внутренний мир." },
    en: { name: "Cups · Water",  sphere: "Emotions, relationships, intuition, love, feeling, the inner world." },
  },
  swords: {
    glyph: "💨",
    uk: { name: "Мечі · Повітря", sphere: "Думки, рішення, комунікація, конфлікти, правда, інтелект." },
    ru: { name: "Мечи · Воздух",  sphere: "Мысли, решения, коммуникация, конфликты, правда, интеллект." },
    en: { name: "Swords · Air",   sphere: "Thoughts, decisions, communication, conflict, truth, intellect." },
  },
  pentacles: {
    glyph: "🌿",
    uk: { name: "Пентаклі · Земля", sphere: "Матерія, гроші, тіло, робота, дім, здоров'я, ресурси." },
    ru: { name: "Пентакли · Земля", sphere: "Материя, деньги, тело, работа, дом, здоровье, ресурсы." },
    en: { name: "Pentacles · Earth", sphere: "Matter, money, body, work, home, health, resources." },
  },
};

const ARCANA_INFO = {
  major: {
    uk: { title: "Старший Аркан", desc: "22 карти великих архетипів долі — поворотні моменти, духовні уроки, фундаментальні теми життя. Коли випадає Старший — день про щось важливе, що зараз відбувається." },
    ru: { title: "Старший Аркан", desc: "22 карты великих архетипов судьбы — поворотные моменты, духовные уроки, фундаментальные темы жизни. Когда выпадает Старший — день о чём-то важном, что сейчас происходит." },
    en: { title: "Major Arcana",  desc: "22 cards of life's great archetypes — turning points, spiritual lessons, fundamental themes. When a Major Arcana appears, the day is about something important happening now." },
  },
  minor: {
    uk: { title: "Молодший Аркан", desc: "56 карт повсякденних подій — щоденні емоції, рішення, дії, ситуації. Кожна з 4 мастей описує свою сферу через елемент." },
    ru: { title: "Младший Аркан", desc: "56 карт повседневных событий — ежедневные эмоции, решения, действия, ситуации. Каждая из 4 мастей описывает свою сферу через элемент." },
    en: { title: "Minor Arcana",  desc: "56 cards of everyday events — daily emotions, decisions, actions, situations. Each of the 4 suits describes its sphere through an element." },
  },
};

export function ArcanaInfo({ card, language }: Props) {
  const [open, setOpen] = useState(false);
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const isMajor = card.suit === "major";
  const arcana = ARCANA_INFO[isMajor ? "major" : "minor"][lang];
  const element = !isMajor ? ELEMENT_INFO[card.suit] : null;

  return (
    <div className="w-full max-w-xl mx-auto">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[rgba(196,169,122,0.08)] border border-[rgba(196,169,122,0.2)] hover:bg-[rgba(196,169,122,0.12)] transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">{isMajor ? "✦" : element?.glyph}</span>
          <div>
            <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">
              {arcana.title}
            </p>
            {element && (
              <p className="text-sm text-[#5C4530]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                {element[lang].name}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#C4A97A] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 p-4 rounded-xl bg-white/60 border border-[rgba(196,169,122,0.15)] text-sm text-[#5C4530] leading-relaxed space-y-2">
          <p>{arcana.desc}</p>
          {element && (
            <p className="italic">
              <strong className="not-italic text-[#B8883A]">
                {lang === "ru" ? "Сфера" : lang === "en" ? "Sphere" : "Сфера"}:
              </strong>{" "}
              {element[lang].sphere}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
