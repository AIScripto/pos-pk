import { en, TranslationKey } from './en';

export type LanguageCode = 'en' | 'ur';

// Currently active locale (English default)
let currentLocale: LanguageCode = 'en';

export function getLocale(): LanguageCode {
  return currentLocale;
}

export function setLocale(locale: LanguageCode): void {
  currentLocale = locale;
}

/**
 * Lightweight, zero-overhead typed translation helper.
 * Ready for future multilingual (Urdu/Arabic) expansion.
 */
export function useTranslation() {
  const t = en;
  return { t, locale: currentLocale };
}
