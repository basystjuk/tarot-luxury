"use client";

import { Badge, Card, Notice, PageHeader } from "@/components/admin/ui";

const CATALOG = [
  { icon: "🔮", title: "Карта дня", key: "daily_card", freq: "Щодня", desc: "Персональна карта дня з коротким тлумаченням." },
  { icon: "🃏", title: "Карта тижня", key: "weekly_card", freq: "Щопонеділка", desc: "Енергія та фокус на найближчий тиждень." },
  { icon: "⚡", title: "Гороскоп дня", key: "daily_horoscope", freq: "~1 раз на 4-5 днів", desc: "Лише турбулентні дні — коли варто бути обережнішою. Потокові дні більше не шлються (рішення 12.08.2026): це була похвала без вказівки до дії, і виходило 82% днів. Містить вікно удачі." },
  { icon: "🌑", title: "Затемнення", key: "eclipse", freq: "1 лист за подію · ~4/рік", desc: "Точний момент максимуму (Meeus 54, звірено з каноном NASA). Для місячних — ще початок і кінець тіньової фази. Напівтіньові не анонсуємо." },
  { icon: "🌕", title: "Пік фази Місяця", key: "moon_phase_peak", freq: "Новолуння та повня · ~2/міс", desc: "Пікові фази Місяця — час намірів (новолуння) і завершень (повня)." },
  { icon: "🌙", title: "Місячне повернення", key: "lunar_return", freq: "~раз на місяць", desc: "Місяць повертається до натального положення — особистий емоційний рестарт." },
  { icon: "☀️", title: "Соляр (астро-ДН)", key: "solar_return", freq: "Раз на рік · день народження", desc: "Сонце повертається до натального градуса — астрологічний день народження, старт нового циклу." },
  { icon: "☿", title: "Меркурій ретроградний", key: "mercury_retrograde", freq: "~3–4 рази/рік", desc: "Станції Меркурія (ретро / директ). Час перегляду, а не нових стартів у комунікації й угодах." },
];

export default function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Сповіщення"
        description="Що автоматично отримують підписники в Telegram і Web Push. Щоранку (≈ 06:00–07:00 за Києвом) розсилка визначає події один раз і персоналізує їх під натальні дані кожного. Кожен тип користувач може вимкнути в кабінеті; дублі відсікає журнал."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {CATALOG.map((n) => (
          <Card key={n.key} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600 }}>
                <span aria-hidden>{n.icon}</span>
                {n.title}
              </h2>
              <Badge tone="gold">{n.freq}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{n.desc}</p>
            <p className="mt-3 flex flex-wrap gap-1.5 text-xs">
              <Badge tone="muted">Telegram</Badge>
              <Badge tone="muted">Web Push</Badge>
            </p>
          </Card>
        ))}
      </div>
      <Notice tone="info" className="mt-6" title="Новини Ellen">
        Перемикач «Новини» в кабінеті користувача є, але масової розсилки немає — за рішенням власника (12.08.2026) її не
        будуємо. Написати конкретній людині можна в розділі «Користувачі».
      </Notice>
    </>
  );
}
