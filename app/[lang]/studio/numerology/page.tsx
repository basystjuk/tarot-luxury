"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import GoldDivider from "@/components/ui/GoldDivider";
import { useLanguage } from "@/hooks/useLanguage";

interface NumerologyResult {
  lifePath: number;
  destinyNumber: number;
  lifePathMeaning: string;
  destinyMeaning: string;
  lifePathKeyword: string;
  destinyKeyword: string;
}

type MeaningMap = Record<number, { keyword: string; meaning: string }>;

const MEANINGS_UK: MeaningMap = {
  1: { keyword: "Лідер", meaning: "Ваш шлях — бути піонером та новатором. Ви народжені для того, щоб прокладати нові стежки та надихати інших своїм прикладом." },
  2: { keyword: "Дипломат", meaning: "Ваша сила — у тонкому відчутті людей та вмінні знаходити баланс. Ви — природний миротворець та майстер партнерства." },
  3: { keyword: "Творець", meaning: "Ви принесли у цей світ дар творчості та комунікації. Ваше покликання — виражати себе та надихати красою." },
  4: { keyword: "Будівельник", meaning: "Ваш шлях пов'язаний зі створенням стійких основ. Дисципліна, надійність та практичність — ваші найбільші ресурси." },
  5: { keyword: "Дослідник", meaning: "Свобода та різноманітність — ваші ключові потреби. Ви народжені для подорожей, досліджень та постійних змін." },
  6: { keyword: "Вихователь", meaning: "Ваше серце відкрите для турботи про інших. Дім, сім'я та служіння — ключові теми вашого шляху." },
  7: { keyword: "Мудрець", meaning: "Ви несете в собі глибоку духовну мудрість. Ваш шлях — пізнання, аналіз та пошук внутрішньої істини." },
  8: { keyword: "Реалізатор", meaning: "Матеріальний успіх та влада — ваше поле для зростання. Ви вчитесь використовувати силу з мудрістю та відповідальністю." },
  9: { keyword: "Гуманіст", meaning: "Ваша місія — служіння людству та прояв безумовної любові. Ви завершуєте великі цикли та допомагаєте іншим трансформуватись." },
  11: { keyword: "Ясновидець", meaning: "Майстер-число 11 наділяє вас надзвичайною інтуїцією та духовною чутливістю. Ваше покликання — осяяти світ внутрішнім світлом." },
  22: { keyword: "Майстер-будівельник", meaning: "Майстер-число 22 дає вам здатність втілювати великі мрії у реальність. Ви можете будувати те, що змінює світ." },
  33: { keyword: "Майстер-вчитель", meaning: "Найвище майстер-число. Ваше покликання — безумовна любов та навчання інших шляху серця." },
};

const MEANINGS_RU: MeaningMap = {
  1: { keyword: "Лидер", meaning: "Ваш путь — быть пионером и новатором. Вы рождены прокладывать новые пути и вдохновлять других своим примером." },
  2: { keyword: "Дипломат", meaning: "Ваша сила — в тонком ощущении людей и умении находить баланс. Вы — природный миротворец и мастер партнёрства." },
  3: { keyword: "Творец", meaning: "Вы принесли в этот мир дар творчества и коммуникации. Ваше призвание — выражать себя и вдохновлять красотой." },
  4: { keyword: "Строитель", meaning: "Ваш путь связан с созданием прочных основ. Дисциплина, надёжность и практичность — ваши главные ресурсы." },
  5: { keyword: "Исследователь", meaning: "Свобода и разнообразие — ваши ключевые потребности. Вы рождены для путешествий, исследований и постоянных перемен." },
  6: { keyword: "Наставник", meaning: "Ваше сердце открыто для заботы о других. Дом, семья и служение — ключевые темы вашего пути." },
  7: { keyword: "Мудрец", meaning: "Вы несёте в себе глубокую духовную мудрость. Ваш путь — познание, анализ и поиск внутренней истины." },
  8: { keyword: "Реализатор", meaning: "Материальный успех и власть — ваше поле для роста. Вы учитесь использовать силу с мудростью и ответственностью." },
  9: { keyword: "Гуманист", meaning: "Ваша миссия — служение человечеству и проявление безусловной любви. Вы завершаете большие циклы и помогаете другим трансформироваться." },
  11: { keyword: "Ясновидящий", meaning: "Мастер-число 11 наделяет вас необычайной интуицией и духовной чувствительностью. Ваше призвание — озарить мир внутренним светом." },
  22: { keyword: "Мастер-строитель", meaning: "Мастер-число 22 даёт вам способность воплощать великие мечты в реальность. Вы можете строить то, что меняет мир." },
  33: { keyword: "Мастер-учитель", meaning: "Высшее мастер-число. Ваше призвание — безусловная любовь и обучение других пути сердца." },
};

