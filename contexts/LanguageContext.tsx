'use client';

import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { type Language, getTranslation } from '@/lib/i18n/translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const LOCALES: Language[] = ['uk', 'ru', 'en'];

function getLangFromPath(pathname: string): Language {
  const seg = pathname.split('/')[1] as Language;
  return LOCALES.includes(seg) ? seg : 'uk';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  // useParams() is more reliable during client-side navigation than parsing pathname
  const language: Language = (() => {
    const p = params?.lang;
    if (typeof p === 'string' && LOCALES.includes(p as Language)) return p as Language;
    return getLangFromPath(pathname);
  })();

  const setLanguage = useCallback((lang: Language) => {
    // Replace current lang segment in path
    const segments = pathname.split('/');
    if (LOCALES.includes(segments[1] as Language)) {
      segments[1] = lang;
    } else {
      segments.splice(1, 0, lang);
    }
    const newPath = segments.join('/') || '/';
    // Set cookie so middleware remembers preference
    document.cookie = `NEXT_LOCALE=${lang};path=/;max-age=${60*60*24*365}`;
    router.push(newPath);
  }, [pathname, router]);

  const t = useCallback(
    (key: string): string => getTranslation(language, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguageContext must be used inside <LanguageProvider>');
  return ctx;
}
