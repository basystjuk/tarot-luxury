"use client";

/**
 * Admin user panel (Phase Е).
 *
 * Lives at /admin/users. Auth: reuses the same sessionStorage-based gate
 * as the main /admin page + ensures the preview cookie is set (via
 * /api/admin/preview) so the underlying /api/admin/users/* endpoints
 * accept the request.
 *
 * Layout:
 *   - left: list of users with search + pagination + per-user stats
 *   - right: selected user detail (profile, prefs, last card pulls,
 *            notifications, "send Telegram message" action)
 */

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, Send, ExternalLink, Loader2, ChevronLeft, Users, X } from "lucide-react";

const ADMIN_PASSWORD = "ellensoul2025";

// ── Types matching the API contract ──────────────────────────────────────────
interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  full_name: string | null;
  birth_date: string | null;
  birth_place: string | null;
  telegram_username: string | null;
  telegram_chat_id: number | null;
  subscribed_to_channel: boolean;
  natal_moon_lon: number | null;
  created_at: string;
  updated_at: string;
  stats: { cards: number; notifications: number };
}

interface TarotEntry {
  id: string;
  day: string;
  card_index: number;
  reversed: boolean;
  question: string | null;
  reading: { meaning: string; advice: string; affirmation: string } | null;
  drawn_at: string;
}

interface NotifEntry {
  id: string;
  kind: string;
  key: string;
  sent_at: string;
  payload: unknown;
}

interface UserDetail {
  profile: UserRow;
  prefs: Record<string, boolean | string> | null;
  tarot_history: TarotEntry[];
  notifications: NotifEntry[];
}