const MEANINGS_EN: MeaningMap = {
  1: { keyword: "Leader", meaning: "Your path is to be a pioneer and innovator. You were born to blaze new trails and inspire others by your example." },
  2: { keyword: "Diplomat", meaning: "Your strength lies in your subtle understanding of people and your ability to find balance. You are a natural peacemaker and master of partnership." },
  3: { keyword: "Creator", meaning: "You brought the gift of creativity and communication into this world. Your calling is to express yourself and inspire others with beauty." },
  4: { keyword: "Builder", meaning: "Your path is connected with creating stable foundations. Discipline, reliability and practicality are your greatest resources." },
  5: { keyword: "Explorer", meaning: "Freedom and variety are your key needs. You were born for travel, discovery and constant change." },
  6: { keyword: "Nurturer", meaning: "Your heart is open to caring for others. Home, family and service are the central themes of your path." },
  7: { keyword: "Seeker", meaning: "You carry deep spiritual wisdom within you. Your path is one of knowledge, analysis and the search for inner truth." },
  8: { keyword: "Achiever", meaning: "Material success and authority are your field for growth. You are learning to use power with wisdom and responsibility." },
  9: { keyword: "Humanitarian", meaning: "Your mission is service to humanity and the expression of unconditional love. You complete great cycles and help others transform." },
  11: { keyword: "Visionary", meaning: "Master Number 11 endows you with extraordinary intuition and spiritual sensitivity. Your calling is to illuminate the world with inner light." },
  22: { keyword: "Master Builder", meaning: "Master Number 22 gives you the ability to bring great dreams into reality. You can build things that change the world." },
  33: { keyword: "Master Teacher", meaning: "The highest master number. Your calling is unconditional love and teaching others the way of the heart." },
};

