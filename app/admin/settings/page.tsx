"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Download, TriangleAlert, Upload } from "lucide-react";
import { adminFetch, downloadJson, responseError } from "@/components/admin/admin-fetch";
import { useAdminContent } from "@/components/admin/content-context";
import { formatAgo, formatDateTime } from "@/components/admin/format";
import { Button, Card, Notice, PageHeader, Skeleton, useConfirm, useToast } from "@/components/admin/ui";

type Status = {
  storage: "blob" | "local" | "none";
  content: { savedAt: string | null; backups: number; latestBackupAt: string | null; error?: string };
  integrations: Record<string, boolean>;
};

const INTEGRATIONS: Record<string, { name: string; affects: string }> = {
  supabase_admin: { name: "База даних (Supabase)", affects: "Розділ «Користувачі», сповіщення, відео" },
  telegram_bot: { name: "Telegram-бот", affects: "Сповіщення, звʼязування акаунтів, персональні повідомлення" },
  telegram_webhook_secret: { name: "Захист вебхука Telegram", affects: "Без нього бот не прийматиме повідомлення" },
  telegram_leads_chat: { name: "Чат для заявок", affects: "Куди приходять заявки з форми запису" },
  cron_secret: { name: "Ключ щоденних задач", affects: "Ранкові сповіщення, синхронізація відео" },
  groq_ai: { name: "AI (Groq)", affects: "Усі AI-тлумачення в інструментах" },
  youtube: { name: "YouTube", affects: "Список відео в «Щоденнику таролога»" },
  web_push: { name: "Web Push", affects: "Сповіщення в браузері" },
  posthog: { name: "Аналітика (PostHog)", affects: "Статистика відвідувань і використання інструментів" },
};

const KNOWN_KEYS = ["services", "org", "faq_uk", "faq_ru", "faq_en", "about", "contacts", "studio_tools", "tools_enabled", "celebration", "ai_prompts", "testimonials", "home", "blog"];

export default function SettingsPage() {
  const { doc, status: contentStatus, replaceAll } = useAdminContent();
  const toast = useToast();
  const confirm = useConfirm();
  const [sys, setSys] = useState<Status | null>(null);
  const [sysError, setSysError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminFetch("/api/admin/status")
      .then(async (r) => {
        if (!r.ok) throw new Error(await responseError(r));
        setSys(await r.json());
      })
      .catch((e) => setSysError(e instanceof Error ? e.message : String(e)));
  }, []);

  const exportContent = () => {
    if (!doc) return;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
    downloadJson(`ellen-soul-content-${stamp}.json`, doc);
    toast({ title: "Файл завантажено", description: "Містить AI-промти — не публікуйте його." });
  };

  const importContent = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Файл не містить обʼєкта контенту");
      const known = Object.keys(parsed).filter((k) => KNOWN_KEYS.includes(k));
      if (known.length < 3) throw new Error("Це не схоже на експорт контенту Ellen Soul");
      const ok = await confirm({
        title: "Замінити контент даними з файлу?",
        description: "Дані потраплять у редактор як незбережені зміни — перегляньте їх і натисніть «Зберегти». Перед цим поточну версію буде скопійовано в історію.",
        confirmLabel: "Завантажити в редактор",
        tone: "primary",
      });
      if (!ok) return;
      const snap = await adminFetch("/api/admin/content/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "snapshot" }),
      });
      if (!snap.ok) throw new Error(`Копію поточної версії не зроблено — ${await responseError(snap)}`);
      const content = { ...(parsed as Record<string, unknown>) };
      delete content._meta; // server-owned save metadata
      replaceAll(content);
      toast({ title: "Дані з файлу в редакторі", description: "Перегляньте розділи і натисніть «Зберегти» внизу." });
    } catch (e) {
      toast({ tone: "danger", title: "Імпорт не вдався", description: e instanceof Error ? e.message : String(e) });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <PageHeader title="Налаштування і стан" description="Чи все підключено, резервні копії, експорт та імпорт контенту." />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:gap-6">
        <Card title="Інтеграції" description="Лише перевірка «налаштовано / ні» — значення ключів тут не показуються.">
          {sysError ? (
            <Notice tone="danger">Стан не отримано: {sysError}</Notice>
          ) : !sys ? (
            <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : (
            <ul className="divide-y divide-[var(--sand-100)]">
              {Object.entries(INTEGRATIONS).map(([key, info]) => {
                const ok = sys.integrations[key];
                return (
                  <li key={key} className="flex items-start gap-3 py-3">
                    {ok ? (
                      <CircleCheck size={18} className="mt-0.5 shrink-0 text-[var(--success)]" aria-label="Налаштовано" />
                    ) : (
                      <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[var(--danger)]" aria-label="Не налаштовано" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{info.name}</p>
                      <p className="text-xs text-[var(--muted)]">{info.affects}</p>
                    </div>
                    {!ok && <span className="ml-auto shrink-0 text-xs text-[var(--danger)]">не налаштовано</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="space-y-4 lg:space-y-6">
          <Card title="Контент">
            {!sys ? (
              <Skeleton className="h-20" />
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Сховище</dt>
                  <dd>{sys.storage === "blob" ? "Vercel Blob" : sys.storage === "local" ? "Локальне (тестове)" : "Не налаштовано"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Збережено</dt>
                  <dd title={formatDateTime(sys.content.savedAt)}>{formatAgo(sys.content.savedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--muted)]">Копій в історії</dt>
                  <dd>{sys.content.backups}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card title="Експорт та імпорт" description="Файл усього контенту — як додаткова резервна копія або щоб перенести зміни.">
            <div className="flex flex-col gap-2">
              <Button variant="secondary" onClick={exportContent} disabled={!doc}>
                <Download size={16} aria-hidden /> Завантажити контент (JSON)
              </Button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void importContent(e.target.files?.[0])} />
              <Button variant="secondary" onClick={() => fileRef.current?.click()} loading={importing} disabled={contentStatus !== "ready"}>
                {!importing && <Upload size={16} aria-hidden />} Імпортувати з файлу
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
