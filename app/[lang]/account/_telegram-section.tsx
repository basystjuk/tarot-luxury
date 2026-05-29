"use client";

/**
 * Cabinet's "Telegram & notifications" section (Phase Д).
 *
 * Three sub-blocks:
 *   1. Bot connection — "Connect Telegram" button → opens t.me/bot?start=token,
 *      bot writes chat_id back to profile. Cabinet polls /api/account/profile
 *      every 3s until chat_id appears, then reveals the "Connected" state.
 *   2. Channel subscription — "Check" button hits getChatMember + writes
 *      subscribed_to_channel; "Subscribe to channel" deeplink to t.me/channel.
 *   3. Notification preferences — six toggles (eclipse, lunar return, weekly,
 *      moon phase peaks, daily card, Ellen broadcasts).
 *
 * The component is self-contained — it fetches its own data, so the parent
 * cabinet doesn't need to pass anything except language.
 */

import { useEffect, useState } from "react";
import { Loader2, Send, ExternalLink, Check, AlertCircle, BellRing } from "lucide-react";

interface Props {
  language: string;
  initialChatId: number | null;
  initialUsername: string | null;
  initialSubscribed: boolean;
}

interface NotifPrefs {
  daily_card: boolean;
  weekly_card: boolean;
  eclipse_alerts: boolean;
  lunar_return: boolean;
  moon_phase_peaks: boolean;
  ellen_news: boolean;
  solar_return: boolean;
  mercury_retrograde: boolean;
  daily_horoscope: boolean;
}

const ELLEN_CHANNEL_URL = "https://t.me/ellen_rouge";

