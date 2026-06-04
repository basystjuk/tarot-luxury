"use client";

/**
 * Сонник — AI dream interpreter (Phase D1).
 *
 * Flow: the dreamer writes their dream → one click runs the FREE
 * deterministic analysis (symbols, tone meter, archetypes, dictionary
 * meanings) instantly, AND fires the auth-gated AI synthesis (deep
 * interpretation, subconscious message, affirmation, reflection
 * questions). Tonight's Moon context is shown as the bridge to the Moon
 * Guide. Dreams can be saved to a local journal with pattern detection.
 *
 * Dark "night sky" theme — a deliberate departure from the site's light
 * palette, fitting the subject and matching premium peers (Co-Star, Moonly).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock, Moon, BookHeart, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import { track } from "@/lib/analytics/posthog";
import Starfield from "./_starfield";
import { analyzeDream, ARCHETYPE_LABELS } from "@/lib/dreams/analyze";
import { SYMBOL_BY_SLUG, DREAM_SYMBOLS, symbolName, type Archetype } from "@/lib/dreams/symbols";
import {
  loadJournal, saveEntry, deleteEntry, frequentSymbols, recurringSymbols, type DreamEntry, type JournalReading,
} from "./_journal";

type Lang = "uk" | "ru" | "en";

const T = {
  uk: {
    tag: "Сонник · AI-аналіз снів",
    title: "Сонник",
    sub: "Розкажіть про свій сон, а ми допоможемо зрозуміти його символіку та приховані сенси.",
    placeholder: "Наприклад: Мені наснилося, що я йшла через ліс і побачила білого вовка біля озера…",
    analyze: "Аналізувати сон",
    analyzing: "Розшифровую сон…",
    tooShort: "Опишіть сон трохи детальніше (хоча б кілька слів).",
    symbols: "Ключові символи",
    tone: "Тон сну",
    toneAnx: "Тривожний", toneNeu: "Нейтральний", toneInsp: "Натхненний",
    archetypes: "Архетипи сну",
    meanings: "Що означають символи",
    psy: "Психологія", spi: "Духовне", folk: "Народне",
    more: "Повне трактування →",
    aiTitle: "Глибокий аналіз",
    interp: "Основне трактування",
    emotional: "Емоційне послання сну",
    subconscious: "Послання підсвідомості",
    affirmation: "Афірмація",
    reflection: "Питання для саморефлексії",
    aiAnon: "Глибокий AI-аналіз доступний зареєстрованим. Символи та значення вище — для всіх.",
    aiSignin: "Створити акаунт →",
    aiRate: "Сьогодні глибокий аналіз уже зроблено. Повертайся завтра ✨",
    aiError: "Не вдалось згенерувати аналіз. Спробуй пізніше.",
    save: "Зберегти у щоденник снів",
    saved: "Збережено ✓",
    journal: "Щоденник снів",
    journalEmpty: "Тут зберігатимуться твої сни та їх трактування.",
    frequent: "Часті символи у твоїх снах",
    recurring: "Повторювані образи — можливий патерн",
    dreamOfDay: "Символ дня",
    moonLabel: "Сьогодні вночі",
    delete: "Видалити",
  },
  ru: {
    tag: "Сонник · AI-анализ снов",
    title: "Сонник",
    sub: "Расскажите о своём сне, а мы поможем понять его символику и скрытые смыслы.",
    placeholder: "Например: Мне снилось, что я шла через лес и увидела белого волка у озера…",
    analyze: "Анализировать сон",
    analyzing: "Расшифровываю сон…",
    tooShort: "Опишите сон чуть подробнее (хотя бы несколько слов).",
    symbols: "Ключевые символы",
    tone: "Тон сна",
    toneAnx: "Тревожный", toneNeu: "Нейтральный", toneInsp: "Вдохновляющий",
    archetypes: "Архетипы сна",
    meanings: "Что означают символы",
    psy: "Психология", spi: "Духовное", folk: "Народное",
    more: "Полное толкование →",
    aiTitle: "Глубокий анализ",
    interp: "Основное толкование",
    emotional: "Эмоциональное послание сна",
    subconscious: "Послание подсознания",
    affirmation: "Аффирмация",
    reflection: "Вопросы для саморефлексии",
    aiAnon: "Глубокий AI-анализ доступен зарегистрированным. Символы и значения выше — для всех.",
    aiSignin: "Создать аккаунт →",
    aiRate: "Сегодня глубокий анализ уже сделан. Возвращайся завтра ✨",
    aiError: "Не удалось сгенерировать анализ. Попробуй позже.",
    save: "Сохранить в дневник снов",
    saved: "Сохранено ✓",
    journal: "Дневник снов",
    journalEmpty: "Здесь будут храниться твои сны и их толкования.",
    frequent: "Частые символы в твоих снах",
    recurring: "Повторяющиеся образы — возможный паттерн",
    dreamOfDay: "Символ дня",
    moonLabel: "Сегодня ночью",
    delete: "Удалить",
  },
  en: {
    tag: "Dream Interpreter · AI",
    title: "Dream Interpreter",
    sub: "Tell us about your dream and we'll help you understand its symbolism and hidden meaning.",
    placeholder: "For example: I dreamed I was walking through a forest and saw a white wolf by a lake…",
    analyze: "Analyse the dream",
    analyzing: "Decoding the dream…",
    tooShort: "Describe the dream a little more (at least a few words).",
    symbols: "Key symbols",
    tone: "Tone of the dream",
    toneAnx: "Anxious", toneNeu: "Neutral", toneInsp: "Inspiring",
    archetypes: "Dream archetypes",
    meanings: "What the symbols mean",
    psy: "Psychology", spi: "Spiritual", folk: "Folk",
    more: "Full interpretation →",
    aiTitle: "Deep analysis",
    interp: "Main interpretation",
    emotional: "Emotional message of the dream",
    subconscious: "Message from the subconscious",
    affirmation: "Affirmation",
    reflection: "Self-reflection questions",
    aiAnon: "The deep AI analysis is for signed-in users. The symbols and meanings above are free.",
    aiSignin: "Create account →",
    aiRate: "Today's deep analysis is already done. Come back tomorrow ✨",
    aiError: "Could not generate the analysis. Try later.",
    save: "Save to dream journal",
    saved: "Saved ✓",
    journal: "Dream journal",
    journalEmpty: "Your dreams and their interpretations will be stored here.",
    frequent: "Frequent symbols in your dreams",
    recurring: "Recurring images — a possible pattern",
    dreamOfDay: "Symbol of the day",
    moonLabel: "Tonight",
    delete: "Delete",
  },
} satisfies Record<Lang, Record<string, string>>;

interface AiReading extends JournalReading { moon?: string }

export default function DreamsPage() {
  const { language } = useLanguage();
  const lang: Lang = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const { profile } = useProfile();

  const [text, setText] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyzeDream> | null>(null);
  const [ai, setAi] = useState<AiReading | null>(null);
  const [aiState, setAiState] = useState<"idle" | "loading" | "auth" | "rate" | "error">("idle");
  const [tooShort, setTooShort] = useState(false);
  const [journal, setJournal] = useState<DreamEntry[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => { track("tool_viewed", { tool: "dreams" }); }, []);
  useEffect(() => { setJournal(loadJournal()); }, []);

  // Symbol of the day — deterministic by day-of-year.
  const dreamOfDay = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const doy = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
    return DREAM_SYMBOLS[doy % DREAM_SYMBOLS.length];
  }, []);

  async function handleAnalyze() {
    const dream = text.trim();
    if (dream.length < 8) { setTooShort(true); return; }
    setTooShort(false);
    const res = analyzeDream(dream);
    setResult(res);
    setAi(null);
    setSavedId(null);
    track("dream_analyzed", { symbols: res.symbols.length });

    // Fire AI synthesis (auth-gated).
    setAiState("loading");
    try {
      const r = await fetch("/api/dream-reading", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: lang,
          name: profile?.display_name ?? profile?.full_name?.split(/\s+/)[0] ?? "",
          dream,
        }),
      });
      if (r.status === 401) { setAiState("auth"); return; }
      if (r.status === 429) { setAiState("rate"); return; }
      const d = await r.json();
      if (d.error) { setAiState("error"); return; }
      setAi(d);
      setAiState("idle");
    } catch { setAiState("error"); }
  }

  function handleSave() {
    if (!result) return;
    const entry: DreamEntry = {
      id: `${Date.now()}`,
      iso: new Date().toISOString(),
      text: text.trim().slice(0, 2000),
      symbols: result.symbols.map((s) => s.slug),
      tone: result.tone,
      positivityPercent: result.positivityPercent,
      archetypes: result.archetypes,
      reading: ai ?? undefined,
    };
    setJournal(saveEntry(entry));
    setSavedId(entry.id);
    track("dream_saved");
  }

  function handleDelete(id: string) {
    setJournal(deleteEntry(id));
  }

  const freq = useMemo(() => frequentSymbols(journal), [journal]);
  const recurring = useMemo(() => recurringSymbols(journal), [journal]);
  const toneLabel = (tone: string) => tone === "anxious" ? t.toneAnx : tone === "inspiring" ? t.toneInsp : t.toneNeu;

  return (
    <main className="min-h-screen bg-[#0C0A20] text-[#EDE7D8]">
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 overflow-hidden">
        <Starfield />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-[11px] tracking-[0.18em] uppercase text-[#E8D9B0] border border-[rgba(232,217,176,0.3)] bg-[rgba(232,217,176,0.06)] mb-6 dream-rise">
            {t.tag}
          </span>
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] leading-[1.02] mb-5 dream-rise"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, animationDelay: "0.05s" }}>
            {t.title}
          </h1>
          <p className="text-lg text-[#C9C0E0] leading-relaxed max-w-xl mx-auto dream-rise" style={{ animationDelay: "0.1s" }}>
            {t.sub}
          </p>
        </div>
      </section>

      {/* ── Tool ── */}
      <section className="relative pb-24 -mt-4">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          {/* Input */}
          <div className="rounded-3xl border border-[rgba(232,217,176,0.18)] bg-[rgba(255,255,255,0.04)] backdrop-blur-xl p-6 shadow-2xl">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={5}
              className="w-full bg-transparent resize-none outline-none text-[#EDE7D8] placeholder-[#7d77a0] text-lg leading-relaxed"
              style={{ fontFamily: "var(--font-cormorant)" }}
            />
            {tooShort && <p className="text-[#E0A0A0] text-sm mt-2">{t.tooShort}</p>}
            <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-[rgba(232,217,176,0.12)]">
              <span className="text-xs text-[#9089b3] flex items-center gap-1.5">
                <Moon size={13} className="text-[#E8D9B0]" /> {t.moonLabel}: {ai?.moon ?? (lang === "ru" ? "узнаешь после анализа" : lang === "en" ? "revealed after analysis" : "дізнаєшся після аналізу")}
              </span>
              <button
                onClick={handleAnalyze}
                disabled={aiState === "loading"}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[#1C1512] font-medium bg-gradient-to-br from-[#F0DBA0] to-[#C9A24F] hover:brightness-105 transition-all disabled:opacity-60 shadow-lg"
              >
                {aiState === "loading"
                  ? <><Loader2 size={16} className="animate-spin" /> {t.analyzing}</>
                  : <><Sparkles size={16} /> 🔮 {t.analyze}</>}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-6 dream-rise">
              {/* Symbols */}
              {result.symbols.length > 0 && (
                <Panel title={t.symbols}>
                  <div className="flex flex-wrap gap-2.5">
                    {result.symbols.map((s) => (
                      <Link key={s.slug} href={`/${lang}/dreams/${s.slug}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[rgba(232,217,176,0.10)] border border-[rgba(232,217,176,0.25)] hover:border-[rgba(232,217,176,0.55)] transition-colors">
                        <span className="text-lg">{s.emoji}</span>
                        <span className="text-sm text-[#EDE7D8]">{symbolName(s, lang)}</span>
                      </Link>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Tone meter */}
              <Panel title={t.tone}>
                <div className="flex items-center justify-between text-[11px] text-[#9089b3] mb-2">
                  <span>{t.toneAnx}</span><span>{t.toneNeu}</span><span>{t.toneInsp}</span>
                </div>
                <div className="relative h-2.5 rounded-full overflow-hidden"
                  style={{ background: "linear-gradient(90deg, #B5544A 0%, #C9A24F 50%, #6FA463 100%)" }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#0C0A20] shadow"
                    style={{ left: `${result.positivityPercent}%` }} />
                </div>
                <p className="text-center text-sm text-[#C9C0E0] mt-3">{toneLabel(result.tone)}</p>
              </Panel>

              {/* Archetypes */}
              {result.archetypes.length > 0 && (
                <Panel title={t.archetypes}>
                  <div className="flex flex-wrap gap-2">
                    {result.archetypes.map((a) => (
                      <span key={a} className="px-3 py-1.5 rounded-full text-sm bg-[rgba(120,90,200,0.18)] border border-[rgba(160,140,220,0.35)] text-[#D8CEF0]">
                        {ARCHETYPE_LABELS[a as Archetype][lang]}
                      </span>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Free dictionary meanings */}
              {result.symbols.length > 0 && (
                <Panel title={t.meanings}>
                  <div className="space-y-4">
                    {result.symbols.slice(0, 4).map((s) => (
                      <div key={s.slug} className="pb-4 border-b border-[rgba(232,217,176,0.10)] last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xl">{s.emoji}</span>
                          <span className="text-lg text-[#F0DBA0]" style={{ fontFamily: "var(--font-cormorant)" }}>{symbolName(s, lang)}</span>
                        </div>
                        <p className="text-sm text-[#C9C0E0] leading-relaxed">{s.psychology[lang]}</p>
                        <Link href={`/${lang}/dreams/${s.slug}`} className="inline-block mt-2 text-xs text-[#E8D9B0] hover:text-white">{t.more}</Link>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* AI synthesis */}
              <DreamAiBlock lang={lang} t={t} state={aiState} ai={ai} />

              {/* Save */}
              {result && (
                <button onClick={handleSave} disabled={!!savedId}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[rgba(232,217,176,0.3)] text-[#E8D9B0] hover:bg-[rgba(232,217,176,0.08)] transition-colors disabled:opacity-60">
                  <BookHeart size={16} /> {savedId ? t.saved : t.save}
                </button>
              )}
            </div>
          )}

          {/* ── Journal ── */}
          <div className="pt-10">
            <h2 className="text-2xl mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
              <BookHeart size={20} className="text-[#E8D9B0]" /> {t.journal}
            </h2>

            {/* Symbol of the day */}
            <Link href={`/${lang}/dreams/${dreamOfDay.slug}`}
              className="block rounded-2xl border border-[rgba(232,217,176,0.18)] bg-[rgba(255,255,255,0.04)] p-4 mb-4 hover:border-[rgba(232,217,176,0.4)] transition-colors">
              <p className="text-[10px] tracking-widest uppercase text-[#9089b3] mb-1">{t.dreamOfDay}</p>
              <p className="text-lg text-[#F0DBA0]">{dreamOfDay.emoji} {symbolName(dreamOfDay, lang)}</p>
              <p className="text-sm text-[#C9C0E0] mt-1 line-clamp-2">{dreamOfDay.psychology[lang]}</p>
            </Link>

            {/* Frequent / recurring */}
            {freq.length > 0 && (
              <div className="rounded-2xl border border-[rgba(232,217,176,0.18)] bg-[rgba(255,255,255,0.04)] p-4 mb-4">
                <p className="text-[10px] tracking-widest uppercase text-[#9089b3] mb-2">{t.frequent}</p>
                <div className="flex flex-wrap gap-2">
                  {freq.slice(0, 8).map((f) => {
                    const sym = SYMBOL_BY_SLUG[f.slug];
                    if (!sym) return null;
                    return (
                      <span key={f.slug} className="px-3 py-1 rounded-full text-sm bg-[rgba(232,217,176,0.10)] border border-[rgba(232,217,176,0.2)]">
                        {sym.emoji} {symbolName(sym, lang)} · {f.count}
                      </span>
                    );
                  })}
                </div>
                {recurring.length > 0 && (
                  <p className="text-xs text-[#E8D9B0] italic mt-3">
                    💫 {t.recurring}: {recurring.map((slug) => SYMBOL_BY_SLUG[slug] ? `${SYMBOL_BY_SLUG[slug].emoji} ${symbolName(SYMBOL_BY_SLUG[slug], lang)}` : slug).join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* History */}
            {journal.length === 0 ? (
              <p className="text-sm text-[#7d77a0] italic">{t.journalEmpty}</p>
            ) : (
              <div className="space-y-3">
                {journal.map((e) => (
                  <div key={e.id} className="rounded-2xl border border-[rgba(232,217,176,0.12)] bg-[rgba(255,255,255,0.03)] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[11px] text-[#9089b3]">
                        {new Date(e.iso).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-GB" : "uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <button onClick={() => handleDelete(e.id)} aria-label={t.delete} className="text-[#7d77a0] hover:text-[#E0A0A0] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm text-[#C9C0E0] mt-1 line-clamp-2">{e.text}</p>
                    {e.symbols.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {e.symbols.map((slug) => SYMBOL_BY_SLUG[slug] && (
                          <span key={slug} className="text-base" title={symbolName(SYMBOL_BY_SLUG[slug], lang)}>{SYMBOL_BY_SLUG[slug].emoji}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[rgba(232,217,176,0.16)] bg-[rgba(255,255,255,0.04)] backdrop-blur-xl p-6">
      <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#9089b3] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function DreamAiBlock({ lang, t, state, ai }: {
  lang: Lang; t: typeof T["uk"]; state: "idle" | "loading" | "auth" | "rate" | "error"; ai: AiReading | null;
}) {
  if (state === "auth") {
    return (
      <Panel title={t.aiTitle}>
        <div className="flex items-start gap-3">
          <Lock size={18} className="text-[#E8D9B0] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-[#C9C0E0] leading-relaxed mb-3">{t.aiAnon}</p>
            <Link href={`/${lang}/account/sign-in?next=/${lang}/studio/dreams`}
              className="inline-flex px-5 py-2.5 rounded-full text-[#1C1512] bg-gradient-to-br from-[#F0DBA0] to-[#C9A24F] text-sm">
              {t.aiSignin}
            </Link>
          </div>
        </div>
      </Panel>
    );
  }
  if (state === "loading") {
    return (
      <Panel title={t.aiTitle}>
        <div className="flex items-center gap-3 text-[#C9C0E0] py-4">
          <Loader2 size={18} className="animate-spin text-[#E8D9B0]" /> {t.analyzing}
        </div>
      </Panel>
    );
  }
  if (state === "rate") return <Panel title={t.aiTitle}><p className="text-sm text-[#C9C0E0] italic text-center py-2">{t.aiRate}</p></Panel>;
  if (state === "error") return <Panel title={t.aiTitle}><p className="text-sm text-[#E0A0A0] text-center py-2">{t.aiError}</p></Panel>;
  if (!ai) return null;

  return (
    <div className="space-y-4">
      {ai.interpretation && (
        <Panel title={t.interp}>
          <p className="text-[#E4DCC8] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}>{ai.interpretation}</p>
        </Panel>
      )}
      {ai.emotionalMessage && (
        <div className="rounded-3xl border border-[rgba(200,162,79,0.3)] bg-[rgba(200,162,79,0.08)] p-6">
          <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#C9A24F] mb-2">{t.emotional}</h3>
          <p className="text-[#E4DCC8] leading-relaxed">{ai.emotionalMessage}</p>
        </div>
      )}
      {ai.subconsciousMessage && (
        <div className="rounded-3xl border border-[rgba(160,140,220,0.3)] bg-[rgba(120,90,200,0.12)] p-6">
          <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#B9A8E8] mb-2">💫 {t.subconscious}</h3>
          <p className="text-[#E4DCC8] leading-relaxed">{ai.subconsciousMessage}</p>
        </div>
      )}
      {ai.affirmation && (
        <div className="rounded-3xl border border-[rgba(232,217,176,0.3)] bg-[rgba(232,217,176,0.06)] p-6 text-center">
          <h3 className="text-[10px] tracking-[0.18em] uppercase text-[#9089b3] mb-2">{t.affirmation}</h3>
          <p className="text-xl text-[#F0DBA0] italic leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>“{ai.affirmation}”</p>
        </div>
      )}
      {ai.reflectionQuestions && ai.reflectionQuestions.length > 0 && (
        <Panel title={t.reflection}>
          <ul className="space-y-2.5">
            {ai.reflectionQuestions.map((q, i) => (
              <li key={i} className="text-[#C9C0E0] leading-relaxed flex gap-2"><span className="text-[#E8D9B0]">→</span> {q}</li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
