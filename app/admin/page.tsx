"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CircleHelp, History, Images, Tag, ToggleRight } from "lucide-react";
import { adminFetch } from "@/components/admin/admin-fetch";
import { useAdminContent } from "@/components/admin/content-context";
import { formatAgo, plural } from "@/components/admin/format";
import { SECTION_HREF } from "@/components/admin/nav";
import { Badge, Card, Notice, PageHeader, Skeleton } from "@/components/admin/ui";

type Status = {
  storage: "blob" | "local" | "none";
  content: { savedAt: string | null; backups: number; latestBackupAt: string | null; error?: string };
  integrations: Record<string, boolean>;
};

const QUICK = [
  { href: "/admin/services", label: "Змінити послуги та ціни", icon: Tag },
  { href: "/admin/faq", label: "Додати питання у FAQ", icon: CircleHelp },
  { href: "/admin/media", label: "Оновити галерею", icon: Images },
  { href: "/admin/tools", label: "Увімкнути або вимкнути інструмент", icon: ToggleRight },
  { href: "/admin/history", label: "Повернути попередню версію", icon: History },
];

const count = (v: unknown) => (Array.isArray(v) ? v.length : 0);

export default function DashboardPage() {
  const { doc, issues, savedAt, dirty, status } = useAdminContent();
  const [sys, setSys] = useState<Status | null>(null);
  const [sysError, setSysError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/status")
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        setSys(await r.json());
      })
      .catch((e) => setSysError(e instanceof Error ? e.message : String(e)));
  }, []);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const integrations = sys ? Object.values(sys.integrations) : [];
  const integrationsOk = integrations.filter(Boolean).length;

  return (
    <>
      <PageHeader
        title="Головний екран"
        description="Стан контенту сайту, швидкі дії та стан системи."
        siteHref="/uk"
      />

      {dirty && (
        <Notice tone="warning" className="mb-6" title="Є незбережені зміни">
          Збережіть їх кнопкою внизу екрана або Ctrl/⌘+S.
        </Notice>
      )}

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Card title="Контент" className="lg:col-span-2">
          {status === "loading" || !doc ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Послуг", value: count(doc.services) },
                  { label: "Питань FAQ (UK)", value: count(doc.faq_uk) },
                  { label: "Оргпунктів", value: count(doc.org) },
                  { label: "Збережено", value: formatAgo(savedAt) },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-[var(--cream-100)] p-3">
                    <dt className="text-xs text-[var(--muted)]">{s.label}</dt>
                    <dd className="mt-1 text-2xl" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600 }}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium">Що варто виправити</h3>
                  {errors.length > 0 && <Badge tone="danger">{plural(errors.length, "помилка", "помилки", "помилок")}</Badge>}
                  {warnings.length > 0 && <Badge tone="gold">{plural(warnings.length, "зауваження", "зауваження", "зауважень")}</Badge>}
                </div>
                {issues.length === 0 ? (
                  <p className="text-sm text-[var(--success)]">Усе заповнено — проблем не знайдено.</p>
                ) : (
                  <ul className="divide-y divide-[var(--sand-100)] rounded-xl border border-[var(--sand-200)]">
                    {[...errors, ...warnings].slice(0, 8).map((i, n) => (
                      <li key={n}>
                        <Link
                          href={SECTION_HREF[i.section]}
                          className="flex min-h-11 items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--cream-100)]"
                        >
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${i.severity === "error" ? "bg-[var(--danger)]" : "bg-[var(--gold-400)]"}`}
                            aria-hidden
                          />
                          <span className="flex-1">{i.message}</span>
                          <ArrowRight size={14} className="text-[var(--sand-400)]" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {issues.length > 8 && <p className="mt-2 text-xs text-[var(--muted)]">…і ще {issues.length - 8}.</p>}
              </div>
            </>
          )}
        </Card>

        <Card title="Швидкі дії">
          <ul className="-mx-2">
            {QUICK.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-sm hover:bg-[var(--cream-100)]">
                  <q.icon size={18} className="text-[var(--sand-400)]" aria-hidden />
                  <span className="flex-1">{q.label}</span>
                  <ArrowRight size={14} className="text-[var(--sand-400)]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Система" className="lg:col-span-2" actions={<Link href="/admin/settings" className="text-sm text-[var(--gold-600)] hover:underline">Детальніше</Link>}>
          {sysError ? (
            <Notice tone="danger">Не вдалося отримати стан системи ({sysError}).</Notice>
          ) : !sys ? (
            <Skeleton className="h-16" />
          ) : (
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--cream-100)] p-3">
                <dt className="text-xs text-[var(--muted)]">Інтеграції</dt>
                <dd className="mt-1 text-sm">
                  <Badge tone={integrationsOk === integrations.length ? "success" : "gold"}>
                    {integrationsOk} з {integrations.length} налаштовано
                  </Badge>
                </dd>
              </div>
              <div className="rounded-xl bg-[var(--cream-100)] p-3">
                <dt className="text-xs text-[var(--muted)]">Копії контенту</dt>
                <dd className="mt-1 text-sm">{sys.content.backups} · остання {formatAgo(sys.content.latestBackupAt)}</dd>
              </div>
              <div className="rounded-xl bg-[var(--cream-100)] p-3">
                <dt className="text-xs text-[var(--muted)]">Сховище</dt>
                <dd className="mt-1 text-sm">
                  {sys.storage === "blob" ? "Vercel Blob" : sys.storage === "local" ? "Локальне (тестове)" : "Не налаштовано"}
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card title="Аудиторія">
          <p className="text-sm text-[var(--muted)]">
            Користувачі, підписники Telegram і використання інструментів з’являться тут після налаштування доступу до
            аналітики та персональних акаунтів адмінів.
          </p>
          <Link href="/admin/users" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--gold-600)] hover:underline">
            Перейти до користувачів <ArrowRight size={14} aria-hidden />
          </Link>
        </Card>
      </div>
    </>
  );
}
