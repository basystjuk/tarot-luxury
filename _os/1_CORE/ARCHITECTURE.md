# ARCHITECTURE — технічна архітектура
`v1.0 · 2026-07-06 · owner: Claude(CTO)`

## Стек (факти з репо)
- **Next.js 16** (App Router, `app/[lang]/…` i18n uk/ru/en через middleware) · React 19 · TypeScript strict · Tailwind v4.
- **Supabase:** auth + Postgres (RLS) — profiles, tarot_history, telegram (link-tokens, prefs, send log), push, notifications, youtube_videos. Міграції: `supabase/migrations/000N_*.sql`.
- **Vercel:** хостинг + деплой з git + **crons** (`vercel.json`: notifications 04:00, youtube-sync 01:30; auth через `CRON_SECRET`).
- **Groq AI** — всі інструменти (промпти: `lib/ai-prompts.ts`).
- **Telegram Bot API** — `lib/telegram/bot.ts`; webhook `api/admin/setup-telegram-webhook` + `TELEGRAM_WEBHOOK_SECRET`; канал `@ellen_rouge` (бот — адмін каналу).
- **web-push** — браузерні пуші. **PostHog (EU)** — аналітика (proxy `/ingest`). **Vercel Blob** — адмін-оверрайди контенту/промптів/галереї.
- Адмінка: `app/admin/*` + `api/admin/*` (users, content, gallery, videos, preview).

## Domain Map (хто від чого залежить)
```
SUPABASE (клієнти: profiles/telegram/push/history)
   ├─→ кабінет (app/[lang]/account) + інструменти (історія)
   ├─→ нотифікації (cron 04:00 → TG bot + web-push)
   └─→ адмінка (users, send-message)
GROQ (lib/ai-prompts.ts) ─→ усі AI-тули (dreams/moon/numerology/natal/compat)
TELEGRAM (bot.ts) ←→ webhook ←→ link-tokens (кабінет ↔ канал)
BLOB ─→ адмін-оверрайди контенту/промптів
I18N (lib/i18n/translations.ts) ─→ ВЕСЬ UI (3 мови)
DESIGN: tailwind.config.ts + app globals.css (:root токени) ← ДВА джерела, синхронні (див. DESIGN_SYSTEM)
```

## Відомі обмеження / ризики
- **Groq** — зовнішня залежність усіх тулів: ліміти/збої → потрібен graceful fallback.
- **Supabase free tier** — ⚠ перевірити план і **бекапи БД** (клієнтська база = головний актив; без бекапу = ризик класу GrandKeram-E1).
- Дизайн-токени в 2 місцях (tailwind config + globals.css) → ризик дрейфу; правило синхрону в DESIGN_SYSTEM.
- Next 16 — свіжіший за тренувальні дані асистентів → читати `node_modules/next/dist/docs/` (AGENTS.md).

## Timeline (додавати рядок на зміну)
- 2026-1H: сайт + інструменти + кабінет + TG-інтеграція + пуші + адмінка (до-OS період).
- 2026-07-06: розгорнуто Operating System v1.0 (за образом GrandKeram).