const T = {
  uk: {
    section: "Telegram-нотифікації",
    section_hint: "Підключи бот — і ми надсилатимемо тобі важливі моменти Місяця прямо в Telegram.",
    not_configured: "Telegram-нотифікації тимчасово недоступні.",

    not_linked_title: "Telegram не підключено",
    connect: "Підключити Telegram",
    connecting: "Генерую посилання…",
    open_bot: "Відкрити бот у Telegram",
    waiting: "Очікую підтвердження від бота…",
    waiting_hint: "Натисни «Start» у вікні бота. Це вікно автоматично оновиться.",

    linked_title: "Telegram підключено",
    chat_id_label: "Chat ID",
    test_send: "Надіслати тестове повідомлення",
    test_sending: "Надсилаю…",
    test_sent: "✓ Надіслано — перевір Telegram",
    test_err: "Не вдалось надіслати.",

    sub_title: "Підписка на канал",
    sub_status_yes: "✓ Ти підписаний(на) на канал Ellen",
    sub_status_no: "Ти ще не підписаний(на) на канал Ellen",
    sub_status_unknown: "Підписку ще не перевірено",
    sub_subscribe: "Підписатись на канал",
    sub_check: "Перевірити підписку",
    sub_checking: "Перевіряю…",
    sub_link_first: "Спочатку підключи Telegram-бот вище.",

    prefs_title: "Що надсилати",
    prefs_eclipse: "Сповіщення про затемнення",
    prefs_eclipse_hint: "За 24-36 год до сонячного або місячного затемнення.",
    prefs_lunar: "Lunar Return",
    prefs_lunar_hint: "Твоє особисте місячне повернення (потребує натальних даних).",
    prefs_weekly: "Карта тижня (понеділок)",
    prefs_weekly_hint: "Нагадування витягти карту на тиждень.",
    prefs_peaks: "Новий / Повний Місяць",
    prefs_peaks_hint: "Кульмінаційні моменти циклу.",
    prefs_daily: "Карта дня",
    prefs_daily_hint: "Щоденне нагадування витягти карту.",
    prefs_horoscope: "Гороскоп дня",
    prefs_horoscope_hint: "Ранковий ping лише у виразні дні (потоковий / турбулентний).",
    prefs_solar: "Соляне повернення",
    prefs_solar_hint: "Твій астрологічний день народження раз на рік.",
    prefs_mercury: "Меркурій ретроградний",
    prefs_mercury_hint: "Коли Меркурій змінює напрям руху.",
    prefs_news: "Повідомлення від Ellen",
    prefs_news_hint: "Промо, новини, особисті розсилки (рідко).",
    prefs_saving: "Зберігаю…",
    prefs_saved: "✓ Збережено",
  },
  ru: {
    section: "Telegram-уведомления",
    section_hint: "Подключи бота — и мы будем отправлять тебе важные моменты Луны прямо в Telegram.",
    not_configured: "Telegram-уведомления временно недоступны.",
    not_linked_title: "Telegram не подключён",
    connect: "Подключить Telegram",
    connecting: "Генерирую ссылку…",
    open_bot: "Открыть бота в Telegram",
    waiting: "Жду подтверждения от бота…",
    waiting_hint: "Нажми «Start» в окне бота. Это окно автоматически обновится.",
    linked_title: "Telegram подключён",
    chat_id_label: "Chat ID",
    test_send: "Отправить тестовое сообщение",
    test_sending: "Отправляю…",
    test_sent: "✓ Отправлено — проверь Telegram",
    test_err: "Не удалось отправить.",
    sub_title: "Подписка на канал",
    sub_status_yes: "✓ Ты подписан(а) на канал Ellen",
    sub_status_no: "Ты ещё не подписан(а) на канал Ellen",
    sub_status_unknown: "Подписка ещё не проверена",
    sub_subscribe: "Подписаться на канал",
    sub_check: "Проверить подписку",
    sub_checking: "Проверяю…",
    sub_link_first: "Сначала подключи Telegram-бота выше.",
    prefs_title: "Что присылать",
    prefs_eclipse: "Уведомления о затмениях",
    prefs_eclipse_hint: "За 24-36 ч до солнечного или лунного затмения.",
    prefs_lunar: "Lunar Return",
    prefs_lunar_hint: "Твоё личное лунное возвращение (нужны натальные данные).",
    prefs_weekly: "Карта недели (понедельник)",
    prefs_weekly_hint: "Напоминание вытянуть карту на неделю.",
    prefs_peaks: "Новая / Полная Луна",
    prefs_peaks_hint: "Кульминационные моменты цикла.",
    prefs_daily: "Карта дня",
    prefs_daily_hint: "Ежедневное напоминание вытянуть карту.",
    prefs_horoscope: "Гороскоп дня",
    prefs_horoscope_hint: "Утренний ping только в выразительные дни (потоковый / турбулентный).",
    prefs_solar: "Солнечное возвращение",
    prefs_solar_hint: "Твой астрологический день рождения раз в год.",
    prefs_mercury: "Меркурий ретроградный",
    prefs_mercury_hint: "Когда Меркурий меняет направление движения.",
    prefs_news: "Сообщения от Ellen",
    prefs_news_hint: "Промо, новости, личные рассылки (редко).",
    prefs_saving: "Сохраняю…",
    prefs_saved: "✓ Сохранено",
  },
  en: {
    section: "Telegram notifications",
    section_hint: "Connect the bot — we'll send you important Moon moments straight to Telegram.",
    not_configured: "Telegram notifications are temporarily unavailable.",
    not_linked_title: "Telegram not connected",
    connect: "Connect Telegram",
    connecting: "Generating link…",
    open_bot: "Open the bot in Telegram",
    waiting: "Waiting for bot confirmation…",
    waiting_hint: "Tap 'Start' in the bot window. This page will update automatically.",
    linked_title: "Telegram connected",
    chat_id_label: "Chat ID",
    test_send: "Send a test message",
    test_sending: "Sending…",
    test_sent: "✓ Sent — check Telegram",
    test_err: "Could not send.",
    sub_title: "Channel subscription",
    sub_status_yes: "✓ You're subscribed to Ellen's channel",
    sub_status_no: "Not subscribed to Ellen's channel yet",
    sub_status_unknown: "Subscription not yet verified",
    sub_subscribe: "Subscribe to the channel",
    sub_check: "Check subscription",
    sub_checking: "Checking…",
    sub_link_first: "Please connect the Telegram bot above first.",
    prefs_title: "What to send",
    prefs_eclipse: "Eclipse alerts",
    prefs_eclipse_hint: "24-36h before a solar or lunar eclipse.",
    prefs_lunar: "Lunar Return",
    prefs_lunar_hint: "Your personal lunar return (requires birth data).",
    prefs_weekly: "Card of the Week (Monday)",
    prefs_weekly_hint: "Reminder to pull the week's card.",
    prefs_peaks: "New / Full Moon",
    prefs_peaks_hint: "The cycle's culmination moments.",
    prefs_daily: "Card of the Day",
    prefs_daily_hint: "Daily reminder to pull a card.",
    prefs_horoscope: "Daily Horoscope",
    prefs_horoscope_hint: "Morning ping only on standout days (flowing / turbulent).",
    prefs_solar: "Solar Return",
    prefs_solar_hint: "Your astrological birthday, once a year.",
    prefs_mercury: "Mercury retrograde",
    prefs_mercury_hint: "When Mercury changes direction.",
    prefs_news: "Messages from Ellen",
    prefs_news_hint: "Promos, news, personal broadcasts (rare).",
    prefs_saving: "Saving…",
    prefs_saved: "✓ Saved",
  },
};

