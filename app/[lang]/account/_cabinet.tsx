"use client";

/**
 * Cabinet editor (Phase В).
 *
 * Reuses the city autocomplete + tz-lookup helpers already in
 * /studio/moon-phase/_natal.ts so the natal experience is identical
 * across the cabinet and the Moon Guide.
 *
 * When the user saves:
 *   1. We resolve the timezone via tz-lookup (only if a new city was picked)
 *   2. We compute natal_moon_lon (so the Moon Guide doesn't have to re-derive
 *      it on every render — this is the cached longitude column)
 *   3. We POST the patch to /api/account/profile
 *
 * Telegram subscription verification is deferred to Phase Д (notifications)
 * because it requires the bot deeplink + chat_id flow. For now the user
 * enters their @handle as a hint, and a "Subscribe to the channel" button
 * sends them to Ellen's channel.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mail, MapPin, Loader2, Check, LogOut } from "lucide-react";
import { TelegramSection } from "./_telegram-section";
import { PushSection } from "./_push-section";
import { MigrationModal } from "./_migration-modal";
import { useRouter } from "next/navigation";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { searchCity, coordsToIana, computeNatalMoonLon, type GeoCandidate } from "@/app/[lang]/studio/moon-phase/_natal";
import { invalidateProfileCache } from "@/hooks/useProfile";
import type { Profile } from "@/hooks/useProfile";

interface Props {
  initialProfile: Profile | null;
  email: string;
  lang: string;
}

const T = {
  uk: {
    tag: "Кабінет",
    title: "Твій профіль",
    sub: "Дані залишаються тільки в твоєму акаунті. Інструменти Студії автоматично читають твій профіль і пропонують особисту версію кожного послання.",
    section_basic: "Основні",
    section_natal: "Натальні дані",
    section_natal_hint: "Потрібні для персонального читання Місячного провідника й майбутньої Натальної карти.",
    section_telegram: "Telegram",
    section_telegram_hint: "Тут можна вказати твій @нік. Скоро ми будемо надсилати тобі важливі сповіщення (затемнення, Lunar Return, нагадування про сесію).",
    display_name: "Як до тебе звертатись",
    display_name_ph: "Олена",
    full_name: "Повне імʼя (для нумерології)",
    full_name_ph: "Олена Білик",
    email: "Email",
    birth_date: "Дата народження",
    birth_time: "Час народження",
    birth_time_hint: "Якщо точно не знаєш — постав 12:00.",
    birth_place: "Місто народження",
    birth_place_ph: "Почни вводити — Київ, Львів, …",
    tz_label: "Таймзона",
    telegram_label: "Telegram-нік",
    telegram_ph: "ellen_user",
    subscribe_cta: "Підписатись на канал Ellen",
    save: "Зберегти",
    saving: "Зберігаю…",
    saved: "✓ Збережено",
    save_err: "Не вдалось зберегти. Спробуй ще раз.",
    sign_out: "Вийти з акаунту",
    privacy: "Профіль доступний лише тобі. Жодних публічних сторінок.",
  },
  ru: {
    tag: "Кабинет",
    title: "Твой профиль",
    sub: "Данные остаются только в твоём аккаунте. Инструменты Студии автоматически читают твой профиль и предлагают личную версию каждого послания.",
    section_basic: "Основное",
    section_natal: "Натальные данные",
    section_natal_hint: "Нужны для персонального чтения Лунного проводника и будущей Натальной карты.",
    section_telegram: "Telegram",
    section_telegram_hint: "Здесь можно указать твой @ник. Скоро мы будем отправлять тебе важные уведомления (затмения, Lunar Return, напоминания о сессии).",
    display_name: "Как к тебе обращаться",
    display_name_ph: "Елена",
    full_name: "Полное имя (для нумерологии)",
    full_name_ph: "Елена Билык",
    email: "Email",
    birth_date: "Дата рождения",
    birth_time: "Время рождения",
    birth_time_hint: "Если точно не знаешь — поставь 12:00.",
    birth_place: "Город рождения",
    birth_place_ph: "Начни вводить — Киев, Львов, …",
    tz_label: "Таймзона",
    telegram_label: "Telegram-ник",
    telegram_ph: "ellen_user",
    subscribe_cta: "Подписаться на канал Ellen",
    save: "Сохранить",
    saving: "Сохраняю…",
    saved: "✓ Сохранено",
    save_err: "Не удалось сохранить. Попробуй ещё раз.",
    sign_out: "Выйти из аккаунта",
    privacy: "Профиль доступен только тебе. Никаких публичных страниц.",
  },
  en: {
    tag: "Account",
    title: "Your profile",
    sub: "Your data stays only in your account. The Studio tools read your profile automatically and offer a personal version of every reading.",
    section_basic: "Basics",
    section_natal: "Birth data",
    section_natal_hint: "Needed for personal Moon Guide readings and the upcoming Natal Chart.",
    section_telegram: "Telegram",
    section_telegram_hint: "Add your @handle here. Soon we'll send important notifications (eclipses, Lunar Return, session reminders).",
    display_name: "How should we address you",
    display_name_ph: "Olena",
    full_name: "Full name (for numerology)",
    full_name_ph: "Olena Bilyk",
    email: "Email",
    birth_date: "Birth date",
    birth_time: "Birth time",
    birth_time_hint: "If you don't know exactly — set 12:00.",
    birth_place: "Birth city",
    birth_place_ph: "Start typing — Kyiv, London, …",
    tz_label: "Timezone",
    telegram_label: "Telegram handle",
    telegram_ph: "ellen_user",
    subscribe_cta: "Subscribe to Ellen's channel",
    save: "Save",
    saving: "Saving…",
    saved: "✓ Saved",
    save_err: "Could not save. Please try again.",
    sign_out: "Sign out",
    privacy: "The profile is visible only to you. No public pages.",
  },
};

export function CabinetClient({ initialProfile, email, lang: langProp }: Props) {
  const { language } = useLanguage();
  const router = useRouter();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];

  // ── Form state ────────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [fullName, setFullName]       = useState(initialProfile?.full_name ?? "");
  const [birthDate, setBirthDate]     = useState(initialProfile?.birth_date ?? "");
  const [birthTime, setBirthTime]     = useState(initialProfile?.birth_time?.slice(0, 5) ?? "12:00");
  const [placeQuery, setPlaceQuery]   = useState(initialProfile?.birth_place ?? "");
  const [picked, setPicked] = useState<GeoCandidate | null>(
    initialProfile?.birth_lat != null && initialProfile?.birth_lon != null
      ? { label: initialProfile.birth_place ?? "", lat: initialProfile.birth_lat, lon: initialProfile.birth_lon, rawType: "saved" }
      : null,
  );
  const [tz, setTz]               = useState(initialProfile?.birth_tz ?? "");

  // ── Autocomplete state ────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<GeoCandidate[]>([]);
  const [searching, setSearching]     = useState(false);
  const [open, setOpen]               = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (picked && placeQuery === picked.label) return;
    if (placeQuery.trim().length < 2) { setSuggestions([]); return; }
    abortRef.current?.abort();
    const ac = new AbortController(); abortRef.current = ac;
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        const list = await searchCity(placeQuery, language);
        if (!ac.signal.aborted) { setSuggestions(list); setOpen(list.length > 0); }
      } catch {
        if (!ac.signal.aborted) setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => { clearTimeout(id); ac.abort(); };
  }, [placeQuery, language, picked]);

  useEffect(() => {
    if (!picked) { setTz(""); return; }
    let cancelled = false;
    (async () => {
      // Don't re-resolve if we already have a tz from the initial profile
      // matching the picked city.
      if (initialProfile?.birth_tz && picked.rawType === "saved") {
        setTz(initialProfile.birth_tz);
        return;
      }
      const resolved = await coordsToIana(picked.lat, picked.lon);
      if (!cancelled) setTz(resolved);
    })();
    return () => { cancelled = true; };
  }, [picked, initialProfile?.birth_tz]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Compute the cached natal Moon longitude if we have enough data.
      let natalMoonLon: number | null = null;
      if (birthDate && birthTime && tz) {
        try {
          natalMoonLon = computeNatalMoonLon(birthDate, birthTime, tz);
        } catch { natalMoonLon = null; }
      }

      const patch = {
        display_name: displayName || null,
        full_name: fullName || null,
        birth_date: birthDate || null,
        birth_time: birthTime || null,
        birth_place: picked?.label ?? null,
        birth_lat: picked?.lat ?? null,
        birth_lon: picked?.lon ?? null,
        birth_tz: tz || null,
        natal_moon_lon: natalMoonLon,
      };

      const res = await fetch("/api/account/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        setError(t.save_err);
      } else {
        invalidateProfileCache();
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2400);
      }
    } catch {
      setError(t.save_err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Bonus 2: one-shot prompt to pull pre-account data from the browser */}
      <MigrationModal language={language} onImported={() => router.refresh()} />

      <section className="pt-36 pb-12 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.25rem,4.5vw,3.5rem)] text-[#1C1512] mb-4 leading-[1.06]"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.title}
            </h1>
            <p className="text-[#7A6A58] leading-relaxed">{t.sub}</p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">
          <form onSubmit={handleSave} className="space-y-6">

            {/* ── Basics ── */}
            <div className="card-luxury space-y-4">
              <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">{t.section_basic}</p>

              <div>
                <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.email}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A]" />
                  <input type="email" value={email} disabled className="input-luxury w-full pl-10 opacity-70 cursor-not-allowed" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.display_name}</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                         placeholder={t.display_name_ph} className="input-luxury w-full" maxLength={80} />
                </div>
                <div>
                  <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.full_name}</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                         placeholder={t.full_name_ph} className="input-luxury w-full" maxLength={120} />
                </div>
              </div>
            </div>

            {/* ── Natal data ── */}
            <div className="card-luxury space-y-4">
              <div>
                <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">{t.section_natal}</p>
                <p className="text-xs text-[#7A6A58] mt-1 leading-snug">{t.section_natal_hint}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.birth_date}</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                         className="input-luxury w-full" min="1900-01-01"
                         max={new Date().toISOString().slice(0, 10)} />
                </div>
                <div>
                  <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.birth_time}</label>
                  <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                         className="input-luxury w-full" />
                  <p className="text-[11px] text-[#9A8A78] italic mt-1.5 leading-snug">{t.birth_time_hint}</p>
                </div>
              </div>

              <div ref={containerRef}>
                <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">{t.birth_place}</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A]" />
                  <input type="text" value={placeQuery}
                         onChange={e => { setPlaceQuery(e.target.value); setPicked(null); }}
                         onFocus={() => suggestions.length > 0 && setOpen(true)}
                         placeholder={t.birth_place_ph}
                         className="input-luxury w-full pl-10 pr-9" autoComplete="off" />
                  {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4A97A] animate-spin" />}
                  {!searching && picked && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8883A]" />}
                  {open && suggestions.length > 0 && (
                    <ul role="listbox"
                        className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-[rgba(196,169,122,0.3)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1">
                      {suggestions.map((s, i) => (
                        <li key={`${s.lat}-${s.lon}-${i}`}>
                          <button type="button"
                                  onClick={() => { setPicked(s); setPlaceQuery(s.label); setOpen(false); }}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgba(196,169,122,0.08)] flex items-start gap-2">
                            <MapPin size={14} className="text-[#C4A97A] mt-0.5 flex-shrink-0" />
                            <span className="text-[#1C1512]">{s.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {picked && tz && (
                  <p className="text-[11px] text-[#9A8A78] mt-1.5 leading-snug">
                    {t.tz_label}: <span className="font-mono">{tz}</span>
                  </p>
                )}
              </div>
            </div>

            {/* ── Telegram & notifications (Phase Д) ──
                Self-contained: fetches link state, prefs, channel sub. */}
            <TelegramSection
              language={language}
              initialChatId={initialProfile?.telegram_chat_id ?? null}
              initialUsername={initialProfile?.telegram_username ?? null}
              initialSubscribed={initialProfile?.subscribed_to_channel ?? false}
            />

            {/* ── Browser push (Phase M12) — independent of Telegram ── */}
            <PushSection language={language} />

            {/* ── Save bar ── */}
            <div className="flex items-center gap-3 flex-wrap">
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <><Loader2 size={16} className="animate-spin" /> {t.saving}</>
                        : savedAt ? t.saved : t.save}
              </button>
              {error && <span className="text-sm text-[#9A6E28]">{error}</span>}
            </div>

            <p className="text-[11px] text-[#9A8A78] italic leading-snug">🔒 {t.privacy}</p>

            {/* ── Sign out (separate form to avoid nesting POSTs) ── */}
            <form action="/api/account/sign-out" method="POST" className="pt-3 border-t border-[rgba(196,169,122,0.18)]">
              <input type="hidden" name="lang" value={langProp} />
              <button type="submit" className="inline-flex items-center gap-2 text-sm text-[#7A6A58] hover:text-[#B8883A]">
                <LogOut size={14} /> {t.sign_out}
              </button>
            </form>
          </form>
        </div>
      </section>
    </>
  );
}
