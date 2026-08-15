// ─────────────────────────────────────────────────────────────────────────────
// Multilingual Digits & Date/Time Formatter
// Converts Western digits (0-9) to Eastern Arabic (٠-٩) or Urdu (۰-۹)
// ─────────────────────────────────────────────────────────────────────────────

import { LanguageCode } from './index';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const URDU_DIGITS   = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts a number or numeric string to localized Eastern Arabic / Urdu digits
 */
export function toLocalizedDigits(val: number | string, lang: LanguageCode = 'en'): string {
  const str = String(val);
  if (lang === 'en') return str;

  const targetDigits = lang === 'ar' ? ARABIC_DIGITS : URDU_DIGITS;

  return str.replace(/\d/g, (d) => targetDigits[parseInt(d, 10)] ?? d);
}

/**
 * Formats a timestamp into localized time string
 */
export function formatLocalizedTime(date: Date | string | number, lang: LanguageCode = 'en'): string {
  const d = typeof date === 'object' ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = lang === 'ar' ? 'ar-SA' : lang === 'ur' ? 'ur-PK' : 'en-GB';

  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a date into localized date string
 */
export function formatLocalizedDate(date: Date | string | number, lang: LanguageCode = 'en'): string {
  const d = typeof date === 'object' ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const locale = lang === 'ar' ? 'ar-SA' : lang === 'ur' ? 'ur-PK' : 'en-GB';

  return d.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
