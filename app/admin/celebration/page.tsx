"use client";

import { Eye } from "lucide-react";
import {
  CELEBRATION_THEMES,
  DEFAULT_CELEBRATION,
  isCelebrationActive,
  todayLocalISO,
  type CelebrationConfig,
} from "@/lib/celebration";
import { useContentKey } from "@/components/admin/content-context";
import { Badge, Card, Notice, PageHeader, SelectField, SwitchRow, TextField, buttonVariants } from "@/components/admin/ui";

export default function CelebrationPage() {
  const [stored, setCel] = useContentKey<CelebrationConfig>("celebration", DEFAULT_CELEBRATION);
  const cel = { ...DEFAULT_CELEBRATION, ...stored };
  const update = (patch: Partial<CelebrationConfig>) => setCel({ ...cel, ...patch });
  const today = todayLocalISO();
  const live = isCelebrationActive(cel, today);
  const badDates = cel.startDate > cel.endDate;

  return (
    <>
      <PageHeader
        title="Святкова анімація"
        description="Повноекранна анімація поверх сайту — раз на відвідувача у вікні дат. Без тексту й логотипів; поважає «зменшений рух» на пристрої."
        badge={live ? <Badge tone="success">Активна зараз</Badge> : <Badge tone="muted">Не показується</Badge>}
        actions={
          <a href="/uk?celebrate=1" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <Eye size={14} aria-hidden /> Переглянути зараз
          </a>
        }
      />

      <Notice tone={live ? "success" : "info"} className="mb-6">
        {!cel.enabled
          ? "Вимкнено — не показується нікому."
          : live
            ? "Відвідувачі зараз бачать анімацію (раз на пристрій)."
            : `Увімкнено, але сьогодні (${today}) поза вікном ${cel.startDate} – ${cel.endDate}.`}{" "}
        «Переглянути зараз» показує анімацію одразу, ігноруючи дати.
      </Notice>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card title="Що показувати">
          <div className="divide-y divide-[var(--sand-100)]">
            <SwitchRow label="Анімація увімкнена" description="Головний вимикач. Дати нижче все одно обмежують показ." checked={cel.enabled} onChange={(enabled) => update({ enabled })} />
            <SwitchRow label="Кінематографічний вступ" description="Повноекранна сцена при вході (раз на відвідувача)." checked={cel.intro} onChange={(intro) => update({ intro })} />
            <SwitchRow label="Жива атмосфера" description="Частинки, зорепади, магія курсора, сцена у футері, святкова вкладка." checked={cel.atmosphere} onChange={(atmosphere) => update({ atmosphere })} />
          </div>
        </Card>
        <Card title="Коли і яка" className="space-y-4">
          <SelectField
            label="Тема"
            value={cel.theme}
            onChange={(theme) => update({ theme: theme as CelebrationConfig["theme"] })}
            options={CELEBRATION_THEMES.map((t) => ({ value: t.id, label: t.label }))}
          />
          <TextField label="Назва (лише для вас)" value={cel.title} onChange={(title) => update({ title })} placeholder="День народження Ellen" />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Показувати з" type="date" value={cel.startDate} onChange={(startDate) => update({ startDate })} />
            <TextField
              label="До (включно)"
              type="date"
              value={cel.endDate}
              onChange={(endDate) => update({ endDate })}
              error={badDates ? "Кінець раніше за початок" : null}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
