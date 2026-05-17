'use client';

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from '@/hooks/useLanguage';

export default function ServicesPage() {
  const { t, language } = useLanguage();

  const services = language === 'ru' ? [
    {
      id: "question",
      title: "Один вопрос",
      subtitle: "Подробный разбор",
      price: "$20",
      description: "Детальный анализ одного волнующего вопроса через призму карт таро.",
      includes: [
        "Глубокий анализ одного вопроса",
        "Интерпретация карт",
        "Практические рекомендации",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "relationship-lite",
      title: "Расклад на отношения lite",
      subtitle: "2 вопроса",
      price: "$30",
      description: "Расклад для прояснения ситуации в отношениях — два ключевых вопроса.",
      includes: [
        "Анализ двух вопросов об отношениях",
        "Динамика между партнёрами",
        "Советы по улучшению ситуации",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "relationship",
      title: "Расклад на отношения",
      subtitle: "4 вопроса",
      price: "$50",
      description: "Полный анализ отношений: прошлое, настоящее, будущее и скрытые мотивы.",
      includes: [
        "Четыре вопроса об отношениях",
        "Анализ прошлого и настоящего",
        "Прогноз развития отношений",
        "Скрытые энергии и мотивы партнёра",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "triangle",
      title: "Расклад Треугольник",
      subtitle: "6 вопросов",
      price: "$60",
      description: "Комплексный расклад для глубокого понимания ситуации с треугольником отношений.",
      includes: [
        "Шесть вопросов для полного понимания",
        "Анализ всех сторон ситуации",
        "Энергия каждого участника",
        "Возможные пути развития",
        "Рекомендации и советы",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "amor",
      title: "Расклад Амур",
      subtitle: "6 вопросов",
      price: "$60",
      description: "Специализированный расклад на любовь и отношения — шесть ключевых аспектов.",
      includes: [
        "Шесть вопросов о любви",
        "Чувства и намерения партнёра",
        "Препятствия и ресурсы",
        "Перспективы отношений",
        "Советы от карт",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "month",
      title: "Прогноз на месяц",
      subtitle: "Комплексный анализ",
      price: "$65",
      description: "Разбор по основным сферам жизни, совет, сюрприз и главная энергия месяца.",
      includes: [
        "Главная тема и энергия месяца",
        "Разбор по ключевым сферам жизни",
        "Совет от карт на месяц",
        "Сюрприз месяца",
        "Ответ в формате аудио/видео в течение 24 часов",
      ],
    },
    {
      id: "session",
      title: "Онлайн таро сессия",
      subtitle: "1 час в прямом эфире",
      price: "$100",
      description: "В течение часа можете задать любое количество вопросов на разные сферы жизни. Общение, после которого становится легче и обретается внутреннее спокойствие. Длительность: 1 час в формате видеозвонка (WhatsApp, Telegram).",
      includes: [
        "Неограниченное количество вопросов в течение часа",
        "Живое общение в формате видеозвонка",
        "WhatsApp или Telegram",
        "Ответы на любые темы",
        "Практические рекомендации",
      ],
    },
  ] : [
    {
      id: "question",
      title: "Одне питання",
      subtitle: "Детальний розбір",
      price: "$20",
      description: "Детальний аналіз одного хвилюючого питання через призму карт таро.",
      includes: [
        "Глибокий аналіз одного питання",
        "Інтерпретація карт",
        "Практичні рекомендації",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "relationship-lite",
      title: "Розклад на відносини lite",
      subtitle: "2 питання",
      price: "$30",
      description: "Розклад для прояснення ситуації у відносинах — два ключових питання.",
      includes: [
        "Аналіз двох питань про відносини",
        "Динаміка між партнерами",
        "Поради щодо покращення ситуації",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "relationship",
      title: "Розклад на відносини",
      subtitle: "4 питання",
      price: "$50",
      description: "Повний аналіз відносин: минуле, теперішнє, майбутнє та приховані мотиви.",
      includes: [
        "Чотири питання про відносини",
        "Аналіз минулого та теперішнього",
        "Прогноз розвитку відносин",
        "Приховані енергії та мотиви партнера",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "triangle",
      title: "Розклад Трикутник",
      subtitle: "6 питань",
      price: "$60",
      description: "Комплексний розклад для глибокого розуміння ситуації з трикутником відносин.",
      includes: [
        "Шість питань для повного розуміння",
        "Аналіз усіх сторін ситуації",
        "Енергія кожного учасника",
        "Можливі шляхи розвитку",
        "Рекомендації та поради",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "amor",
      title: "Розклад Амур",
      subtitle: "6 питань",
      price: "$60",
      description: "Спеціалізований розклад на кохання та відносини — шість ключових аспектів.",
      includes: [
        "Шість питань про кохання",
        "Почуття та наміри партнера",
        "Перешкоди та ресурси",
        "Перспективи відносин",
        "Поради від карт",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "month",
      title: "Прогноз на місяць",
      subtitle: "Комплексний аналіз",
      price: "$65",
      description: "Розбір по основних сферах життя, порада, сюрприз та головна енергія місяця.",
      includes: [
        "Головна тема та енергія місяця",
        "Розбір по ключових сферах життя",
        "Порада від карт на місяць",
        "Сюрприз місяця",
        "Відповідь у форматі аудіо/відео протягом 24 годин",
      ],
    },
    {
      id: "session",
      title: "Онлайн таро сесія",
      subtitle: "1 година наживо",
      price: "$100",
      description: "Протягом години можете ставити будь-яку кількість питань на різні сфери життя. Спілкування, після якого стає легше та знаходиться внутрішній спокій. Тривалість: 1 година у форматі відеодзвінка (WhatsApp, Telegram).",
      includes: [
        "Необмежена кількість питань протягом години",
        "Живе спілкування у форматі відеодзвінка",
        "WhatsApp або Telegram",
        "Відповіді на будь-які теми",
        "Практичні рекомендації",
      ],
    },
  ];

  const paymentInfo = language === 'ru'
    ? [
        "Оплата: 100% предоплата перед консультацией (карта, PayPal, Binance).",
        "Продление консультации: если онлайн-консультация превышает 60 минут, каждые следующие 10 минут оплачиваются отдельно — $20.",
        "Формат консультаций: аудио/видео файл. Ответы на запросы предоставляются в течение 24 часов. За срочный ответ в течение часа — дополнительная плата в размере 50% стоимости расклада.",
      ]
    : [
        "Оплата: 100% передоплата перед консультацією (картка, PayPal, Binance).",
        "Продовження консультації: якщо онлайн-консультація перевищує 60 хвилин, кожні наступні 10 хвилин оплачуються окремо — $20.",
        "Формат консультацій: аудіо/відео файл. Відповіді на запити надаються протягом 24 годин. За терміновий ответ протягом години — додаткова плата у розмірі 50% вартості розкладу.",
      ];

  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {language === 'ru' ? 'Услуги и цены' : 'Послуги та ціни'}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {language === 'ru' ? 'Что я предлагаю' : 'Що я пропоную'}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {language === 'ru'
                ? 'Каждая сессия — это уникальное пространство для вас. Без шаблонов, без спешки.'
                : 'Кожна сесія — це унікальний простір для вас. Без шаблонів, без поспіху.'}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      {/* Services */}
      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
          {services.map((svc, i) => (
            <AnimatedSection key={svc.id} delay={i * 0.06}>
              <div id={svc.id} className="card-luxury scroll-mt-28">
                <div className="grid lg:grid-cols-3 gap-10">
                  {/* Info */}
                  <div className="lg:col-span-2">
                    <p className="text-xs text-[#C4A97A] tracking-[0.15em] uppercase mb-1"
                      style={{ fontFamily: "var(--font-jost)" }}>
                      {svc.subtitle}
                    </p>
                    <h2
                      className="text-3xl lg:text-4xl text-[#1C1512] mb-5"
                      style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                    >
                      {svc.title}
                    </h2>
                    <p className="text-[#7A6A58] leading-relaxed mb-6">{svc.description}</p>
                    <ul className="space-y-3">
                      {svc.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-[#5C4530]">
                          <Check size={16} className="text-[#B8883A] mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#7A6A58] tracking-widest uppercase mb-2">
                        {language === 'ru' ? 'Стоимость' : 'Вартість'}
                      </p>
                      <p
                        className="text-5xl text-[#B8883A] mb-1"
                        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
                      >
                        {svc.price}
                      </p>
                      <div className="h-px bg-[rgba(196,169,122,0.3)] my-6" />
                    </div>
                    <Link href="/contacts" className="btn-primary text-center">
                      {language === 'ru' ? 'Записаться' : 'Записатись'}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <GoldDivider />

      {/* Payment info */}
      <section className="section-padding bg-[#F2EBD9]">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection className="text-center mb-10">
            <h2
              className="text-[clamp(1.8rem,3vw,2.5rem)] text-[#1C1512]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {language === 'ru' ? 'Организационные вопросы' : 'Організаційні питання'}
            </h2>
          </AnimatedSection>
          <div className="space-y-4">
            {paymentInfo.map((info, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="card-luxury">
                  <p className="text-[#5C4530] leading-relaxed text-sm">{info}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#2D2218] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(196,169,122,0.07),transparent)]" />
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2
              className="text-[clamp(2rem,4vw,3.5rem)] text-white mb-6"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              {language === 'ru' ? 'Готовы записаться?' : 'Готова записатись?'}
            </h2>
            <p className="text-white/50 mb-10 max-w-md mx-auto">
              {language === 'ru'
                ? 'Напишите мне в Telegram — и мы подберём удобное время для вашей сессии.'
                : 'Напишіть мені у Telegram — і ми підберемо зручний час для вашої сесії.'}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="https://t.me/ellen_soul" target="_blank" rel="noopener noreferrer" className="btn-primary">
                Telegram
              </a>
              <Link href="/contacts" className="btn-outline !border-white/30 !text-white hover:!border-[#D4A853] hover:!text-[#D4A853]">
                {language === 'ru' ? 'Форма запроса' : 'Форма запиту'}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
