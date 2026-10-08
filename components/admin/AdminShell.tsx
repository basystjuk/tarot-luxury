"use client";

/**
 * Admin frame: sign-in gate, sidebar (drawer on phones), load/conflict
 * banners and the shared save bar. Pages render inside <main>.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Download, Eye, EyeOff, LogOut, Menu, RefreshCw, Save, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentSection } from "@/lib/content-validation";
import { ADMIN_PASSWORD, downloadJson } from "./admin-fetch";
import { AdminContentProvider, useAdminContent } from "./content-context";
import { plural } from "./format";
import { NAV, SECTION_HREF } from "./nav";
import { Badge, Button, ConfirmProvider, IconButton, Notice, ToastProvider, useConfirm } from "./ui";

// ── Sign-in state (per browser tab, like before) ──────────────────────────

const AUTH_KEY = "admin_auth";
const AUTH_EVENT = "ellen-admin-auth";

function subscribeAuth(onChange: () => void) {
  window.addEventListener(AUTH_EVENT, onChange);
  return () => window.removeEventListener(AUTH_EVENT, onChange);
}
function setSignedIn(on: boolean) {
  if (on) sessionStorage.setItem(AUTH_KEY, "1");
  else sessionStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const signedIn = useSyncExternalStore<boolean | null>(
    subscribeAuth,
    () => sessionStorage.getItem(AUTH_KEY) === "1",
    () => null,
  );
  if (signedIn === null) return null; // server render — sign-in lives in the browser
  if (!signedIn) return <SignIn />;
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminContentProvider>
          <Frame>{children}</Frame>
        </AdminContentProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

function SignIn() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [wrong, setWrong] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setSignedIn(true);
    else setWrong(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--cream-50)] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--sand-200)] bg-white p-8 shadow-sm">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-[var(--sand-400)]">Адмін-панель</p>
        <h1 className="mt-2 text-center text-4xl" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
          Ellen Soul
        </h1>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
              Пароль
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setWrong(false);
                }}
                aria-invalid={wrong || undefined}
                aria-describedby={wrong ? "admin-password-error" : undefined}
                className={cn(
                  "w-full rounded-xl border bg-white py-2.5 pl-3.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]/40 sm:text-sm",
                  wrong ? "border-[var(--danger)]/60" : "border-[var(--sand-200)]",
                )}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Сховати пароль" : "Показати пароль"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--muted)] hover:text-[var(--warm-900)]"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {wrong && (
              <p id="admin-password-error" role="alert" className="mt-1.5 text-sm text-[var(--danger)]">
                Невірний пароль
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Увійти
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Frame ─────────────────────────────────────────────────────────────────

function Brand() {
  return (
    <Link href="/admin" className="block leading-none">
      <span className="block text-2xl text-[var(--warm-900)]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
        Ellen Soul
      </span>
      <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-[var(--sand-400)]">Адмін-панель</span>
    </Link>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[var(--cream-50)] text-[var(--warm-900)] lg:flex">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-[var(--sand-200)] lg:bg-white">
        <Sidebar />
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--sand-200)] bg-white/95 px-4 backdrop-blur lg:hidden">
          <Brand />
          <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
            <Dialog.Trigger asChild>
              <IconButton label="Меню">
                <Menu size={20} />
              </IconButton>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-[200] bg-[var(--warm-900)]/30 lg:hidden" />
              <Dialog.Content className="fixed inset-y-0 left-0 z-[201] flex w-[86vw] max-w-xs flex-col bg-white shadow-xl focus:outline-none lg:hidden">
                <Dialog.Title className="sr-only">Розділи адмінки</Dialog.Title>
                <Sidebar onNavigate={() => setMenuOpen(false)} />
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </header>

        <StatusBanner />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-40 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>

      <SaveBar />
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "";
  const { issues, dirty } = useAdminContent();
  const confirm = useConfirm();

  const errorCount: Partial<Record<ContentSection, number>> = {};
  for (const i of issues) if (i.severity === "error") errorCount[i.section] = (errorCount[i.section] ?? 0) + 1;

  const signOut = async () => {
    if (dirty) {
      const ok = await confirm({
        title: "Вийти без збереження?",
        description: "Незбережені зміни буде втрачено.",
        confirmLabel: "Вийти",
      });
      if (!ok) return;
    }
    setSignedIn(false);
  };

  return (
    <>
      <div className="px-5 pb-4 pt-6">
        <Brand />
      </div>
      <nav aria-label="Розділи адмінки" className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label} className="mb-4">
            <p
              className={cn(
                "px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.14em]",
                group.inactive ? "text-[var(--muted)]" : "text-[var(--sand-400)]",
              )}
            >
              {group.label}
            </p>
            <ul>
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const errors = item.section ? errorCount[item.section] ?? 0 : 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors lg:min-h-10",
                        active
                          ? "bg-[var(--sand-100)] font-medium text-[var(--warm-900)]"
                          : group.inactive
                            ? "text-[var(--muted)] hover:bg-[var(--cream-100)]"
                            : "text-[var(--warm-600)] hover:bg-[var(--cream-100)] hover:text-[var(--warm-900)]",
                      )}
                    >
                      <item.icon size={18} className={active ? "text-[var(--gold-600)]" : "text-[var(--sand-400)]"} aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {errors > 0 && (
                        <Badge tone="danger">
                          {errors}
                          <span className="sr-only"> помилок</span>
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-[var(--sand-200)] p-3">
        <a
          href="/uk"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--warm-600)] hover:bg-[var(--cream-100)] lg:min-h-10"
        >
          <ArrowUpRight size={18} className="text-[var(--sand-400)]" aria-hidden />
          Відкрити сайт
        </a>
        <button
          type="button"
          onClick={signOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--warm-600)] hover:bg-[var(--cream-100)] lg:min-h-10"
        >
          <LogOut size={18} className="text-[var(--sand-400)]" aria-hidden />
          Вийти
        </button>
      </div>
    </>
  );
}

function StatusBanner() {
  const { status, loadError, reload, doc, readOnly } = useAdminContent();
  const confirm = useConfirm();

  if (readOnly && status === "ready") {
    return (
      <div className="px-4 pt-4 sm:px-6 lg:px-10">
        <Notice tone="warning" title="Прев'ю-деплой — лише перегляд">
          Тут можна подивитися новий вигляд адмінки, але зберігати зміни вимкнено: сховище спільне з живим сайтом.
        </Notice>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="px-4 pt-4 sm:px-6 lg:px-10">
        <Notice
          tone="danger"
          title="Контент не завантажився"
          action={
            <Button variant="secondary" size="sm" onClick={() => void reload()}>
              <RefreshCw size={14} aria-hidden /> Спробувати ще раз
            </Button>
          }
        >
          Збереження заблоковано, щоб не перезаписати сайт неповними даними.
          {loadError && <span className="mt-1 block text-xs opacity-80">{loadError}</span>}
        </Notice>
      </div>
    );
  }

  if (status === "conflict") {
    return (
      <div className="px-4 pt-4 sm:px-6 lg:px-10">
        <Notice
          tone="danger"
          title="Контент змінено в іншій вкладці або на іншому пристрої"
          action={
            <>
              <Button variant="secondary" size="sm" onClick={() => downloadJson("ellen-soul-moi-zminy.json", doc)}>
                <Download size={14} aria-hidden /> Зберегти мої зміни у файл
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Завантажити актуальну версію?",
                    description: "Ваші незбережені зміни тут буде втрачено. Спершу можна зберегти їх у файл.",
                    confirmLabel: "Завантажити",
                  });
                  if (ok) await reload();
                }}
              >
                <RefreshCw size={14} aria-hidden /> Завантажити актуальну версію
              </Button>
            </>
          }
        >
          Ваші останні зміни не збережено, щоб не затерти чужі.
        </Notice>
      </div>
    );
  }

  return null;
}

/** "Виправте 1 помилку / 2 помилки / 5 помилок" (accusative). */
const errorsPhrase = (n: number) => plural(n, "помилку", "помилки", "помилок");

