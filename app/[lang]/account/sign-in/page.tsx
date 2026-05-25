"use client";

/**
 * Email magic-link sign-in (Phase В).
 *
 * The simplest possible auth: user enters email → Supabase sends a one-time
 * link → clicking it opens our /account/callback route, which exchanges
 * the code for a session cookie. No passwords, no SMS, no third-party
 * OAuth providers (yet).
 *
 * Localised to uk/ru/en. If Supabase isn't configured (env vars missing
 * in production), the page shows a friendly "coming soon" state instead
 * of crashing.
 */

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

const T = {
  uk: {
    tag: "Кабінет",
    title: "Увійди до кабінету",
    sub: "Введи email — надішлемо тобі одноразове посилання для входу. Без паролів і реєстрації.",
    emailLabel: "Email",
    emailPh: "ти@приклад.com",
    submit: "Надіслати посилання",
    sending: "Надсилаємо…",
    sent_title: "Перевір пошту ✨",
    sent_body: "Ми надіслали посилання на",
    sent_hint: "Клік на нього й ти автоматично увійдеш. Лист може потрапити в «Промоакції» — перевір там теж.",
    err_generic: "Не вдалось надіслати. Спробуй ще раз через хвилину.",
    err_email: "Перевір формат email.",
    privacy: "Ми ніколи не надсилаємо спам. Твій email потрібен лише для входу та одного автоматичного листа з посиланням.",
    unconfigured: "Кабінет тимчасово недоступний. Спробуй пізніше.",
  },
  ru: {
    tag: "Кабинет",
    title: "Войди в кабинет",
    sub: "Введи email — отправим тебе одноразовую ссылку для входа. Без паролей и регистрации.",
    emailLabel: "Email",
    emailPh: "ты@пример.com",
    submit: "Отправить ссылку",
    sending: "Отправляем…",
    sent_title: "Проверь почту ✨",
    sent_body: "Мы отправили ссылку на",
    sent_hint: "Клик по ней — и ты автоматически войдёшь. Письмо может попасть в «Промоакции» — проверь и там.",
    err_generic: "Не удалось отправить. Попробуй ещё раз через минуту.",
    err_email: "Проверь формат email.",
    privacy: "Мы никогда не отправляем спам. Твой email нужен только для входа и одного автоматического письма со ссылкой.",
    unconfigured: "Кабинет временно недоступен. Попробуй позже.",
  },
  en: {
    tag: "Account",
    title: "Sign in to your account",
    sub: "Enter your email — we'll send you a one-time link to sign in. No passwords, no signup.",
    emailLabel: "Email",
    emailPh: "you@example.com",
    submit: "Send the link",
    sending: "Sending…",
    sent_title: "Check your inbox ✨",
    sent_body: "We sent a sign-in link to",
    sent_hint: "Click it and you'll be signed in automatically. The email may land in Promotions — check there too.",
    err_generic: "Could not send. Please try again in a minute.",
    err_email: "Please check the email format.",
    privacy: "We never send spam. Your email is used only for sign-in and one automated link email.",
    unconfigured: "The account area is temporarily unavailable. Please try later.",
  },
};

export default function SignInPage() {
  const { language } = useLanguage();
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];
  const configured = isSupabaseConfigured();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t.err_email);
      return;
    }
    const supa = getSupabaseBrowser();
    if (!supa) { setError(t.unconfigured); return; }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/${language}/account/callback`;
      const { error: supaError } = await supa.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (supaError) {
        setError(t.err_generic);
      } else {
        setSent(trimmed);
      }
    } catch {
      setError(t.err_generic);
    } finally {
      setLoading(false);
    }
  }

  if (!configured) {
    return (
      <section className="pt-36 pb-24 bg-[#FDFBF7] min-h-[60vh]">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-[#7A6A58] italic">{t.unconfigured}</p>
        </div>
      </section>
    );
  }

  return (
    <>
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
        <div className="max-w-md mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury">
              {sent ? (
                <div className="text-center space-y-3">
                  <div className="text-4xl mb-1">📨</div>
                  <h2 className="text-2xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                    {t.sent_title}
                  </h2>
                  <p className="text-sm text-[#5C4530]">
                    {t.sent_body} <strong className="text-[#B8883A]">{sent}</strong>
                  </p>
                  <p className="text-xs text-[#7A6A58] italic leading-relaxed">{t.sent_hint}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-xs text-[#B8883A] tracking-widest uppercase mb-2">
                      {t.emailLabel}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A]" size={16} />
                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={t.emailPh}
                        className="input-luxury w-full pl-10"
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-[#9A6E28]">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center disabled:opacity-60"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> {t.sending}</> : t.submit}
                  </button>
                  <p className="text-[11px] text-[#9A8A78] italic leading-snug text-center pt-2">
                    🔒 {t.privacy}
                  </p>
                </form>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
