// ─────────────────────────────────────────────────────────────────────────────
// Multi-Lingual Architecture (English, Arabic, Urdu)
// Fully reactive with automatic Right-to-Left (RTL) document direction support
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { en, TranslationKey } from './en';
import { ar } from './ar';
import { ur } from './ur';

export type LanguageCode = 'en' | 'ar' | 'ur';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir: 'ltr' | 'rtl';
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabic',  nativeLabel: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  { code: 'ur', label: 'Urdu',    nativeLabel: 'اردو',    dir: 'rtl', flag: '🇵🇰' },
];

const DICTIONARIES: Record<LanguageCode, TranslationKey> = {
  en,
  ar,
  ur,
};

interface LanguageContextValue {
  language: LanguageCode;
  direction: 'ltr' | 'rtl';
  t: TranslationKey;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'pos_app_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && (saved === 'en' || saved === 'ar' || saved === 'ur')) {
        return saved;
      }
    }
    return 'en';
  });

  const activeLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];
  const direction = activeLangOption.dir;

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
      document.documentElement.setAttribute('dir', direction);
    }
  }, [language, direction]);

  const value: LanguageContextValue = {
    language,
    direction,
    t: DICTIONARIES[language] ?? en,
    setLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access current translations and language state
 */
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      t: en,
      language: 'en' as LanguageCode,
      direction: 'ltr' as const,
      setLanguage: () => {},
      availableLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
