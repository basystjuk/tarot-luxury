"use client";

import { useState } from "react";
import { contentDefaults } from "@/lib/content-defaults";
import InactiveNotice from "@/components/admin/InactiveNotice";
import { useContentKey } from "@/components/admin/content-context";
import { Badge, Card, LangTabs, PageHeader, TextAreaField, TextField, type Lang } from "@/components/admin/ui";

type Home = ReturnType<typeof contentDefaults>["home"];

export default function HomeHeroPage() {
  const [home, setHome] = useContentKey<Home>("home", contentDefaults().home);
  const [lang, setLang] = useState<Lang>("uk");
  const key = (name: "hero_tag" | "hero_title" | "hero_sub") => `${name}_${lang}` as keyof Home;

  return (
    <>
      <PageHeader title="Головна (hero)" badge={<Badge tone="muted">Не відображається на сайті</Badge>} />
      <InactiveNotice>Перший екран головної бере тексти з перекладів у коді, а не звідси.</InactiveNotice>
      <div className="mb-5">
        <LangTabs value={lang} onChange={setLang} />
      </div>
      <Card className="space-y-4">
        <TextField label={`Тег (${lang.toUpperCase()})`} value={(home[key("hero_tag")] as string) ?? ""} onChange={(v) => setHome({ ...home, [key("hero_tag")]: v })} />
        <TextAreaField label={`Заголовок (${lang.toUpperCase()})`} value={(home[key("hero_title")] as string) ?? ""} onChange={(v) => setHome({ ...home, [key("hero_title")]: v })} rows={2} />
        <TextAreaField label={`Підзаголовок (${lang.toUpperCase()})`} value={(home[key("hero_sub")] as string) ?? ""} onChange={(v) => setHome({ ...home, [key("hero_sub")]: v })} rows={3} />
      </Card>
    </>
  );
}
