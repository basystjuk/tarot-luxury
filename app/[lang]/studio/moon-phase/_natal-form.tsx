"use client";

/**
 * Natal-mode form (Phase #3).
 *
 * Collects birth date / time / place, runs city autocomplete against
 * Nominatim (debounced), resolves the timezone via `tz-lookup` once a
 * city is picked, computes the natal Moon longitude, and persists the
 * whole thing to localStorage.
 *
 * Visual style mirrors the existing `card-luxury` form on the page so
 * the natal tab feels native, not bolted-on. The component is fully
 * self-contained — the parent only needs to react to `onSaved` and
 * read fresh state via `loadNatal()`.
 */

import { useEffect, useRef, useState } from "react";
import { Check, MapPin, Loader2, X } from "lucide-react";
import {
  type GeoCandidate, type NatalProfile,
  searchCity, coordsToIana, computeNatalMoonLon,
  loadNatal, saveNatal, clearNatal,
} from "./_natal";

interface Props {
  language: string;
  onSaved: (profile: NatalProfile | null) => void;
}

const T = {
  uk: {
    title: "Твій натальний Місяць",
    sub: "Введи дату, час і місто народження — збережемо в браузері й завжди показуватимемо твою особисту місячну погоду.",
    date: "Дата народження",
    time: "Час народження",
    timeHint: "Якщо точно не знаєш — постав 12:00, тільки знак буде грубий.",
    place: "Місце народження",
    placePh: "Почни вводити — Київ, Львів, …",
    save: "Зберегти натальний профіль",
    saved: "✓ Збережено",
    clear: "Видалити дані",
    privacy: "Дані залишаються тільки у твоєму браузері — нікуди не надсилаються.",
    noMatches: "Нічого не знайдено. Спробуй іншу мову або повну назву.",
    loading: "Шукаю…",
    tz: "Таймзона",
    saved_block_title: "Натальний Місяць",
    edit: "Редагувати",
  },
  ru: {
    title: "Твоя натальная Луна",
    sub: "Введи дату, время и город рождения — сохраним в браузере и всегда будем показывать твою личную лунную погоду.",
    date: "Дата рождения",
    time: "Время рождения",
    timeHint: "Если точно не знаешь — поставь 12:00, только знак будет грубым.",
    place: "Место рождения",
    placePh: "Начни вводить — Киев, Львов, …",
    save: "Сохранить натальный профиль",
    saved: "✓ Сохранено",
    clear: "Удалить данные",
    privacy: "Данные остаются только в твоём браузере — никуда не отправляются.",
    noMatches: "Ничего не найдено. Попробуй другой язык или полное название.",
    loading: "Ищу…",
    tz: "Таймзона",
    saved_block_title: "Натальная Луна",
    edit: "Редактировать",
  },
  en: {
    title: "Your natal Moon",
    sub: "Enter your birth date, time and city — we'll keep it in your browser and always show your personal lunar weather.",
    date: "Birth date",
    time: "Birth time",
    timeHint: "If you don't know the exact time — use 12:00; only the sign will be approximate.",
    place: "Birth place",
    placePh: "Start typing — Kyiv, London, …",
    save: "Save natal profile",
    saved: "✓ Saved",
    clear: "Delete data",
    privacy: "Data stays only in your browser — nothing is ever sent anywhere.",
    noMatches: "Nothing found. Try another language or a full name.",
    loading: "Searching…",
    tz: "Timezone",
    saved_block_title: "Natal Moon",
    edit: "Edit",
  },
};

