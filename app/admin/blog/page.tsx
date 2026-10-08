"use client";

import { useState } from "react";
import { contentDefaults } from "@/lib/content-defaults";
import InactiveNotice from "@/components/admin/InactiveNotice";
import { useContentKey } from "@/components/admin/content-context";
import { Badge, Card, Notice, PageHeader, TextAreaField, TextField } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Blog = ReturnType<typeof contentDefaults>["blog"];
type BlogLang = "uk" | "ru";

export default function BlogBlockPage() {
  const [blog, setBlog] = useContentKey<Blog>("blog", contentDefaults().blog);
  const [lang, setLang] = useState<BlogLang>("uk");
  const key = (name: "title" | "desc" | "btn") => `${name}_${lang}` as keyof Blog;

  return (
    <>
      <PageHeader title="Блог (Telegram-блок)" badge={<Badge tone="muted">Не відображається на сайті</Badge>} />
      <InactiveNotice>Сторінка «Щоденник таролога» зараз показує YouTube-відео і цей блок не використовує.</InactiveNotice>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Мова" className="inline-flex rounded-xl border border-[var(--sand-200)] bg-[var(--cream-100)] p-1">
          {(["uk", "ru"] as const).map((l) => (
            <button
              key={l}
              type="button"
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={cn("min-h-10 min-w-12 rounded-lg px-3 text-sm font-medium sm:min-h-8", lang === l ? "bg-white shadow-sm" : "text-[var(--muted)]")}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)]">Англійської версії в цьому блоці немає.</span>
      </div>
      <Card className="space-y-4">
        <TextField label={`Заголовок (${lang.toUpperCase()})`} value={(blog[key("title")] as string) ?? ""} onChange={(v) => setBlog({ ...blog, [key("title")]: v })} />
        <TextAreaField label={`Опис (${lang.toUpperCase()})`} value={(blog[key("desc")] as string) ?? ""} onChange={(v) => setBlog({ ...blog, [key("desc")]: v })} rows={3} />
        <TextField label={`Текст кнопки (${lang.toUpperCase()})`} value={(blog[key("btn")] as string) ?? ""} onChange={(v) => setBlog({ ...blog, [key("btn")]: v })} />
        <TextField label="Посилання" type="url" inputMode="url" value={blog.link} onChange={(link) => setBlog({ ...blog, link })} placeholder="https://t.me/…" />
      </Card>
      <Notice tone="info" className="mt-6">Тексти для обох мов зберігаються разом із рештою контенту.</Notice>
    </>
  );
}
