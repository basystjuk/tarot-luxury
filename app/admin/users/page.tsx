"use client";

/**
 * Admin users: list with search + pagination, per-user detail (profile,
 * notification prefs, card pulls, notifications sent) and a personal
 * Telegram message to one user.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Search, Send, Users } from "lucide-react";
import { adminFetch, ensureAdminCookie, responseError } from "@/components/admin/admin-fetch";
import { formatDateTime } from "@/components/admin/format";
import { Badge, Button, Card, EmptyState, Notice, PageHeader, Skeleton, TextAreaField, useConfirm, useToast } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

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
  stats?: { cards: number; notifications: number };
}
interface UserDetail {
  profile: UserRow;
  prefs: Record<string, boolean | string> | null;
  tarot_history: { id: string; day: string; card_index: number; reversed: boolean; question: string | null; reading: { meaning: string; advice?: string; affirmation?: string } | null }[];
  notifications: { id: string; kind: string; key: string; sent_at: string }[];
}

const PAGE = 50;
const MSG_MAX = 4000;
const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const moonSign = (lon: number | null) =>
  lon == null ? "—" : `${SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)]} ${Math.floor((((lon % 30) + 30) % 30))}°`;
const nameOf = (u: UserRow) => u.display_name || u.full_name || u.email || "Без імені";

function SendMessage({ user }: { user: UserRow }) {
  const toast = useToast();
  const confirm = useConfirm();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (!user.telegram_chat_id) {
    return <p className="text-sm text-[var(--muted)]">Користувач не підключив Telegram-бота — написати не можна.</p>;
  }

  const send = async () => {
    const ok = await confirm({
      title: "Надіслати повідомлення?",
      description: `${nameOf(user)} отримає його в Telegram від «✦ Ellen». Скасувати після відправки не можна.`,
      confirmLabel: "Надіслати",
      tone: "primary",
    });
    if (!ok) return;
    setSending(true);
    try {
      const res = await adminFetch(`/api/admin/users/${user.id}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const j = res.ok ? await res.json() : null;
      if (!res.ok || !j?.sent) throw new Error(res.ok ? "Telegram не прийняв повідомлення" : await responseError(res));
      setText("");
      toast({ title: "Повідомлення надіслано" });
    } catch (e) {
      toast({ tone: "danger", title: "Не надіслано", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <TextAreaField
        label="Текст повідомлення"
        value={text}
        onChange={(v) => setText(v.slice(0, MSG_MAX))}
        placeholder="Привіт! Хотіла нагадати про нашу зустріч…"
        rows={4}
        maxLength={MSG_MAX}
        hint="Звичайний текст. Повідомлення прийде з підписом «✦ Ellen»."
      />
      <Button onClick={() => void send()} loading={sending} disabled={!text.trim()}>
        {!sending && <Send size={16} aria-hidden />} Надіслати в Telegram
      </Button>
    </div>
  );
}

function Detail({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await adminFetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error(await responseError(res));
        const j = await res.json();
        if (!cancelled) setData(j);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const back = (
    <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 lg:hidden">
      <ChevronLeft size={16} aria-hidden /> До списку
    </Button>
  );
  if (error) return <>{back}<Notice tone="danger" title="Не вдалося відкрити профіль">{error}</Notice></>;
  if (!data) return <>{back}<Skeleton className="h-64" /></>;

  const p = data.profile;
  return (
    <div className="space-y-4">
      {back}
      <Card title={nameOf(p)} description={p.email ?? undefined}>
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          {[
            ["Повне імʼя", p.full_name || "—"],
            ["Дата народження", p.birth_date || "—"],
            ["Місце народження", p.birth_place || "—"],
            ["Натальний Місяць", moonSign(p.natal_moon_lon)],
            ["Telegram", p.telegram_username ? `@${p.telegram_username}` : p.telegram_chat_id ? "підключено" : "—"],
            ["На каналі", p.subscribed_to_channel ? "так" : "ні"],
            ["Зареєстровано", formatDateTime(p.created_at)],
            ["Оновлено", formatDateTime(p.updated_at)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-[var(--muted)]">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card title="Персональне повідомлення">
        <SendMessage user={p} />
      </Card>

      {data.prefs && (
        <Card title="Налаштування сповіщень">
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {Object.entries(data.prefs)
              .filter(([k]) => k !== "user_id" && k !== "updated_at")
              .map(([k, v]) => (
                <li key={k} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--cream-100)] px-3 py-2">
                  <span className="truncate text-[var(--warm-600)]">{k}</span>
                  <Badge tone={v === true ? "success" : "muted"}>{v === true ? "увімк." : v === false ? "вимк." : String(v)}</Badge>
                </li>
              ))}
          </ul>
        </Card>
      )}

      <Card title={`Карти дня (${data.tarot_history.length})`}>
        {data.tarot_history.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Ще жодної карти.</p>
        ) : (
          <ul className="divide-y divide-[var(--sand-100)] text-sm">
            {data.tarot_history.map((h) => (
              <li key={h.id} className="py-2">
                <span className="text-[var(--muted)]">{h.day}</span> · карта №{h.card_index}
                {h.reversed && <Badge tone="muted" className="ml-2">перевернута</Badge>}
                {h.question && <p className="mt-1 italic text-[var(--muted)]">«{h.question}»</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={`Надіслані сповіщення (${data.notifications.length})`}>
        {data.notifications.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Ще нічого не надсилали.</p>
        ) : (
          <ul className="divide-y divide-[var(--sand-100)] text-sm">
            {data.notifications.map((n) => (
              <li key={n.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span><strong className="font-medium">{n.kind}</strong> · <span className="text-[var(--muted)]">{n.key}</span></span>
                <span className="text-[var(--muted)]">{formatDateTime(n.sent_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const cookieReady = useRef<Promise<void> | null>(null);

  const load = useCallback(async (q: string, from: number) => {
    try {
      cookieReady.current ??= ensureAdminCookie();
      await cookieReady.current;
      const params = new URLSearchParams({ limit: String(PAGE), offset: String(from) });
      if (q.trim()) params.set("q", q.trim());
      const res = await adminFetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error(await responseError(res));
      const j = await res.json();
      setUsers(j.users ?? []);
      setTotal(j.total ?? 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setUsers([]);
      setTotal(0);
    }
  }, []);

  // Search as you type (after a short pause) and on page change.
  useEffect(() => {
    const t = setTimeout(() => void load(query, offset), query ? 400 : 0);
    return () => clearTimeout(t);
  }, [query, offset, load]);

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE, total);

  return (
    <>
      <PageHeader title="Користувачі" description={total ? `Усього зареєстровано: ${total}` : "Зареєстровані користувачі сайту."} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-6">
        <div className={cn(selected && "hidden lg:block")}>
          <Card className="p-3 sm:p-3">
            <label htmlFor="user-search" className="sr-only">Пошук користувачів</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sand-400)]" aria-hidden />
              <input
                id="user-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOffset(0);
                }}
                placeholder="Email, імʼя або @telegram"
                className="w-full rounded-xl border border-[var(--sand-200)] bg-white py-2.5 pl-9 pr-3 text-base focus:border-[var(--sand-400)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]/40 sm:text-sm"
              />
            </div>

            {error && <Notice tone="danger" className="mt-3">{error}</Notice>}

            {users === null ? (
              <div className="mt-3 space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : users.length === 0 && !error ? (
              <div className="mt-3">
                <EmptyState icon={<Users size={28} />} title={query ? `Нікого не знайдено за «${query}»` : "Користувачів ще немає"} />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--sand-100)]">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(u.id)}
                      aria-current={selected === u.id ? "true" : undefined}
                      className={cn(
                        "flex min-h-14 w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-[var(--cream-100)]",
                        selected === u.id && "bg-[var(--sand-100)]",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{nameOf(u)}</span>
                        <span className="block truncate text-xs text-[var(--muted)]">{u.email}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        {u.telegram_chat_id && <Badge tone="success">TG</Badge>}
                        <span className="text-[11px] text-[var(--muted)]">{formatDateTime(u.created_at).split(",")[0]}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {total > PAGE && (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--sand-100)] pt-3 text-sm">
                <Button variant="ghost" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE))}>
                  Назад
                </Button>
                <span className="text-[var(--muted)]">{from}–{to} з {total}</span>
                <Button variant="ghost" size="sm" disabled={offset + PAGE >= total} onClick={() => setOffset(offset + PAGE)}>
                  Далі
                </Button>
              </div>
            )}
          </Card>
        </div>

        <div className={cn("min-w-0", !selected && "hidden lg:block")}>
          {selected ? (
            <Detail key={selected} id={selected} onBack={() => setSelected(null)} />
          ) : (
            <EmptyState icon={<Users size={32} />} title="Оберіть користувача">
              Деталі профілю, налаштування сповіщень, історія карт і персональне повідомлення.
            </EmptyState>
          )}
        </div>
      </div>
    </>
  );
}
