/**
 * /[lang]/dreams/[symbol] — single dream-symbol page.
 *
 * The SEO backbone of the Сонник: a readable reference page per symbol
 * with psychology / spiritual / folk meanings + a generated FAQ, plus
 * Article + FAQPage + Breadcrumb JSON-LD for rich results. Statically
 * generated for every symbol × locale.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import FaqSchema, { type FaqEntry } from "@/components/seo/FaqSchema";
import { DREAM_SYMBOLS, SYMBOL_BY_SLUG, symbolName, ARCHETYPE_LABELS, type DreamSymbol } from "@/lib/dreams/symbols";

const SITE = "https://ellen-soul.com";
const LANGS = ["uk", "ru", "en"] as const;
type Lang = "uk" | "ru" | "en";

const T = {
  uk: {
    tag: "Тлумачення сну", toDream: "До чого сниться", psy: "Психологічне значення",
    spi: "Духовне значення", folk: "Народні трактування", faq: "Часті запитання",
    related: "Інші символи", cta: "Розтлумачити весь сон в AI-соннику", archetypes: "Архетипи",
    metaPrefix: "До чого сниться", metaSuffix: "тлумачення сну — психологічне, духовне та народне значення на Ellen Soul.",
  },
  ru: {
    tag: "Толкование сна", toDream: "К чему снится", psy: "Психологическое значение",
    spi: "Духовное значение", folk: "Народные толкования", faq: "Частые вопросы",
    related: "Другие символы", cta: "Растолковать весь сон в AI-соннике", archetypes: "Архетипы",
    metaPrefix: "К чему снится", metaSuffix: "толкование сна — психологическое, духовное и народное значение на Ellen Soul.",
  },
  en: {
    tag: "Dream meaning", toDream: "Dreaming of", psy: "Psychological meaning",
    spi: "Spiritual meaning", folk: "Folk interpretations", faq: "FAQ",
    related: "Other symbols", cta: "Interpret your whole dream with AI", archetypes: "Archetypes",
    metaPrefix: "Dreaming of", metaSuffix: "dream meaning — psychological, spiritual and folk interpretation at Ellen Soul.",
  },
};

export function generateStaticParams() {
  return LANGS.flatMap((lang) => DREAM_SYMBOLS.map((s) => ({ lang, symbol: s.slug })));
}

function buildFaq(s: DreamSymbol, lang: Lang): FaqEntry[] {
  const name = symbolName(s, lang).toLowerCase();
  if (lang === "ru") return [
    { q: `К чему снится ${name}?`, a: `${s.psychology.ru} ${s.spiritual.ru}` },
    { q: `Хороший ли это сон?`, a: `${s.folk.ru} Помните: сон — это символ состояния, а не предсказание.` },
    { q: `Что делать после такого сна?`, a: `Опишите весь свой сон в AI-соннике Ellen Soul, чтобы получить персональное толкование с учётом всех символов и эмоций.` },
  ];
  if (lang === "en") return [
    { q: `What does it mean to dream of a ${name}?`, a: `${s.psychology.en} ${s.spiritual.en}` },
    { q: `Is this a good dream?`, a: `${s.folk.en} Remember: a dream is a symbol of your state, not a prediction.` },
    { q: `What should I do after such a dream?`, a: `Describe your whole dream in the Ellen Soul AI dream interpreter to get a personal reading that accounts for every symbol and emotion.` },
  ];
  return [
    { q: `До чого сниться ${name}?`, a: `${s.psychology.uk} ${s.spiritual.uk}` },
    { q: `Це добрий сон?`, a: `${s.folk.uk} Памʼятайте: сон — це символ стану, а не передбачення.` },
    { q: `Що робити після такого сну?`, a: `Опишіть увесь свій сон в AI-соннику Ellen Soul, щоб отримати персональне тлумачення з урахуванням усіх символів та емоцій.` },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; symbol: string }> }): Promise<Metadata> {
  const { lang: raw, symbol } = await params;
  const lang = (LANGS.includes(raw as never) ? raw : "uk") as Lang;
  const s = SYMBOL_BY_SLUG[symbol];
  if (!s) return {};
  const t = T[lang];
  const name = symbolName(s, lang);
  return {
    title: `${t.metaPrefix} ${name.toLowerCase()} ${s.emoji} — ${t.tag} | Ellen Soul`,
    description: `${t.metaPrefix} ${name.toLowerCase()}: ${t.metaSuffix}`,
    alternates: {
      canonical: `${SITE}/${lang}/dreams/${symbol}`,
      languages: {
        uk: `${SITE}/uk/dreams/${symbol}`, ru: `${SITE}/ru/dreams/${symbol}`,
        en: `${SITE}/en/dreams/${symbol}`, "x-default": `${SITE}/uk/dreams/${symbol}`,
      },
    },
  };
}

export default async function SymbolPage({ params }: { params: Promise<{ lang: string; symbol: string }> }) {
  const { lang: raw, symbol } = await params;
  const lang = (LANGS.includes(raw as never) ? raw : "uk") as Lang;
  const s = SYMBOL_BY_SLUG[symbol];
  if (!s) notFound();
  const t = T[lang];
  const name = symbolName(s, lang);
  const faq = buildFaq(s, lang);
  const home = lang === "ru" ? "Главная" : lang === "en" ? "Home" : "Головна";
  const dictTitle = lang === "ru" ? "Сонник" : lang === "en" ? "Dream Dictionary" : "Сонник";

  // Related: same first archetype, else first few others.
  const related = DREAM_SYMBOLS.filter((x) => x.slug !== s.slug && x.archetypes.some((a) => s.archetypes.includes(a))).slice(0, 6);
  const relatedFinal = related.length >= 3 ? related : DREAM_SYMBOLS.filter((x) => x.slug !== s.slug).slice(0, 6);

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.metaPrefix} ${name.toLowerCase()} — ${t.tag}`,
    description: `${s.psychology[lang]}`,
    inLanguage: lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "uk-UA",
    author: { "@id": `${SITE}/#person` },
    publisher: { "@id": `${SITE}/#organization` },
    mainEntityOfPage: `${SITE}/${lang}/dreams/${s.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <FaqSchema faqs={faq} />
      <Breadcrumbs items={[
        { name: home, url: `${SITE}/${lang}` },
        { name: dictTitle, url: `${SITE}/${lang}/dreams` },
        { name, url: `${SITE}/${lang}/dreams/${s.slug}` },
      ]} />

      <section className="pt-36 pb-10 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.12),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <div className="text-6xl mb-4">{s.emoji}</div>
            <span className="tag mb-4 inline-block">{t.tag}</span>
            <h1 className="text-[clamp(2.2rem,5vw,3.6rem)] text-[#1C1512] leading-[1.06]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}>
              {t.toDream} {name.toLowerCase()}
            </h1>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <Block title={t.psy} text={s.psychology[lang]} />
          <Block title={t.spi} text={s.spiritual[lang]} />
          <Block title={t.folk} text={s.folk[lang]} />

          {/* Archetypes */}
          <div>
            <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#C4A97A] mb-3">{t.archetypes}</h2>
            <div className="flex flex-wrap gap-2">
              {s.archetypes.map((a) => (
                <span key={a} className="px-3 py-1.5 rounded-full text-sm bg-[rgba(196,169,122,0.12)] text-[#9A6E28] border border-[rgba(196,169,122,0.25)]">
                  {ARCHETYPE_LABELS[a][lang]}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.08)] p-6 text-center">
            <p className="text-[#5C4530] mb-4 leading-relaxed">
              {lang === "ru" ? "Один символ — лишь часть сна. Получите полное толкование с учётом всех образов и эмоций."
                : lang === "en" ? "One symbol is only part of the dream. Get a full reading that accounts for every image and emotion."
                : "Один символ — лише частина сну. Отримайте повне тлумачення з урахуванням усіх образів та емоцій."}
            </p>
            <Link href={`/${lang}/studio/dreams`} className="btn-primary inline-flex">
              <Sparkles size={16} /> {t.cta}
            </Link>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.faq}</h2>
            <div className="space-y-4">
              {faq.map((f, i) => (
                <div key={i} className="rounded-2xl border border-[rgba(196,169,122,0.2)] bg-white/60 p-5">
                  <h3 className="text-[#1C1512] mb-2" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.15rem" }}>{f.q}</h3>
                  <p className="text-[#5C4530] text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <div>
            <h2 className="text-2xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>{t.related}</h2>
            <div className="flex flex-wrap gap-3">
              {relatedFinal.map((r) => (
                <Link key={r.slug} href={`/${lang}/dreams/${r.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[rgba(196,169,122,0.2)] hover:border-[rgba(196,169,122,0.45)] transition-colors">
                  <span className="text-lg">{r.emoji}</span>
                  <span className="text-sm text-[#1C1512]">{symbolName(r, lang)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-[11px] tracking-[0.18em] uppercase text-[#C4A97A] mb-2">{title}</h2>
      <p className="text-[#3D2E1F] leading-relaxed" style={{ fontSize: "1.05rem" }}>{text}</p>
    </div>
  );
}
