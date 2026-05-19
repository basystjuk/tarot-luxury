'use client';

import { useLanguage } from '@/hooks/useLanguage';

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

export default function Footer() {
  const { t, language } = useLanguage();
  const isRu = language === 'ru';
  const isEn = language === 'en';

  return (
    <footer className="bg-[#1C1512] text-white/70">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C4A97A] to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="flex flex-col items-center text-center mb-14">
          {/* Brand */}
          <div className="mb-4">
            <span
              className="text-3xl text-white tracking-wide block mb-1"
              style={{ fontFamily: "var(--font-cormorant, 'Cormorant Garamond')", fontWeight: 300 }}
            >
              Ellen Soul
            </span>
            <span
              className="text-xs tracking-[0.18em] uppercase text-[#C4A97A]"
              style={{ fontFamily: "var(--font-jost, 'Jost')" }}
            >
              таро · психологія
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/50 mb-8 max-w-xs">
            {isRu
              ? "Помогаю найти ответы через язык карт и глубинную психологию."
              : isEn
              ? "I help find answers through the language of cards and depth psychology."
              : "Допомагаю знайти відповіді через мову карт і глибинну психологію."}
          </p>

          {/* Socials */}
          <div className="flex gap-4 justify-center">
            <a
              href="https://instagram.com/ellen_soul_taro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#D4A853] hover:border-[#D4A853] transition-all duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.tiktok.com/@ellen_soul_taro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#D4A853] hover:border-[#D4A853] transition-all duration-300"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
            <a
              href="https://t.me/ellen_soul_taro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-[#D4A853] hover:border-[#D4A853] transition-all duration-300"
              aria-label="Telegram"
            >
              <TelegramIcon />
            </a>
          </div>
        </div>

        <div className="h-px bg-white/8 mb-8" />

        <div className="flex flex-col items-center gap-3 text-xs text-white/30 text-center">
          <p>© {new Date().getFullYear()} Ellen Soul. Усі права захищено.</p>
          <p>Made with 💙💛 Ukraine</p>
        </div>
      </div>
    </footer>
  );
}
