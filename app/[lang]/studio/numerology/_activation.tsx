"use client";

/**
 * "Activation" — concrete actions block (Phase Н2).
 *
 * Anonymous users see the button → click leads to /account/sign-in with
 * a `next=` redirect back to the page (with form state preserved in URL
 * params is too brittle, so we just leave a hint that they'll need to
 * recompute after sign-in — short-term acceptable cost).
 *
 * Authenticated users get 1 request per Kyiv day; the response is split
 * into 3 sections (today / this_week / this_month).
 */

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Lock, ChevronRight } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  language: string;
  /** All numbers needed by the activation prompt. */
  payload: {
    name: string;
    lifePath: number;
    destiny: number;
    personalYear: number;
    personalMonth?: number;
    personalDay?: number;
    activePinnacle?: number;
    activeChallenge?: number;
    hiddenPassion?: number;
    karmicLessons?: number[];
  };
}

interface ActivationResult {
  today?: string;
  this_week?: string;
  this_month?: string;
}

const T = {
  uk: {
    heading: "Активація — що зробити",
    sub: "Конкретні дії для сьогодні, тижня й місяця на основі твоїх чисел. AI-помічник.",
    cta_anon: "Створи акаунт щоб отримати активацію",
    cta_anon_hint: "AI-активація — для зареєстрованих. Карта дня залишається безкоштовною для всіх.",
    cta_signin: "Увійти до акаунту →",
    cta: "Отримати активацію",
    loading: "Думаю над твоїми числами…",
    today_label: "Сьогодні",
    week_label: "Цей тиждень",
    month_label: "Цей місяць",
    rate: "Ти вже отримав активацію сьогодні. Повертайся завтра ✨",
    error: "Щось пішло не так. Спробуй пізніше.",
  },
  ru: {
    heading: "Активация — что сделать",
    sub: "Конкретные действия для сегодня, недели и месяца на основе твоих чисел. AI-помощник.",
    cta_anon: "Создай аккаунт чтобы получить активацию",
    cta_anon_hint: "AI-активация — для зарегистрированных. Карта дня остаётся бесплатной для всех.",
    cta_signin: "Войти в аккаунт →",
    cta: "Получить активацию",
    loading: "Думаю над твоими числами…",
    today_label: "Сегодня",
    week_label: "Эта неделя",
    month_label: "Этот месяц",
    rate: "Ты уже получил активацию сегодня. Возвращайся завтра ✨",
    error: "Что-то пошло не так. Попробуй позже.",
  },
  en: {
    heading: "Activation — what to do",
    sub: "Concrete actions for today, the week and the month based on your numbers. AI-powered.",
    cta_anon: "Create an account to receive activation",
    cta_anon_hint: "AI activation is for signed-in users. The Daily Card stays free for everyone.",
    cta_signin: "Sign in to your account →",
    cta: "Get activation",
    loading: "Thinking through your numbers…",
    today_label: "Today",
    week_label: "This week",
    month_label: "This month",
    rate: "You've already received activation today. Come back tomorrow ✨",
    error: "Something went wrong. Try again later.",
  },
};

export function ActivationBlock({ language, payload }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];

  const { profile, loading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ActivationResult | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/numerology-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, language }),
      });
      if (res.status === 401) {
        setError(t.cta_anon);
        return;
      }
      if (res.status === 429) {
        setRateLimited(true);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setError(t.error);
      } else {
        setResult(data);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-luxury">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C4A97A] flex items-center justify-center text-white">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {t.heading}
          </h3>
          <p className="text-sm text-[#7A6A58] mt-1 leading-relaxed">{t.sub}</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          {[
            { label: t.today_label,  text: result.today,      accent: true },
            { label: t.week_label,   text: result.this_week,  accent: false },
            { label: t.month_label,  text: result.this_month, accent: false },
          ].map((block, i) => (
            block.text && (
              <div key={i} className={`p-4 rounded-xl border ${block.accent
                ? "bg-[rgba(212,168,83,0.10)] border-[rgba(212,168,83,0.32)]"
                : "bg-[rgba(196,169,122,0.05)] border-[rgba(196,169,122,0.18)]"
              }`}>
                <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-2">{block.label}</p>
                <p className="text-sm text-[#5C4530] leading-relaxed whitespace-pre-wrap">{block.text}</p>
              </div>
            )
          ))}
        </div>
      ) : rateLimited ? (
        <p className="text-sm text-[#7A6A58] italic text-center py-3">{t.rate}</p>
      ) : profileLoading ? (
        <div className="flex items-center justify-center py-3 text-[#9A8A78] text-sm">
          <Loader2 size={14} className="animate-spin mr-2" /> …
        </div>
      ) : !profile ? (
        // Anonymous: redirect to sign-in
        <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)] space-y-3">
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-[#B8883A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#5C4530] font-medium">{t.cta_anon}</p>
              <p className="text-xs text-[#7A6A58] mt-1 leading-relaxed">{t.cta_anon_hint}</p>
            </div>
          </div>
          <Link
            href={`/${lang}/account/sign-in?next=/${lang}/studio/numerology`}
            className="btn-primary text-sm inline-flex"
          >
            {t.cta_signin}
          </Link>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleRun}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> {t.loading}</>
                     : <><Sparkles size={14} /> {t.cta}</>}
          </button>
          {error && <p className="text-sm text-[#9A6E28] mt-3 text-center">{error}</p>}
        </>
      )}
    </div>
  );
}
