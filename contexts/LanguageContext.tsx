'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { type Language, getTranslation } from '@/lib/i18n/translations';

const STORAGE_KEY = 'ellensoul-lang';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'ru';
  const lang = navigator.language?.toLowerCase() ?? '';
  if (lang.startsWith('uk')) return 'uk';
  if (lang.startsWith('ru')) return 'ru';
  return 'ru'; // default fallback
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage first, otherwise detect from browser
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && ['uk', 'ru', 'en'].includes(stored)) {
      setLanguageState(stored);
    } else {
      setLanguageState(detectBrowserLanguage());
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string): string => getTranslation(language, key),
    [language]
  );

  // During SSR / before mount, render with default language to avoid mismatch
  const value: LanguageContextValue = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used inside <LanguageProvider>');
  }
  return ctx;
}