export function NatalForm({ language, onSaved }: Props) {
  const t = T[language === "ru" ? "ru" : language === "en" ? "en" : "uk"];

  const existing = typeof window !== "undefined" ? loadNatal() : null;

  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? "");
  const [birthTime, setBirthTime] = useState(existing?.birthTime ?? "12:00");
  const [placeQuery, setPlaceQuery] = useState(existing?.birthPlace ?? "");
  const [picked, setPicked] = useState<GeoCandidate | null>(
    existing
      ? { label: existing.birthPlace, lat: existing.lat, lon: existing.lon, rawType: "saved" }
      : null
  );
  const [tz, setTz] = useState<string>(existing?.tz ?? "");

  const [suggestions, setSuggestions] = useState<GeoCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Debounced city search. 350ms is comfortable typing speed; Nominatim
  // asks for ≤1 req/sec and we want to be polite. AbortController kills
  // the previous request when the user keeps typing.
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    // Don't search if the field already matches what's been picked.
    if (picked && placeQuery === picked.label) return;
    if (placeQuery.trim().length < 2) { setSuggestions([]); return; }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const id = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const list = await searchCity(placeQuery, language);
        if (!ac.signal.aborted) {
          setSuggestions(list);
          setOpen(list.length > 0);
        }
      } catch {
        if (!ac.signal.aborted) setSuggestions([]);
      } finally {
        if (!ac.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => { clearTimeout(id); ac.abort(); };
  }, [placeQuery, language, picked]);

  // Resolve tz when a city is picked.
  useEffect(() => {
    if (!picked) { setTz(""); return; }
    let cancelled = false;
    (async () => {
      const resolved = await coordsToIana(picked.lat, picked.lon);
      if (!cancelled) setTz(resolved);
    })();
    return () => { cancelled = true; };
  }, [picked]);

  // Close the dropdown when clicking outside.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const canSave = Boolean(birthDate && birthTime && picked && tz);

  const handleSave = () => {
    if (!canSave || !picked) return;
    setSaving(true);
    setError(null);
    try {
      const natalMoonLon = computeNatalMoonLon(birthDate, birthTime, tz);
      const profile: NatalProfile = {
        birthDate, birthTime,
        birthPlace: picked.label,
        lat: picked.lat, lon: picked.lon,
        tz,
        natalMoonLon,
        savedAt: new Date().toISOString(),
      };
      saveNatal(profile);
      onSaved(profile);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2400);
    } catch {
      setError(t.noMatches);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    clearNatal();
    setBirthDate("");
    setBirthTime("12:00");
    setPlaceQuery("");
    setPicked(null);
    setTz("");
    setSuggestions([]);
    onSaved(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2
          className="text-2xl text-[#1C1512] mb-1.5"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
        >
          {t.title}
        </h2>
        <p className="text-sm text-[#7A6A58] leading-relaxed">{t.sub}</p>
      </div>

      {/* Date + Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">
            {t.date}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="input-luxury w-full"
            min="1900-01-01"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div>
          <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">
            {t.time}
          </label>
          <input
            type="time"
            value={birthTime}
            onChange={e => setBirthTime(e.target.value)}
            className="input-luxury w-full"
          />
          <p className="text-[11px] text-[#9A8A78] italic mt-1.5 leading-snug">{t.timeHint}</p>
        </div>
      </div>

      {/* Place autocomplete */}
      <div ref={containerRef}>
        <label className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">
          {t.place}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A] pointer-events-none">
            <MapPin size={16} />
          </div>
          <input
            type="text"
            value={placeQuery}
            onChange={e => {
              setPlaceQuery(e.target.value);
              setPicked(null);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={t.placePh}
            className="input-luxury w-full pl-10 pr-9"
            autoComplete="off"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4A97A]">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
          {!searching && picked && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B8883A]">
              <Check size={16} />
            </div>
          )}
          {open && suggestions.length > 0 && (
            <ul
              role="listbox"
              className="absolute z-30 mt-1 w-full max-h-72 overflow-y-auto rounded-xl border border-[rgba(196,169,122,0.3)] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] py-1"
            >
              {suggestions.map((s, i) => (
                <li key={`${s.lat}-${s.lon}-${i}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setPicked(s);
                      setPlaceQuery(s.label);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[rgba(196,169,122,0.08)] flex items-start gap-2"
                  >
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
            {t.tz}: <span className="font-mono">{tz}</span>
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Privacy line */}
      <p className="text-[11px] text-[#9A8A78] italic leading-snug border-t border-[rgba(196,169,122,0.15)] pt-3">
        🔒 {t.privacy}
      </p>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="btn-luxury disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {justSaved ? t.saved : t.save}
        </button>
        {existing && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[#9A8A78] hover:text-[#B8883A] inline-flex items-center gap-1"
          >
            <X size={12} /> {t.clear}
          </button>
        )}
      </div>
    </div>
  );
}
