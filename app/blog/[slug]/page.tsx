import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, ArrowLeft } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";

const posts: Record<
  string,
  {
    title: string;
    category: string;
    date: string;
    readTime: string;
    content: string;
  }
> = {
  "znaky-karti-vidnosyny": {
    title: "Що карти кажуть про ваші стосунки: 5 знаків",
    category: "Таро",
    date: "12 травня 2025",
    readTime: "7 хв",
    content: `
Таро — це мова образів, і коли ми запитуємо про стосунки, карти рідко брешуть. Проблема в іншому: ми часто чуємо те, що хочемо почути, а не те, що насправді говорить розклад.

## 5 карт, які чесно кажуть про стан ваших відносин

### 1. Місяць (XVIII аркан)

Коли Місяць з'являється у позиції "поточна динаміка", це майже завжди знак ілюзій. Хтось із вас (або обоє) бачить ситуацію не такою, якою вона є. Це не вирок — це запрошення до чесності.

### 2. Десятка Мечів

Болюча карта. Але її поява не означає кінець — вона означає, що цикл завершено. Якщо вона з'являється знову і знову у ваших розкладах про одну й ту саму людину — ваша психіка вже знає відповідь.

### 3. П'ятірка Кубків

Зосередженість на втраті і небачення того, що залишилось. Ця карта питає: "Ви справді дивитесь на ситуацію повністю, чи лише на те, що болить?"

### 4. Сила (VIII або XI аркан)

Одна з найкращих карт у розкладах про стосунки. Вона говорить про внутрішню силу, терпіння та здатність приборкати не партнера, а власні реакції. Коли вона з'являється — ви на вірному шляху.

### 5. Туз Кубків

Новий початок у сфері почуттів. Якщо ви питаєте про нові стосунки — це зелене світло. Якщо про існуючі — момент для емоційного оновлення та відвертості.

## Що робити з цією інформацією?

Карти — не вирок і не наказ. Вони показують те, що вже є у вашому полі. Наступний крок завжди за вами.

Якщо ви бачите складні карти знову і знову — це запрошення поглянути чесніше. Не для того, щоб злякатись, а щоб нарешті рухатись уперед.
    `.trim(),
  },
  "taro-zakohanykh-arkan": {
    title: "Таро Закоханих — глибокий розбір аркану",
    category: "Таро",
    date: "28 квітня 2025",
    readTime: "10 хв",
    content: `
Шостий аркан Таро — один із найбільш неправильно розтлумачених у всій колоді. Більшість людей бачать Закоханих і думають: "Це про кохання!" Але традиційна символіка розказує дещо складнішу історію.

## Символіка карти

На класичному Райдер-Уейті зображені чоловік та жінка під благословенням ангела. Але подивіться уважніше: жінка дивиться на ангела, чоловік — на жінку. Це ієрархія уваги і вибору.

## Справжнє значення

Закохані — це карта **вибору**. Не лише між двома людьми, але між двома цінностями, двома шляхами, двома версіями себе.

### Коли карта з'являється у позиції поради:
Вам пропонують зробити вибір серцем, а не розумом. Але серце — це не про емоцію моменту. Це про ваші найглибші цінності.

### Коли вона з'являється перевернутою:
Розрив зв'язку з власними цінностями. Ви можете перебувати у стосунках, які суперечать тому, ким ви насправді є.

## Психологічний кут

З погляду аналітичної психології, Закохані — це зустріч з анімою або анімусом. Та людина, яка притягує нас, часто відображає нашу власну невизнану частину.

Що вас так приваблює в партнері? Це питання варте дослідження не менше, ніж будь-який розклад.
    `.trim(),
  },
};