// ── Auth screen (same logic as /admin) ────────────────────────────────────────
function AuthGate({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pass !== ADMIN_PASSWORD) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    sessionStorage.setItem("admin_auth", "1");
    // Also ensure the preview cookie is set so /api/admin/users/* auth
    // succeeds. /api/admin/preview is idempotent — safe to call repeatedly.
    try {
      await fetch("/api/admin/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD },
        body: JSON.stringify({ enabled: true }),
      });
    } catch { /* */ }
    onLogin();
  }

  return (
    <div className="min-h-screen bg-[#1C1512] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[#C4A97A] text-xs tracking-[0.2em] uppercase mb-2">Адмінка · Юзери</p>
          <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}>Ellen Soul</h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            placeholder="Пароль"
            value={pass}
            onChange={e => setPass(e.target.value)}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-colors ${
              error ? "border-red-400/60 bg-red-400/5" : "border-white/15 focus:border-[#C4A97A]"
            }`}
          />
          {error && <p className="text-red-400 text-sm text-center">Невірний пароль</p>}
          <button type="submit" className="w-full bg-[#D4A853] hover:bg-[#C4983A] text-white py-3 rounded-xl transition-colors font-medium">
            Увійти
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
}
function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}
function moonSign(lon: number | null): string {
  if (lon == null) return "—";
  const signs = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  const idx = Math.floor(((lon % 360) + 360) % 360 / 30);
  const deg = Math.floor(((lon % 30) + 30) % 30);
  return `${signs[idx]} ${deg}°`;
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(sessionStorage.getItem("admin_auth") === "1");
  }, []);

  if (!authed) return <AuthGate onLogin={() => setAuthed(true)} />;
  return <AdminUsersContent />;
}

function AdminUsersContent() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [offset, setOffset]     = useState(0);
  const [limit]                 = useState(50);
  const [q, setQ]               = useState("");
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (offsetOverride?: number, qOverride?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offsetOverride ?? offset),
      });
      const effectiveQ = qOverride ?? q;
      if (effectiveQ) params.set("q", effectiveQ);
      const res = await fetch(`/api/admin/users?${params}`, { cache: "no-store" });
      if (!res.ok) {
        setUsers([]);
        setTotal(0);
      } else {
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [q, offset, limit]);

  // Ensure the preview cookie is set before the first load. Needed when the
  // owner arrived here from the main /admin page (which sets sessionStorage
  // auth but not necessarily the preview cookie the /api/admin/users/* routes
  // require) — otherwise the list would 401 and look empty. Idempotent.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await fetch("/api/admin/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": ADMIN_PASSWORD },
          body: JSON.stringify({ enabled: true }),
        });
      } catch { /* */ }
      if (!cancelled) load();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    load(0, q);
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="bg-[#1C1512] text-white px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-[#C4A97A]" />
          <div>
            <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase">Адмінка</p>
            <h1 className="text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>Юзери</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a href="/admin" className="text-white/60 hover:text-white">← Контент</a>
          <span className="text-white/30">·</span>
          <span className="text-white/80">{total} {total === 1 ? "юзер" : "юзерів"}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-[480px_1fr] min-h-[calc(100vh-60px)]">
        {/* ── Sidebar: list ── */}
        <aside className="border-r border-[rgba(196,169,122,0.2)] bg-white flex flex-col">
          <form onSubmit={handleSearch} className="p-4 border-b border-[rgba(196,169,122,0.18)] flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4A97A]" />
              <input
                type="text"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Пошук: email, імʼя, @telegram"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-[rgba(196,169,122,0.3)] focus:border-[#B8883A] outline-none text-sm"
              />
            </div>
            <button type="submit" className="px-3 py-2 rounded-lg bg-[#B8883A] hover:bg-[#9a6e28] text-white text-xs">
              ⇢
            </button>
            <button type="button" onClick={() => load()} className="p-2 text-[#7A6A58] hover:text-[#B8883A]" title="Оновити">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            {loading && users.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9A8A78]">
                <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                Завантажуємо…
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9A8A78]">Юзерів немає {q && `за пошуком «${q}»`}</div>
            ) : (
              <ul className="divide-y divide-[rgba(196,169,122,0.12)]">
                {users.map(u => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(u.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-[rgba(196,169,122,0.06)] ${selected?.profile.id === u.id ? "bg-[rgba(212,168,83,0.12)]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#1C1512] font-medium truncate">
                            {u.display_name || u.email || "Без імені"}
                          </p>
                          <p className="text-[11px] text-[#7A6A58] truncate">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9A8A78]">
                            <span title="карти">🃏 {u.stats.cards}</span>
                            <span title="нотифікації">📨 {u.stats.notifications}</span>
                            {u.telegram_chat_id && <span title="TG підключено" className="text-[#3F6A35]">✓ TG</span>}
                            {u.subscribed_to_channel && <span title="на каналі" className="text-[#B8883A]">★</span>}
                          </div>
                        </div>
                        <span className="text-[10px] text-[#9A8A78] flex-shrink-0">{fmtDay(u.created_at)}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-[rgba(196,169,122,0.18)] flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => { const next = Math.max(0, offset - limit); setOffset(next); load(next); }}
              className="px-3 py-1 rounded text-[#5C4530] disabled:opacity-30 hover:bg-[rgba(196,169,122,0.08)]"
            >← prev</button>
            <span className="text-[#7A6A58]">{offset + 1}-{Math.min(offset + limit, total)} of {total}</span>
            <button
              type="button"
              disabled={offset + limit >= total}
              onClick={() => { const next = offset + limit; setOffset(next); load(next); }}
              className="px-3 py-1 rounded text-[#5C4530] disabled:opacity-30 hover:bg-[rgba(196,169,122,0.08)]"
            >next →</button>
          </div>
        </aside>

        {/* ── Detail panel ── */}
        <main className="overflow-y-auto p-6 max-w-3xl">
          {detailLoading ? (
            <div className="flex items-center justify-center py-20 text-[#9A8A78]">
              <Loader2 size={20} className="animate-spin mr-2" /> Завантажуємо…
            </div>
          ) : !selected ? (
            <div className="text-center py-20 text-[#9A8A78]">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Обери юзера зліва щоб подивитись деталі</p>
            </div>
          ) : (
            <UserDetailPanel user={selected} onClose={() => setSelected(null)} />
          )}
        </main>
      </div>
    </div>
  );
}

// ── User detail panel ───────────────────────────────────────────────────────
function UserDetailPanel({ user, onClose }: { user: UserDetail; onClose: () => void }) {
  const { profile, prefs, tarot_history, notifications } = user;
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"idle" | "sent" | "error" | "no-tg">("idle");

  async function sendCustomMessage() {
    if (!msgText.trim() || !profile.telegram_chat_id) {
      setSendResult("no-tg");
      return;
    }
    setSending(true);
    setSendResult("idle");
    try {
      const res = await fetch(`/api/admin/users/${profile.id}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msgText.trim() }),
      });
      const data = await res.json();
      if (data.sent) {
        setSendResult("sent");
        setMsgText("");
        setTimeout(() => setMsgOpen(false), 1500);
      } else {
        setSendResult("error");
      }
    } catch {
      setSendResult("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <button onClick={onClose} className="lg:hidden text-xs text-[#7A6A58] mb-2 inline-flex items-center gap-1">
            <ChevronLeft size={12} /> До списку
          </button>
          <h2 className="text-2xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
            {profile.display_name || profile.email || "Без імені"}
          </h2>
          <p className="text-sm text-[#7A6A58]">{profile.email}</p>
          <p className="text-[11px] text-[#9A8A78] mt-1">ID: <span className="font-mono">{profile.id}</span></p>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-4 gap-3">
        <Stat label="Карти" value={user.profile.stats?.cards ?? tarot_history.length} />
        <Stat label="Нотифікації" value={user.profile.stats?.notifications ?? notifications.length} />
        <Stat label="TG" value={profile.telegram_chat_id ? "✓" : "—"} />
        <Stat label="Канал" value={profile.subscribed_to_channel ? "✓" : "—"} />
      </div>

      {/* ── Profile block ── */}
      <Section title="Профіль">
        <Field label="Повне імʼя">{profile.full_name || "—"}</Field>
        <Field label="Дата народження">{profile.birth_date || "—"}</Field>
        <Field label="Місце народження">{profile.birth_place || "—"}</Field>
        <Field label="Натальний Місяць">{moonSign(profile.natal_moon_lon)}</Field>
        <Field label="Telegram">{profile.telegram_username ? `@${profile.telegram_username}` : "—"}</Field>
        <Field label="Telegram chat ID">{profile.telegram_chat_id ?? "—"}</Field>
        <Field label="Створено">{fmtDate(profile.created_at)}</Field>
        <Field label="Оновлено">{fmtDate(profile.updated_at)}</Field>
      </Section>

      {/* ── Notification prefs ── */}
      {prefs && (
        <Section title="Налаштування нотифікацій">
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            {Object.entries(prefs).filter(([k]) => k !== "user_id" && k !== "updated_at").map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-2 rounded bg-[rgba(196,169,122,0.05)]">
                <span className="text-[#5C4530]">{k}</span>
                <span className={v === true ? "text-[#3F6A35] font-medium" : "text-[#9A8A78]"}>
                  {v === true ? "ON" : v === false ? "OFF" : String(v)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Send custom Telegram message ── */}
      <Section title="Надіслати персональне повідомлення">
        {!profile.telegram_chat_id ? (
          <p className="text-sm text-[#9A8A78] italic">Юзер не підключив Telegram-бот — повідомлення надіслати не можна.</p>
        ) : !msgOpen ? (
          <button onClick={() => setMsgOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#B8883A] hover:bg-[#9a6e28] text-white text-sm">
            <Send size={14} /> Написати в Telegram
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value.slice(0, 4000))}
              rows={4}
              placeholder="Привіт! Хотіла нагадати про нашу зустріч…"
              className="w-full p-3 rounded-lg border border-[rgba(196,169,122,0.3)] focus:border-[#B8883A] outline-none text-sm resize-none"
            />
            <p className="text-[11px] text-[#9A8A78]">
              Можна HTML: <code>&lt;b&gt;жирний&lt;/b&gt;</code>, <code>&lt;i&gt;курсив&lt;/i&gt;</code>, <code>&lt;a href=&quot;…&quot;&gt;посилання&lt;/a&gt;</code>.
              Лімі: 4000 символів. Надсилається з префіксом «✦ Ellen».
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={sendCustomMessage}
                disabled={sending || !msgText.trim()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#B8883A] hover:bg-[#9a6e28] disabled:opacity-50 text-white text-sm"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? "Надсилаю…" : "Надіслати"}
              </button>
              <button onClick={() => { setMsgOpen(false); setMsgText(""); setSendResult("idle"); }} className="text-sm text-[#7A6A58]">
                <X size={14} className="inline" /> Скасувати
              </button>
              {sendResult === "sent"  && <span className="text-sm text-[#3F6A35]">✓ Надіслано</span>}
              {sendResult === "error" && <span className="text-sm text-[#9A6E28]">⚠ Помилка</span>}
            </div>
          </div>
        )}
      </Section>

      {/* ── Tarot history ── */}
      <Section title={`Журнал карт (${tarot_history.length})`}>
        {tarot_history.length === 0 ? (
          <p className="text-sm text-[#9A8A78] italic">Ще жодної карти.</p>
        ) : (
          <ul className="space-y-2">
            {tarot_history.map(h => (
              <li key={h.id} className="p-3 rounded-lg bg-[rgba(196,169,122,0.05)] border border-[rgba(196,169,122,0.15)] text-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[#7A6A58]">{fmtDay(h.day)} · <strong className="text-[#5C4530]">card #{h.card_index}</strong>{h.reversed && <span className="ml-1 text-[10px] text-[#B8883A] italic uppercase tracking-wider">reversed</span>}</span>
                </div>
                {h.question && <p className="text-xs italic text-[#7A6A58] mt-1">«{h.question}»</p>}
                {h.reading && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-[#B8883A]">Показати читання</summary>
                    <div className="mt-2 space-y-2 text-[#5C4530]">
                      <p>{h.reading.meaning}</p>
                      {h.reading.advice && <p>{h.reading.advice}</p>}
                      {h.reading.affirmation && <p className="italic text-[#B8883A]">«{h.reading.affirmation}»</p>}
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Notification log ── */}
      <Section title={`Надіслані сповіщення (${notifications.length})`}>
        {notifications.length === 0 ? (
          <p className="text-sm text-[#9A8A78] italic">Ще нічого не надсилали.</p>
        ) : (
          <ul className="space-y-1.5 text-xs">
            {notifications.map(n => (
              <li key={n.id} className="flex items-center justify-between gap-3 p-2 rounded bg-[rgba(196,169,122,0.05)]">
                <span className="text-[#5C4530]"><strong>{n.kind}</strong> · {n.key}</span>
                <span className="text-[#9A8A78]">{fmtDate(n.sent_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-lg bg-white border border-[rgba(196,169,122,0.2)] text-center">
      <p className="text-[10px] text-[#9A8A78] tracking-widest uppercase">{label}</p>
      <p className="text-lg text-[#B8883A] mt-1" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-[rgba(196,169,122,0.2)]">
      <p className="text-[10px] text-[#C4A97A] tracking-widest uppercase mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-[#9A8A78] text-xs uppercase tracking-wide">{label}</span>
      <span className="text-[#5C4530] text-right">{children}</span>
    </div>
  );
}
