"use client";

/**
 * Cabinet's "PWA push notifications" section (Phase M12).
 *
 * Independent of the Telegram block — these are browser-native
 * notifications that arrive even when the user isn't subscribed to
 * Telegram. Same daily-cron fans them out alongside the Telegram messages.
 *
 * UX:
 *   - If the browser doesn't support Web Push: show a polite explainer.
 *   - If permission is "default": show "Enable notifications" button.
 *   - If permission is "granted" and we have a subscription registered:
 *     show "Connected" state + "Send test" + "Disable".
 *   - If permission is "denied": tell the user to flip the OS-level toggle.
 */

import { useEffect, useState } from "react";
import { BellRing, Loader2, Check, AlertCircle, BellOff } from "lucide-react";

interface Props { language: string }

type Status = "loading" | "unsupported" | "denied" | "off" | "on";

function urlBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Url);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

const T = {
  uk: {
    section: "Сповіщення в браузері",
    hint: "Push прямо в систему — навіть без Telegram. Ранковий гороскоп, повний/новий Місяць, затемнення.",
    unsupported: "Цей браузер не підтримує web-push. Спробуй у Chrome, Edge або Safari (iOS 16.4+, додати на головний екран).",
    denied: "Сповіщення вимкнено в налаштуваннях браузера. Увімкни їх у системних налаштуваннях, щоб отримувати ранковий гороскоп.",
    enable: "Увімкнути сповіщення",
    enabling: "Запитую дозвіл…",
    on_title: "Сповіщення увімкнено",
    on_hint: "Цей пристрій отримуватиме ранкові ping'и.",
    test: "Надіслати тестове",
    sending: "Надсилаю…",
    disable: "Вимкнути на цьому пристрої",
    auth_required: "Увійди в кабінет, щоб увімкнути сповіщення.",
    error_generic: "Щось пішло не так. Спробуй ще раз.",
    delivered_ok: "Готово — перевір системні сповіщення.",
  },
  ru: {
    section: "Уведомления в браузере",
    hint: "Push прямо в систему — даже без Telegram. Утренний гороскоп, полная/новая Луна, затмения.",
    unsupported: "Этот браузер не поддерживает web-push. Попробуй в Chrome, Edge или Safari (iOS 16.4+, добавь на главный экран).",
    denied: "Уведомления выключены в настройках браузера. Включи их в системных настройках, чтобы получать утренний гороскоп.",
    enable: "Включить уведомления",
    enabling: "Запрашиваю разрешение…",
    on_title: "Уведомления включены",
    on_hint: "Это устройство будет получать утренние ping'и.",
    test: "Отправить тест",
    sending: "Отправляю…",
    disable: "Выключить на этом устройстве",
    auth_required: "Войди в кабинет, чтобы включить уведомления.",
    error_generic: "Что-то пошло не так. Попробуй ещё раз.",
    delivered_ok: "Готово — проверь системные уведомления.",
  },
  en: {
    section: "Browser notifications",
    hint: "Push straight to the OS — even without Telegram. Morning horoscope, full/new Moon, eclipses.",
    unsupported: "This browser doesn't support web push. Try Chrome, Edge, or Safari (iOS 16.4+ — add to Home Screen first).",
    denied: "Notifications are blocked in browser settings. Enable them in your system settings to receive the morning horoscope.",
    enable: "Enable notifications",
    enabling: "Asking permission…",
    on_title: "Notifications on",
    on_hint: "This device will receive morning pings.",
    test: "Send test",
    sending: "Sending…",
    disable: "Disable on this device",
    auth_required: "Sign in to enable notifications.",
    error_generic: "Something went wrong. Try again.",
    delivered_ok: "Done — check your system notifications.",
  },
} as const;

export function PushSection({ language }: Props) {
  const t = T[language as keyof typeof T] ?? T.uk;
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        setStatus(sub && Notification.permission === "granted" ? "on" : "off");
      } catch (e) {
        console.warn("SW register failed", e);
        setStatus("unsupported");
      }
    })();
  }, []);

  async function enable() {
    setBusy(true); setMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready
        .catch(() => navigator.serviceWorker.register("/sw.js"));
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "off");
        return;
      }
      const keyRes = await fetch("/api/push/vapid-public-key");
      if (!keyRes.ok) { setMsg(t.error_generic); return; }
      const { key } = await keyRes.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(key),
      });

      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (saveRes.status === 401) { setMsg(t.auth_required); await sub.unsubscribe(); return; }
      if (!saveRes.ok) { setMsg(t.error_generic); await sub.unsubscribe(); return; }
      setStatus("on");
    } catch (e) {
      console.error(e);
      setMsg(t.error_generic);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true); setMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/push/test", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.delivered > 0) setMsg(t.delivered_ok);
      else setMsg(t.error_generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <BellRing className="h-5 w-5 text-amber-300/90 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-base font-medium text-white/90">{t.section}</h3>
          <p className="mt-1 text-sm text-white/55">{t.hint}</p>
        </div>
      </div>

      {status === "loading" && (
        <div className="text-sm text-white/50 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}

      {status === "unsupported" && (
        <p className="text-sm text-white/55 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-300/80 mt-0.5 shrink-0" />
          <span>{t.unsupported}</span>
        </p>
      )}

      {status === "denied" && (
        <p className="text-sm text-white/55 flex items-start gap-2">
          <BellOff className="h-4 w-4 text-rose-300/80 mt-0.5 shrink-0" />
          <span>{t.denied}</span>
        </p>
      )}

      {status === "off" && (
        <button
          onClick={enable}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-amber-200/90 px-5 py-2 text-sm font-medium text-stone-900 hover:bg-amber-200 disabled:opacity-60 transition"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
          {busy ? t.enabling : t.enable}
        </button>
      )}

      {status === "on" && (
        <div className="space-y-3">
          <p className="text-sm text-emerald-300/90 flex items-center gap-2">
            <Check className="h-4 w-4" />
            {t.on_title}
          </p>
          <p className="text-xs text-white/45">{t.on_hint}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sendTest}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-60 transition"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {busy ? t.sending : t.test}
            </button>
            <button
              onClick={disable}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-xs text-white/55 hover:text-white/80 hover:bg-white/5 disabled:opacity-60 transition"
            >
              <BellOff className="h-3.5 w-3.5" />
              {t.disable}
            </button>
          </div>
        </div>
      )}

      {msg && <p className="text-xs text-white/55">{msg}</p>}
    </div>
  );
}
