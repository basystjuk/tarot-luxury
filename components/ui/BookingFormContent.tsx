'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

type ContactMethod = 'telegram' | 'whatsapp' | 'instagram';

interface Props {
  defaultTopic?: string;
  onSuccess?: () => void;
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────

/** Keep @ prefix; allow only latin letters, digits, dots, underscores, hyphens */
function handleUsernameChange(raw: string, setter: (v: string) => void) {
  const body = raw.startsWith('@') ? raw.slice(1) : raw;
  const clean = body.replace(/[^a-zA-Z0-9._\-]/g, '');
  setter('@' + clean);
}

/** Keep + prefix; allow only digits */
function handlePhoneChange(raw: string, setter: (v: string) => void) {
  const body = raw.startsWith('+') ? raw.slice(1) : raw;
  const digits = body.replace(/\D/g, '');
  setter('+' + digits);
}

/** Validate phone digits count (E.164: 7–15 digits) */
function phoneError(phone: string, isRu: boolean, isEn: boolean): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7)
    return isRu
      ? 'Введите минимум 7 цифр номера'
      : isEn
      ? 'Enter at least 7 digits'
      : 'Введіть мінімум 7 цифр номера';
  if (digits.length > 15)
    return isRu
      ? 'Номер слишком длинный (максимум 15 цифр)'
      : isEn
      ? 'Phone number too long (max 15 digits)'
      : 'Номер занадто довгий (максимум 15 цифр)';
  return null;
}

const isEmpty = (v: string) => v.length <= 1; // just @ or +

// ─────────────────────────────────────────────────────────────────────────────

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

  const [form, setForm] = useState({ name: '', topic: defaultTopic ?? '', message: '', currency: '' });

  // Contact fields – prefixes are always present
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [tgUsername, setTgUsername] = useState('@');
  const [tgPhone, setTgPhone]       = useState('+');
  const [waPhone, setWaPhone]       = useState('+');
  const [igHandle, setIgHandle]     = useState('@');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    if (defaultTopic) {
      setForm(f => ({ ...f, topic: defaultTopic }));
    } else if (topics.length && !form.topic) {
      setForm(f => ({ ...f, topic: topics[0] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTopic, topics]);

  // ── Build & validate contact ──────────────────────────────────────────────
  function buildContact(): string | null {
    setContactError('');

    if (contactMethod === 'telegram') {
      const hasUser  = !isEmpty(tgUsername);
      const hasPhone = !isEmpty(tgPhone);

      if (!hasUser && !hasPhone) {
        setContactError(
          isRu ? 'Введите @username или номер телефона'
          : isEn ? 'Enter @username or phone number'
          : 'Введіть @username або номер телефону'
        );
        return null;
      }

      if (hasPhone) {
        const err = phoneError(tgPhone, isRu, isEn);
        if (err) { setContactError(err); return null; }
      }

      if (hasUser && hasPhone) return `${tgUsername} / ${tgPhone}`;
      return hasUser ? tgUsername : tgPhone;
    }

    if (contactMethod === 'whatsapp') {
      if (isEmpty(waPhone)) {
        setContactError(
          isRu ? 'Введите номер телефона'
          : isEn ? 'Enter your phone number'
          : 'Введіть номер телефону'
        );
        return null;
      }
      const err = phoneError(waPhone, isRu, isEn);
      if (err) { setContactError(err); return null; }
      return waPhone;
    }

    // instagram
    if (isEmpty(igHandle)) {
      setContactError(
        isRu ? 'Введите @username'
        : isEn ? 'Enter your @username'
        : 'Введіть @username'
      );
      return null;
    }
    return igHandle;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contactValue = buildContact();
    if (!contactValue) return;

    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          contactType: contactMethod,
          contact: contactValue,
          topic: form.topic,
          message: form.message,
          currency: form.currency,
          language,
        }),
      });
    } catch { /* show success anyway */ }
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

  const btnBase    = 'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border';
  const btnActive  = 'bg-[#B8883A] text-white border-[#B8883A]';
  const btnInactive = 'bg-transparent text-[#7A6A58] border-[rgba(196,169,122,0.4)] hover:border-[#B8883A] hover:text-[#B8883A]';

  const switchMethod = (m: ContactMethod) => {
    setContactMethod(m);
    setContactError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Ваше имя' : isEn ? 'Your name' : "Ваше ім'я"}
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

      {/* Contact */}
      <div>
        <label className="block text-xs text-[#7A6A58] mb-3 tracking-wide">
          {isRu ? 'Ваш контакт' : isEn ? 'Your contact' : 'Ваш контакт'}
        </label>

        {/* Method buttons */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {(['telegram', 'whatsapp', 'instagram'] as ContactMethod[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMethod(m)}
              className={`${btnBase} ${contactMethod === m ? btnActive : btnInactive}`}
            >
              {m === 'telegram' && <TelegramIcon />}
              {m === 'whatsapp' && <WhatsAppIcon />}
              {m === 'instagram' && <InstagramIcon />}
              {m === 'telegram' ? 'Telegram' : m === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
            </button>
          ))}
        </div>

        {/* Telegram: @username OR +phone */}
        {contactMethod === 'telegram' && (
          <div className="space-y-2">
            <input
              type="text"
              inputMode="text"
              placeholder="@username"
              value={tgUsername}
              onChange={e => handleUsernameChange(e.target.value, setTgUsername)}
              className="input-luxury w-full"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[rgba(196,169,122,0.25)]" />
              <span className="text-xs text-[#B8883A] px-1">
                {isRu ? 'или' : isEn ? 'or' : 'або'}
              </span>
              <div className="flex-1 h-px bg-[rgba(196,169,122,0.25)]" />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="+380..."
              value={tgPhone}
              onChange={e => handlePhoneChange(e.target.value, setTgPhone)}
              className="input-luxury w-full"
            />
          </div>
        )}

        {/* WhatsApp: +phone only */}
        {contactMethod === 'whatsapp' && (
          <input
            type="tel"
            inputMode="numeric"
            placeholder="+380..."
            value={waPhone}
            onChange={e => handlePhoneChange(e.target.value, setWaPhone)}
            className="input-luxury w-full"
          />
        )}

        {/* Instagram: @handle only */}
        {contactMethod === 'instagram' && (
          <input
            type="text"
            inputMode="text"
            placeholder="@username"
            value={igHandle}
            onChange={e => handleUsernameChange(e.target.value, setIgHandle)}
            className="input-luxury w-full"
          />
        )}

        {contactError && (
          <p className="text-xs text-red-500 mt-2">{contactError}</p>
        )}
      </div>

      {/* Topic */}
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

      {/* Currency */}
      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Валюта оплаты' : isEn ? 'Payment currency' : 'Валюта оплати'} *
        </label>
        <input
          type="text"
          required
          placeholder={isRu ? 'Карта, PayPal, Binance...' : isEn ? 'Card, PayPal, Binance...' : 'Картка, PayPal, Binance...'}
          value={form.currency}
          onChange={e => setForm({ ...form, currency: e.target.value })}
          className="input-luxury w-full"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs text-[#7A6A58] mb-2 tracking-wide">
          {isRu ? 'Сообщение (необязательно)' : isEn ? 'Message (optional)' : "Повідомлення (необов'язково)"}
        </label>
        <textarea
          rows={4}
          placeholder={
            isRu ? 'Кратко опишите ситуацию...'
            : isEn ? 'Briefly describe your situation...'
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