function SaveBar() {
  const { dirty, saving, save, discard, issues, status, readOnly } = useAdminContent();
  const confirm = useConfirm();
  if (!dirty && !saving) return null;

  const errors = issues.filter((i) => i.severity === "error");

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--sand-200)] bg-white/95 shadow-[0_-4px_16px_rgba(28,21,18,0.06)] backdrop-blur lg:left-64">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <p className="text-sm" role="status">
          {readOnly ? (
            <span className="text-[var(--warm-600)]">{"Прев'ю: зберігати вимкнено"}</span>
          ) : errors.length > 0 ? (
            <span className="text-[var(--danger)]">
              Виправте {errorsPhrase(errors.length)}:{" "}
              <Link href={SECTION_HREF[errors[0].section]} className="underline underline-offset-2">
                {errors[0].message}
              </Link>
            </span>
          ) : (
            <span className="text-[var(--warm-600)]">
              Є незбережені зміни
              <span className="hidden text-[var(--muted)] sm:inline"> · Ctrl/⌘+S</span>
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={saving}
            onClick={async () => {
              const ok = await confirm({
                title: "Скасувати всі зміни?",
                description: "Повернеться останній збережений стан.",
                confirmLabel: "Скасувати зміни",
              });
              if (ok) discard();
            }}
          >
            <Undo2 size={16} aria-hidden /> Скасувати
          </Button>
          <Button
            className="flex-1 sm:flex-none"
            loading={saving}
            disabled={status !== "ready" || errors.length > 0 || readOnly}
            onClick={() => void save()}
          >
            {!saving && <Save size={16} aria-hidden />} Зберегти
          </Button>
        </div>
      </div>
    </div>
  );
}
