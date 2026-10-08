"use client";

import { useState } from "react";
import { contentDefaults } from "@/lib/content-defaults";
import { useContentKey } from "@/components/admin/content-context";
import { Card, LangTabs, Notice, PageHeader, TextAreaField, TextField, type Lang } from "@/components/admin/ui";

type About = ReturnType<typeof contentDefaults>["about"];
const LANG_LABEL: Record<Lang, string> = { uk: "UK", ru: "RU", en: "EN" };
const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";

export default function AboutPage() {
  const [about, setAbout] = useContentKey<About>("about", contentDefaults().about);
  const [lang, setLang] = useState<Lang>("uk");
  const field = (name: "story_title" | "story_text" | "quote") => `${name}_${lang}` as keyof About;

  const missing: Partial<Record<Lang, boolean>> = {};
  for (const l of ["uk", "ru", "en"] as const) {
    missing[l] = blank(about[`story_title_${l}` as keyof About]) || blank(about[`story_text_${l}` as keyof About]);
  }

  return (
    <>
      <PageHeader
        title="Про мене"
        description="Блок «Моя історія» на сторінці «Про мене» та короткий опис і цитата на головній."
        siteHref={`/${lang}/about`}
      />
      <div className="mb-5">
        <LangTabs value={lang} onChange={setLang} missing={missing} />
      </div>
      {missing[lang] && (
        <Notice tone="warning" className="mb-5">
          Порожній текст покаже на сайті порожнє місце — заповніть усі поля для цієї мови.
        </Notice>
      )}
      <Card className="space-y-5">
        <TextField
          label={`Заголовок історії (${LANG_LABEL[lang]})`}
          value={(about[field("story_title")] as string) ?? ""}
          onChange={(v) => setAbout({ ...about, [field("story_title")]: v })}
          maxLength={90}
        />
        <TextAreaField
          label={`Текст історії (${LANG_LABEL[lang]})`}
          value={(about[field("story_text")] as string) ?? ""}
          onChange={(v) => setAbout({ ...about, [field("story_text")]: v })}
          rows={7}
          maxLength={900}
          hint="На головній показується цей самий текст."
        />
        <TextField
          label={`Цитата (${LANG_LABEL[lang]})`}
          value={(about[field("quote")] as string) ?? ""}
          onChange={(v) => setAbout({ ...about, [field("quote")]: v })}
          maxLength={80}
        />
      </Card>
    </>
  );
}