export function TelegramSection({ language, initialChatId, initialUsername, initialSubscribed }: Props) {
  const lang: "uk" | "ru" | "en" = language === "ru" ? "ru" : language === "en" ? "en" : "uk";
  const t = T[lang];

  const [chatId, setChatId]           = useState<number | null>(initialChatId);
  const [username, setUsername]       = useState<string | null>(initialUsername);
  const [subscribed, setSubscribed]   = useState<boolean | null>(initialSubscribed ? true : null);

  // ── Bot link flow ────────────────────────────────────────────────────────
  const [linking, setLinking]       = useState(false);
  const [linkOpened, setLinkOpened] = useState(false);

  async function handleConnect() {
    setLinking(true);
    try {
      const res = await fetch("/api/telegram/link", { method: "POST" });
      if (res.status === 503) {
        setLinking(false);
        return; // bot not configured — section shows a hint elsewhere
      }
      const data = await res.json();
      if (data.deeplink) {
        window.open(data.deeplink, "_blank", "noopener,noreferrer");
        setLinkOpened(true);
      }
    } finally {
      setLinking(false);
    }
  }

  // Poll /api/account/profile every 3s while waiting for the bot to write
  // back our chat_id. Stop once we see it.
  useEffect(() => {
    if (!linkOpened || chatId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/account/profile", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.telegram_chat_id) {
            setChatId(data.profile.telegram_chat_id);
            setUsername(data.profile.telegram_username ?? null);
            setLinkOpened(false);
          }
        }
      } catch { /* */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [linkOpened, chatId]);

  // ── Test message ────────────────────────────────────────────────────────
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function handleTest() {
    if (!chatId) return;
    setTestStatus("sending");
    try {
      const res = await fetch("/api/telegram/test-message", { method: "POST" });
      const data = await res.json();
      setTestStatus(data.sent ? "sent" : "error");
      setTimeout(() => setTestStatus("idle"), 3000);
    } catch {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  }

  // ── Subscription verify ─────────────────────────────────────────────────
  const [checking, setChecking] = useState(false);
  async function handleCheckSubscription() {
    if (!chatId) return;
    setChecking(true);
    try {
      const res = await fetch("/api/telegram/verify-subscription", { method: "POST" });
      const data = await res.json();
      if (typeof data.subscribed === "boolean") {
        setSubscribed(data.subscribed);
      }
    } finally {
      setChecking(false);
    }
  }

  // ── Notification preferences ────────────────────────────────────────────
  const [prefs, setPrefs] = useState<NotifPrefs | null>(null);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsSavedAt, setPrefsSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/notification-prefs");
        if (res.ok) {
          const data = await res.json();
          if (data.prefs) setPrefs(data.prefs);
          else setPrefs({
            daily_card: false, weekly_card: true, eclipse_alerts: true,
            lunar_return: true, moon_phase_peaks: false, ellen_news: true,
            solar_return: true, mercury_retrograde: true, daily_horoscope: false,
          });
        }
      } catch { /* */ }
    })();
  }, []);

  async function togglePref(key: keyof NotifPrefs) {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setPrefsSaving(true);
    try {
      await fetch("/api/account/notification-prefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      setPrefsSavedAt(Date.now());
      setTimeout(() => setPrefsSavedAt(null), 1800);
    } finally {
      setPrefsSaving(false);
    }
  }

  // ── Render helpers ──────────────────────────────────────────────────────
  function Toggle({ checked, onChange, id, label, hint }: {
    checked: boolean; onChange: () => void; id: string; label: string; hint: string;
  }) {
    return (
      <div className="flex items-start justify-between gap-3 py-2.5">
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="text-sm text-[#5C4530] cursor-pointer block">{label}</label>
          <p className="text-[11px] text-[#9A8A78] italic leading-snug mt-0.5">{hint}</p>
        </div>
        <button
          type="button"
          id={id}
          onClick={onChange}
          aria-pressed={checked}
          className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[#B8883A]" : "bg-[rgba(196,169,122,0.3)]"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
        </button>
      </div>
    );
  }

  return (
    <div className="card-luxury space-y-5">
      <div>
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">{t.section}</p>
        <p className="text-xs text-[#7A6A58] mt-1 leading-snug">{t.section_hint}</p>
      </div>

      {/* ── Connection state ── */}
      {chatId ? (
        <div className="p-4 rounded-xl bg-[rgba(122,170,108,0.10)] border border-[rgba(122,170,108,0.3)]">
          <div className="flex items-start gap-3">
            <Check size={18} className="text-[#3F6A35] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#3F6A35] font-medium">{t.linked_title}</p>
              <p className="text-xs text-[#5C4530] mt-1">
                {username && <>@{username} · </>}
                <span className="text-[#9A8A78]">{t.chat_id_label}: </span>
                <span className="font-mono">{chatId}</span>
              </p>
              <button
                type="button"
                onClick={handleTest}
                disabled={testStatus === "sending"}
                className="mt-3 inline-flex items-center gap-2 text-xs text-[#B8883A] hover:text-[#7A6A58]"
              >
                {testStatus === "sending" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                {testStatus === "sent" ? t.test_sent
                  : testStatus === "sending" ? t.test_sending
                  : testStatus === "error" ? t.test_err
                  : t.test_send}
              </button>
            </div>
          </div>
        </div>
      ) : linkOpened ? (
        <div className="p-4 rounded-xl bg-[rgba(212,168,83,0.10)] border border-[rgba(212,168,83,0.35)]">
          <div className="flex items-start gap-3">
            <Loader2 size={18} className="text-[#B8883A] flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="text-sm text-[#9A6E28] font-medium">{t.waiting}</p>
              <p className="text-xs text-[#5C4530] mt-1">{t.waiting_hint}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[rgba(196,169,122,0.06)] border border-[rgba(196,169,122,0.18)]">
          <p className="text-sm text-[#5C4530] mb-3">{t.not_linked_title}</p>
          <button
            type="button"
            onClick={handleConnect}
            disabled={linking}
            className="btn-primary text-sm"
          >
            {linking ? <><Loader2 size={14} className="animate-spin" /> {t.connecting}</>
                     : <><Send size={14} /> {t.connect}</>}
          </button>
        </div>
      )}

      {/* ── Subscription block ── */}
      <div className="space-y-2 border-t border-[rgba(196,169,122,0.15)] pt-4">
        <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">{t.sub_title}</p>
        <p className={`text-sm ${subscribed === true ? "text-[#3F6A35]" : subscribed === false ? "text-[#9A6E28]" : "text-[#7A6A58]"}`}>
          {subscribed === true ? t.sub_status_yes : subscribed === false ? t.sub_status_no : t.sub_status_unknown}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a href={ELLEN_CHANNEL_URL} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-1.5 text-sm text-[#B8883A] hover:text-[#7A6A58]">
            <ExternalLink size={13} /> {t.sub_subscribe}
          </a>
          {chatId ? (
            <button type="button" onClick={handleCheckSubscription} disabled={checking}
                    className="inline-flex items-center gap-1.5 text-sm text-[#5C4530] hover:text-[#B8883A]">
              {checking ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {checking ? t.sub_checking : t.sub_check}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#9A8A78] italic">
              <AlertCircle size={12} /> {t.sub_link_first}
            </span>
          )}
        </div>
      </div>

      {/* ── Notification preferences ── */}
      {prefs && (
        <div className="border-t border-[rgba(196,169,122,0.15)] pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase flex items-center gap-1.5">
              <BellRing size={11} /> {t.prefs_title}
            </p>
            {prefsSavedAt && <span className="text-[10px] text-[#3F6A35]">{t.prefs_saved}</span>}
            {prefsSaving && !prefsSavedAt && <span className="text-[10px] text-[#9A8A78] italic">{t.prefs_saving}</span>}
          </div>
          <div className="divide-y divide-[rgba(196,169,122,0.12)]">
            <Toggle id="pref-eclipse" checked={prefs.eclipse_alerts}
                    onChange={() => togglePref("eclipse_alerts")}
                    label={t.prefs_eclipse} hint={t.prefs_eclipse_hint} />
            <Toggle id="pref-lunar" checked={prefs.lunar_return}
                    onChange={() => togglePref("lunar_return")}
                    label={t.prefs_lunar} hint={t.prefs_lunar_hint} />
            <Toggle id="pref-weekly" checked={prefs.weekly_card}
                    onChange={() => togglePref("weekly_card")}
                    label={t.prefs_weekly} hint={t.prefs_weekly_hint} />
            <Toggle id="pref-peaks" checked={prefs.moon_phase_peaks}
                    onChange={() => togglePref("moon_phase_peaks")}
                    label={t.prefs_peaks} hint={t.prefs_peaks_hint} />
            <Toggle id="pref-daily" checked={prefs.daily_card}
                    onChange={() => togglePref("daily_card")}
                    label={t.prefs_daily} hint={t.prefs_daily_hint} />
            <Toggle id="pref-horoscope" checked={!!prefs.daily_horoscope}
                    onChange={() => togglePref("daily_horoscope")}
                    label={t.prefs_horoscope} hint={t.prefs_horoscope_hint} />
            <Toggle id="pref-solar" checked={prefs.solar_return !== false}
                    onChange={() => togglePref("solar_return")}
                    label={t.prefs_solar} hint={t.prefs_solar_hint} />
            <Toggle id="pref-mercury" checked={prefs.mercury_retrograde !== false}
                    onChange={() => togglePref("mercury_retrograde")}
                    label={t.prefs_mercury} hint={t.prefs_mercury_hint} />
            <Toggle id="pref-news" checked={prefs.ellen_news}
                    onChange={() => togglePref("ellen_news")}
                    label={t.prefs_news} hint={t.prefs_news_hint} />
          </div>
        </div>
      )}
    </div>
  );
}
