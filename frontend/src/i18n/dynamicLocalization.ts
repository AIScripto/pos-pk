// ─────────────────────────────────────────────────────────────────────────────
// Dynamic Multilingual Entity Translation Engine
// Resolves localized strings from dynamic DB/API payloads (JSONB or dictionary objects)
// with automatic fallback to English or the raw string.
// ─────────────────────────────────────────────────────────────────────────────

import { LanguageCode } from './index';

export type LocalizedField = string | Partial<Record<LanguageCode, string>> | null | undefined;

/**
 * Safely resolves a dynamic field (e.g. product name, deal title, category name)
 * based on the active user language with fallback to English, first available translation, or default string.
 */
export function getLocalized(value: LocalizedField, language: LanguageCode = 'en', fallback: string = ''): string {
  if (!value) return fallback;

  if (typeof value === 'string') {
    // If it's a JSON stringified object, attempt parsing
    if (value.startsWith('{') && value.endsWith('}')) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed[language] || parsed.en || parsed.ur || parsed.ar || Object.values(parsed)[0] || fallback;
        }
      } catch {
        // Not a JSON object, use string as-is
        return value;
      }
    }
    return value;
  }

  if (typeof value === 'object') {
    const langKey = language as LanguageCode;
    if (value[langKey] && typeof value[langKey] === 'string' && value[langKey]?.trim() !== '') {
      return value[langKey] as string;
    }
    if (value.en && typeof value.en === 'string' && value.en.trim() !== '') {
      return value.en;
    }
    if (value.ur && typeof value.ur === 'string' && value.ur.trim() !== '') {
      return value.ur;
    }
    if (value.ar && typeof value.ar === 'string' && value.ar.trim() !== '') {
      return value.ar;
    }
    const firstVal = Object.values(value).find((v) => typeof v === 'string' && v.trim() !== '');
    if (firstVal) return firstVal as string;
  }

  return fallback;
}
