'use client';

import Image from "next/image";
import Link from "next/link";
import HeroPhoto from "@/components/ui/HeroPhoto";
import { useState, useEffect, useRef, useCallback } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';
import { useModal } from '@/contexts/ModalContext';
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// photoUrl is now passed as a prop from the server component wrapper (page.tsx)
// — avoids the LCP-killing client-side fetch.

interface GalleryItem { url: string; pathname: string; position?: "top" | "center" | "bottom"; }

function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  useEffect(() => {
    fetch("/api/gallery").then(r => r.json()).then(d => { if (d.items) setItems(d.items); }).catch(() => {});
  }, []);
  return items;
}

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ items, index, onClose, onNav }: {
  items: GalleryItem[]; index: number; onClose: () => void; onNav: (dir: 1 | -1) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, onNav]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div
        className="relative max-w-[90vw] max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={items[index].url}
          alt="Gallery"
          width={800}
          height={1000}
          className="object-contain max-h-[85vh] rounded-2xl shadow-2xl"
          sizes="90vw"
        />
        {items.length > 1 && (
          <p className="text-center text-white/40 text-xs mt-3">{index + 1} / {items.length}</p>
        )}
      </div>
    </div>
  );
}

export default function AboutPageClient({ photoUrl }: { photoUrl: string }) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';
  const { openBooking } = useModal();
  const galleryItems = useGallery();

  const [apiStoryTitle, setApiStoryTitle] = useState<string | null>(null);
  const [apiStoryText, setApiStoryText] = useState<string | null>(null);
  const [apiQuote, setApiQuote] = useState<string | null>(null);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const nav = useCallback((dir: 1 | -1) => {
    if (lightboxIdx === null) return;
    setLightboxIdx((lightboxIdx + dir + galleryItems.length) % galleryItems.length);
  }, [lightboxIdx, galleryItems.length]);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => {
      if (d.about) {
        const a = d.about;
        setApiStoryTitle(isRu ? a.story_title_ru : isEn ? a.story_title_en : a.story_title_uk);
        setApiStoryText(isRu ? a.story_text_ru : isEn ? a.story_text_en : a.story_text_uk);
        setApiQuote(isRu ? a.quote_ru : isEn ? a.quote_en : a.quote_uk);
      }
    }).catch(() => {});
  }, [isRu, isEn]);

  const values = isRu ? [
    { title: "Безопасность и конфиденциальность", desc: "Всё, что вы рассказываете во время сессии, остаётся между нами. Я создаю пространство, где вы можете быть честны с собой." },
    { title: "Психологическая глубина", desc: "Карты — лишь язык. За ними всегда стоит реальная человеческая ситуация, которую я анализирую через призму современной психологии." },
    { title: "Этика и ответственность", desc: "Я никогда не манипулирую страхами и не создаю зависимости. Моя цель — ваша автономия и способность самостоятельно принимать решения." },
  ] : isEn ? [
    { title: "Safety & Confidentiality", desc: "Everything you share during a session stays between us. I create a space where you can be honest with yourself." },
    { title: "Psychological Depth", desc: "Cards are just the language. Behind them always lies a real human situation, which I analyse through the lens of modern psychology." },
    { title: "Ethics & Responsibility", desc: "I never manipulate fears or create dependencies. My goal is your autonomy and ability to make decisions independently." },
  ] : [
    { title: "Безпека та конфіденційність", desc: "Все, що ви розповідаєте під час сесії, залишається між нами. Я створюю простір, де ви можете бути чесними із собою." },
    { title: "Психологічна глибина", desc: "Карти — лише мова. За ними завжди стоїть реальна людська ситуація, яку я аналізую через призму сучасної психології." },
    { title: "Етика та відповідальність", desc: "Я ніколи не маніпулюю страхами і не створюю залежності. Моя мета — ваша автономія та здатність самостійно приймати рішення." },
  ];

  return (
    <>
      {/* Lightbox */}
      {lightboxIdx !== null && galleryItems.length > 0 && (
        <Lightbox items={galleryItems} index={lightboxIdx} onClose={() => setLightboxIdx(null)} onNav={nav} />
      )}

      {/* Hero */}
      <section className="pt-36 pb-20 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(196,169,122,0.12),transparent)]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">{isRu ? "Таролог" : isEn ? "Tarot Reader" : "Таролог"}</span>
            <h1
              className="text-[clamp(2.8rem,6vw,5.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Привет, я " : isEn ? "Hello, I'm " : "Привіт, я "}
              <em className="gradient-text not-italic">Ellen Soul</em>
            </h1>
            <p className="text-xl text-[#7A6A58] max-w-2xl mx-auto leading-relaxed">
              {isRu
                ? "Эмпат, чувствую людей и то, что стоит за их запросом — даже если он звучит совсем иначе, чем болит на самом деле."
                : isEn
                ? "Empath — I sense people and what lies behind their request, even when it sounds different from what truly hurts."
                : "Емпат, відчуваю людей і те, що стоїть за їхнім запитом — навіть якщо він звучить зовсім інакше, ніж болить насправді."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* My Story */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection direction="right">
              <div className="relative flex justify-center">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[380px] h-[380px] rounded-full border border-[rgba(196,169,122,0.15)]" />
                </div>
                <div className="relative w-[300px] h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_80px_rgba(196,169,122,0.25)] bg-[#EDE5D4]">
                  <HeroPhoto
                    photoUrl={photoUrl}
                    alt="Ellen Soul — таро-консультант і психолог"
                    width={300}
                    height={400}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(28,21,18,0.12)]" />
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="left" delay={0.15}>
              <div className="text-center mb-6">
                <span className="tag inline-block">{isRu ? "Моя история" : isEn ? "My story" : "Моя історія"}</span>
              </div>
              <h2
                className="text-[clamp(1.8rem,3vw,2.8rem)] mb-6 text-[#1C1512] text-center"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
              >
                {apiStoryTitle ?? (isRu
                  ? "От вопросов без ответа — к практике, которая меняет жизни"
                  : isEn
                  ? "From unanswered questions — to a practice that changes lives"
                  : "Від запитань без відповіді — до практики, яка змінює життя")}
              </h2>
              <p className="text-[#7A6A58] leading-relaxed mb-8">
                {apiStoryText ?? (isRu
                  ? "Практикую Таро больше 5 лет. Для меня Таро — это не «волшебная пилюля», а разговор. С вами, с вашей ситуацией, с тем, что вы в глубине уже знаете — просто пока не разрешили себе услышать. Главное направление — любовь и отношения, но работаю с любым запросом: выбор пути, финансы, работа, семья, внутреннее состояние."
                  : isEn
                  ? "I have been practising Tarot for over 5 years. For me, Tarot is not a magic pill — it is a conversation. With you, with your situation, with what you already know deep down — you just haven't allowed yourself to hear it yet. My main focus is love and relationships, but I work with any request: life choices, finances, work, family, inner state."
                  : "Практикую Таро більше 5 років. Для мене Таро — це не «чарівна таблетка», а розмова. З вами, з вашою ситуацією, з тим, що ви в глибині вже знаєте — просто поки не дозволили собі почути. Головний напрям — любов і стосунки, але працюю з будь-яким запитом: вибір шляху, фінанси, робота, сім'я, внутрішній стан.")}
              </p>
              <blockquote
                className="border-l-2 border-[#C4A97A] pl-6 text-2xl text-[#5C4530] mb-8"
                style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic" }}
              >
                {apiQuote ? `"${apiQuote}"` : isRu ? '"Таро расклады с душой."' : isEn ? '"Tarot readings with soul."' : '"Таро розклади з душею."'}
              </blockquote>
              <div className="text-center">
                <button onClick={() => openBooking()} className="btn-primary">
                  {isRu ? "Записаться на сессию" : isEn ? "Book a session" : "Записатись на сесію"}
                </button>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Photo Gallery ── */}
      {galleryItems.length > 0 && (
        <>
          <GoldDivider />
          <section className="section-padding bg-[#FDFBF7]">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
              <AnimatedSection className="text-center mb-10">
                <span className="tag mb-4 inline-block">
                  {isRu ? "Галерея" : isEn ? "Gallery" : "Галерея"}
                </span>
                <h2
                  className="text-[clamp(2rem,4vw,3.2rem)] text-[#1C1512]"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  {isRu ? "Моменты" : isEn ? "Moments" : "Моменти"}
                </h2>
              </AnimatedSection>

              {/* Horizontal scroll strip */}
              <div className="relative">
                <div
                  className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {galleryItems.map((item, idx) => (
                    <button
                      key={item.pathname}
                      onClick={() => setLightboxIdx(idx)}
                      className="flex-shrink-0 snap-start group relative w-[240px] h-[320px] rounded-2xl overflow-hidden border border-[rgba(196,169,122,0.2)] shadow-[0_8px_32px_rgba(196,169,122,0.15)] hover:shadow-[0_12px_48px_rgba(196,169,122,0.25)] transition-all duration-300 hover:scale-[1.02] focus:outline-none"
                    >
                      <Image
                        src={item.url}
                        alt={`Ellen Soul — фото ${idx + 1}`}
                        fill
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                          item.position === "center" ? "object-center"
                          : item.position === "bottom" ? "object-bottom"
                          : "object-top"
                        }`}
                        sizes="240px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(28,21,18,0.2)] group-hover:to-[rgba(28,21,18,0.08)] transition-all duration-300" />
                      {/* Zoom hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-lg">
                          ⊕
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {/* Fade edges on desktop */}
                {galleryItems.length > 4 && (
                  <div className="hidden lg:block absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-[#FDFBF7] to-transparent pointer-events-none" />
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <GoldDivider />

      {/* Values / Philosophy */}
      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <AnimatedSection className="text-center mb-14">
            <span className="tag mb-4 inline-block">
              {isRu ? "Моя философия" : isEn ? "My philosophy" : "Моя філософія"}
            </span>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-[#1C1512]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {isRu ? "Ценности моей практики" : isEn ? "Values of my practice" : "Цінності моєї практики"}
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <AnimatedSection key={i} delay={i * 0.12}>
                <div className="card-luxury h-full flex flex-col items-center text-center">
                  <div className="w-10 h-px bg-[#C4A97A] mb-6" />
                  <h3
                    className="text-2xl text-[#1C1512] mb-4"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    {val.title}
                  </h3>
                  <p className="text-[#7A6A58] text-sm leading-relaxed">{val.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