const relatedPosts = [
  { slug: "pytannya-taro-pro-lyubov", title: "7 питань до таро про любов, які реально працюють" },
  { slug: "koly-vidpustyty", title: "Коли відпустити: коли карти кажуть «досить»" },
];

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  return {
    title: post ? `${post.title} | Ellen Soul Таро` : "Стаття | Ellen Soul Таро",
    description: post ? `${post.title} — читайте у блозі Олени.` : "",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-4xl text-[#1C1512] mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
            Статтю не знайдено
          </h1>
          <Link href="/blog" className="btn-outline">
            До блогу
          </Link>
        </div>
      </div>
    );
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7]">
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSection>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#7A6A58] hover:text-[#B8883A] transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              До блогу
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="tag">{post.category}</span>
              <span className="flex items-center gap-1.5 text-sm text-[#7A6A58]">
                <Clock size={13} className="text-[#C4A97A]" />
                {post.readTime}
              </span>
              <span className="text-sm text-[#7A6A58]">{post.date}</span>
            </div>
            <h1
              className="text-[clamp(2rem,5vw,4rem)] text-[#1C1512] mb-8 leading-[1.1]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {post.title}
            </h1>
          </AnimatedSection>

          {/* Decorative image */}
          <AnimatedSection delay={0.1}>
            <div className="w-full h-56 rounded-2xl bg-gradient-to-br from-[#E8DCC5] via-[#D4B88A] to-[#C4A97A] mb-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(28,21,18,0.2)]" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_320px] gap-16">
            {/* Content */}
            <AnimatedSection>
              <article className="prose-luxury">
                {paragraphs.map((para, i) => {
                  if (para.startsWith("## ")) {
                    return (
                      <h2 key={i} style={{ fontFamily: "var(--font-cormorant)" }}>
                        {para.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (para.startsWith("### ")) {
                    return (
                      <h3 key={i} style={{ fontFamily: "var(--font-cormorant)" }}>
                        {para.replace("### ", "")}
                      </h3>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </article>
            </AnimatedSection>

            {/* Sidebar */}
            <AnimatedSection delay={0.15} direction="left">
              <div className="lg:sticky lg:top-28 space-y-6">
                {/* Author */}
                <div className="card-luxury">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E8C98A] to-[#C4A97A] flex items-center justify-center">
                      <span
                        className="text-2xl text-white"
                        style={{ fontFamily: "var(--font-cormorant)" }}
                      >
                        О
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#1C1512]">Ellen Soul</p>
                      <p className="text-xs text-[#7A6A58]">Таро-консультант</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#7A6A58] leading-relaxed mb-4">
                    Сертифікований консультант з 4-річним досвідом роботи в темах кохання та відносин.
                  </p>
                  <Link href="/about" className="text-sm text-[#B8883A] hover:underline">
                    Про мене →
                  </Link>
                </div>

                {/* CTA */}
                <div className="card-luxury bg-gradient-to-br from-[#2D2218] to-[#1C1512] !border-[rgba(196,169,122,0.2)]">
                  <p
                    className="text-2xl text-white mb-3"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                  >
                    Є питання?
                  </p>
                  <p className="text-white/60 text-sm mb-5">
                    Запишіться на особисту консультацію та отримайте відповідь саме для вашої ситуації.
                  </p>
                  <Link href="/contacts" className="btn-primary w-full justify-center">
                    Записатись
                    <ArrowRight size={15} />
                  </Link>
                </div>

                {/* Related */}
                <div className="card-luxury">
                  <h3
                    className="text-xl text-[#1C1512] mb-5"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                  >
                    Читайте також
                  </h3>
                  <ul className="space-y-4">
                    {relatedPosts.map((rel) => (
                      <li key={rel.slug}>
                        <Link
                          href={`/blog/${rel.slug}`}
                          className="text-sm text-[#5C4530] hover:text-[#B8883A] transition-colors leading-snug flex items-start gap-2 group"
                        >
                          <ArrowRight size={12} className="mt-1 text-[#C4A97A] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                          {rel.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}

export function generateStaticParams() {
  return [
    { slug: "znaky-karti-vidnosyny" },
    { slug: "taro-zakohanykh-arkan" },
    { slug: "chy-vartyi-vin-vashykh-slez" },
    { slug: "misyats-emotsiyi-astrolohiya" },
    { slug: "pytannya-taro-pro-lyubov" },
    { slug: "koly-vidpustyty" },
  ];
}
