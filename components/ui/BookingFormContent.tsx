'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  /** Pre-fill the topic dropdown (e.g. from services page) */
  defaultTopic?: string;
  /** Called after successful submission */
  onSuccess?: () => void;
}

/**
 * Shared booking form.
 * Used in: BookingModal, contacts page.
 */
export default function BookingFormContent({ defaultTopic, onSuccess }: Props) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  const TOPICS_FALLBACK = isRu
    ? ['Один вопрос', 'Расклад Амур', 'Онлайн таро сессия', 'Личный запрос']
    : isEn
    ? ['One Question', 'Amour Spread', 'Online Tarot Session', 'Personal Request']
    : ['Одне питання', 'Розклад Амур', 'Онлайн таро сесія', 'Особистий запит'];

  const [dynamicTopics, setDynamicTopics] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/content')
      .then(r => r.json())
      .then(data => {
        if (data.services?.length) {
          const titles = data.services.map(
            (s: { title_ru: string; title_uk: string; title_en?: string }) =>
              isRu ? s.title_ru : isEn ? (s.title_en ?? s.title_uk) : s.title_uk
          );
          setDynamicTopics([
            ...titles,
            isRu ? 'Личный запрос' : isEn ? 'Personal Request' : 'Особистий запит',
          ]);
        }
      })
      .catch(() => {});
  }, [isRu, isEn]);

  const topics = dynamicTopics.length ? dynamicTopics : TOPICS_FALLBACK;

  const [form, setForm] = useState({
    name: '',
    contact: '',
    topic: defaultTopic ?? '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync topic when topics list loads or defaultTopic changes
  useEffect(() => {
    if (defaultTopic) {
      setForm(f => ({ ...f, topic: defaultTopic }));
    } else if (topics.length && !form.topic) {
      setForm(f => ({ ...f, topic: topics[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTopic, topics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, language }),
      });
    } catch {
      // still show success to user
    }
    setLoading(false);
    setSubmitted(true);
    onSuccess?.();
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <CheckCircle size={48} className="text-[#B8883A] mb-4" />
        <h3
          className="text-2xl text-[#1C1512] mb-3"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500 }}
        >
          {isRu ? 'Спасибо!' : isEn ? 'Thank you!' : 'Дякую!'}
        </h3>
        <p className="text-[#7A6A58] text-sm">
          {isRu
            ? 'Я получила ваше сообщение и свяжусь в течение 24 часов.'
            : isEn
            ? 'I received your message and will get back to you within 24 hours.'
            : "Я отримала ваше повідомлення і зв'яжуся протягом 24 годин."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Ваше имя' : isEn ? 'Your name' : "Ваше ім'я"} *
        </label>
        <input
          type="text"
          required
          placeholder="Ellen Soul"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="input-luxury w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          Telegram, WhatsApp {isRu ? 'или' : isEn ? 'or' : 'або'} Instagram *
        </label>
        <input
          type="text"
          required
          placeholder={
            isRu
              ? '@username или номер телефона'
              : isEn
              ? '@username or phone number'
              : '@username або номер телефону'
          }
          value={form.contact}
          onChange={e => setForm({ ...form, contact: e.target.value })}
          className="input-luxury w-full"
        />
      </div>

      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Тема запроса' : isEn ? 'Topic' : 'Тема запиту'}
        </label>
        <select
          value={form.topic}
          required
          onChange={e => setForm({ ...form, topic: e.target.value })}
          className="input-luxury w-full"
        >
          {topics.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Сообщение (необязательно)' : isEn ? 'Message (optional)' : "Повідомлення (необов'язково)"}
        </label>
        <textarea
          rows={4}
          placeholder={
            isRu
              ? 'Кратко опишите ситуацию...'
              : isEn
              ? 'Briefly describe your situation...'
              : 'Коротко опишіть ситуацію...'
          }
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          className="input-luxury w-full resize-none"
        />
      </div>

      <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            {isRu ? 'Отправляем...' : isEn ? 'Sending...' : 'Відправляємо...'}
          </span>
        ) : (
          <>
            <Send size={16} />
            {isRu ? 'Отправить заявку' : isEn ? 'Send Request' : 'Відправити заявку'}
          </>
        )}
      </button>

      <p className="text-xs text-[#7A6A58] text-center">
        {isRu
          ? 'Отправляя форму, вы соглашаетесь на обработку данных.'
          : isEn
          ? 'By submitting the form, you agree to data processing.'
          : 'Надсилаючи форму, ви погоджуєтесь на обробку даних.'}
      </p>
    </form>
  );
}
