# SEO_BASICS — мінімальна SEO-гігієна (свідомо НЕ фокус)
`v1.0 · 2026-07-06 · owner: Claude(CTO)` · рішення власника: SEO — підтримка, не двигун

## Що вже є (не ламати!)
Sitemaps · schema.org (зокрема VideoObject) · OG · IndexNow · hreflang/`<html lang>` per locale · canonical (дубль-canonical уже виправляли — див. git). Робота з `lib/seo/`.

## Правило нової сторінки (і все)
- title + description (мовою сторінки) · canonical · сторінка в sitemap · OG-теги · `<html lang>` коректний.
- 3 мовні версії посилаються одна на одну (hreflang — наявний механізм).

## Заборони
- ❌ Ламати наявні sitemap/schema при рефакторингу (перевірка: сторінка в sitemap після деплою).
- ❌ SEO-контент заради SEO (тонкі сторінки під запити) — це шлях GrandKeram, тут НЕ наша стратегія.
- ❌ Дублікати між мовами без hreflang-звʼязки.

## Якщо колись SEO стане фокусом
Спершу baseline (GSC + позиції) → діагноз → тоді план. Не діяти за гіпотезами (урок GrandKeram: гіпотеза index-bloat була спростована даними). Розгорнутий playbook лежить у GrandKeram `_os/2_STANDARDS/SEO_STANDARDS.md`.