// Letter values (Pythagorean adapted for UK/EN/RU)
const LETTER_VALUES: Record<string, number> = {
  // Ukrainian
  а: 1, б: 2, в: 3, г: 4, ґ: 5, д: 6, е: 7, є: 8, ж: 9,
  з: 1, и: 2, і: 3, ї: 4, й: 5, к: 6, л: 7, м: 8, н: 9,
  о: 1, п: 2, р: 3, с: 4, т: 5, у: 6, ф: 7, х: 8, ц: 9,
  ч: 1, ш: 2, щ: 3, ь: 4, ю: 5, я: 6,
  // Russian extras (й already covered above)
  ё: 7, ъ: 4, ы: 2, э: 5,
  // Latin
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

function reduceNum(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  return reduceNum(String(n).split("").reduce((a, d) => a + parseInt(d), 0));
}

function calcLifePath(day: number, month: number, year: number): number {
  const d = reduceNum(day);
  const m = reduceNum(month);
  const y = reduceNum(String(year).split("").reduce((a, c) => a + parseInt(c), 0));
  return reduceNum(d + m + y);
}

function calcDestiny(name: string): number {
  const val = name.toLowerCase().split("").reduce((sum, char) => sum + (LETTER_VALUES[char] || 0), 0);
  return reduceNum(val);
}

function calcNumerology(name: string, day: number, month: number, year: number, meanings: MeaningMap): NumerologyResult {
  const lifePath = calcLifePath(day, month, year);
  const destinyNumber = calcDestiny(name);
  const lpData = meanings[lifePath] || { keyword: "✦", meaning: "" };
  const dnData = meanings[destinyNumber] || { keyword: "✦", meaning: "" };

  return {
    lifePath,
    destinyNumber,
    lifePathKeyword: lpData.keyword,
    lifePathMeaning: lpData.meaning,
    destinyKeyword: dnData.keyword,
    destinyMeaning: dnData.meaning,
  };
}

function NumberCircle({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D4A853] to-[#9A6E28] flex items-center justify-center shadow-[0_8px_32px_rgba(180,140,60,0.3)] mb-3">
        <span className="text-4xl text-white" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
          {num}
        </span>
      </div>
      <p className="text-xs text-[#7A6A58] tracking-wide text-center max-w-[90px]">{label}</p>
    </div>
  );
}

export default function NumerologyPage() {
  const { language } = useLanguage();
  const isRu = language === "ru";
  const isEn = language === "en";

  const meanings = isRu ? MEANINGS_RU : isEn ? MEANINGS_EN : MEANINGS_UK;

  const [form, setForm] = useState({ name: "", day: "", month: "", year: "" });
  const [result, setResult] = useState<NumerologyResult | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.day || !form.month || !form.year) return;
    setResult(calcNumerology(form.name, parseInt(form.day), parseInt(form.month), parseInt(form.year), meanings));
  };

  return (
    <>
      <section className="pt-36 pb-16 bg-[#FDFBF7] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(196,169,122,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <AnimatedSection>
            <span className="tag mb-6 inline-block">
              {isRu ? "Нумерология" : isEn ? "Numerology" : "Нумерологія"}
            </span>
            <h1
              className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1C1512] mb-6 leading-[1.06]"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              {isRu ? "Числа вашей судьбы" : isEn ? "Your Destiny Numbers" : "Числа вашої долі"}
            </h1>
            <p className="text-xl text-[#7A6A58] leading-relaxed">
              {isRu
                ? "Рассчитайте число Жизненного Пути и число Судьбы по вашему имени и дате рождения."
                : isEn
                ? "Calculate your Life Path number and Destiny number by name and date of birth."
                : "Розрахуйте число Життєвого Шляху та число Долі за вашим ім'ям і датою народження."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <GoldDivider />

      <section className="section-padding bg-[#FDFBF7]">
        <div className="max-w-2xl mx-auto px-6">
          <AnimatedSection>
            <div className="card-luxury mb-8">
              <h2
                className="text-2xl text-[#1C1512] mb-8"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
              >
                {isRu ? "Введите данные" : isEn ? "Enter your details" : "Введіть дані"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                    {isRu ? "Полное имя (как в документах)" : isEn ? "Full name (as on birth certificate)" : "Повне ім'я (як у свідоцтві)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isRu ? "Имя Отчество Фамилия" : isEn ? "First Middle Last" : "Ім'я По-батькові Прізвище"}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-luxury"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "День" : isEn ? "Day" : "День"}
                    </label>
                    <input
                      type="number" min={1} max={31} required
                      placeholder="14"
                      value={form.day}
                      onChange={(e) => setForm({ ...form, day: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "Месяц" : isEn ? "Month" : "Місяць"}
                    </label>
                    <input
                      type="number" min={1} max={12} required
                      placeholder="3"
                      value={form.month}
                      onChange={(e) => setForm({ ...form, month: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
                      {isRu ? "Год" : isEn ? "Year" : "Рік"}
                    </label>
                    <input
                      type="number" min={1900} max={2025} required
                      placeholder="1990"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full">
                  <ArrowRight size={16} />
                  {isRu ? "Рассчитать числа судьбы" : isEn ? "Calculate Destiny Numbers" : "Розрахувати числа долі"}
                </button>
              </form>
            </div>
          </AnimatedSection>

          {result && (
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                <div className="card-luxury">
                  <div className="flex justify-center gap-16 py-4">
                    <NumberCircle
                      num={result.lifePath}
                      label={isRu ? "Число Жизненного Пути" : isEn ? "Life Path Number" : "Число Життєвого Шляху"}
                    />
                    <NumberCircle
                      num={result.destinyNumber}
                      label={isRu ? "Число Судьбы" : isEn ? "Destiny Number" : "Число Долі"}
                    />
                  </div>
                </div>

                <div className="card-luxury">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(212,168,83,0.15)] flex items-center justify-center">
                      <span className="text-[#D4A853] text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {result.lifePath}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#C4A97A] tracking-widest uppercase">
                        {isRu ? "Число Жизненного Пути" : isEn ? "Life Path Number" : "Число Життєвого Шляху"}
                      </p>
                      <p className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                        {result.lifePathKeyword}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#7A6A58] leading-relaxed">{result.lifePathMeaning}</p>
                </div>

                <div className="card-luxury">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[rgba(212,168,83,0.15)] flex items-center justify-center">
                      <span className="text-[#D4A853] text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {result.destinyNumber}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-[#C4A97A] tracking-widest uppercase">
                        {isRu ? "Число Судьбы" : isEn ? "Destiny Number" : "Число Долі"}
                      </p>
                      <p className="text-xl text-[#1C1512]" style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}>
                        {result.destinyKeyword}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#7A6A58] leading-relaxed">{result.destinyMeaning}</p>
                </div>

                <p className="text-xs text-[#7A6A58] text-center">
                  {isRu
                    ? "Это базовый нумерологический анализ. Для полного портрета обратитесь к консультанту."
                    : isEn
                    ? "This is a basic numerological analysis. For a full portrait, consult a professional."
                    : "Це базовий нумерологічний аналіз. Для повного портрету зверніться до консультанта."}
                </p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </>
  );
}
