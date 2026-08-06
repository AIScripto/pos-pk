// ─────────────────────────────────────────────────────────────────────────────
// General formatting utilities — dates, phones, IDs
// ─────────────────────────────────────────────────────────────────────────────

import type { OrgConfig } from '../types/config.js';

/** Format a date string or Date using the org locale config. */
export function formatDate(
  date: Date | string,
  config?: Pick<OrgConfig, 'locale' | 'dateFormat'>,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(config?.locale ?? 'en-PK', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

/** Format time using the org locale config. */
export function formatTime(
  date: Date | string,
  config?: Pick<OrgConfig, 'locale' | 'timeFormat'>,
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(config?.locale ?? 'en-PK', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: (config?.timeFormat ?? '24h') === '12h',
  });
}

/** Format date + time together for receipts. */
export function formatDateTime(
  date: Date | string,
  config?: Pick<OrgConfig, 'locale' | 'dateFormat' | 'timeFormat'>,
): string {
  return `${formatDate(date, config)}  ${formatTime(date, config)}`;
}

/** Human-readable elapsed duration from milliseconds. */
export function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** Normalise a phone number to digits only. */
export const normalisePhone = (phone: string): string =>
  phone.replace(/\D/g, '');

/** Format phone with country code. */
export function formatPhone(
  phone: string,
  config?: Pick<OrgConfig, 'phoneCountryCode'>,
): string {
  const digits = normalisePhone(phone);
  const code   = config?.phoneCountryCode ?? '+92';
  if (digits.startsWith(code.replace('+', ''))) return `+${digits}`;
  return `${code}${digits}`;
}

/** Generate a cuid-style ID (browser + Node compatible). */
export const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/** Generate an invoice number: INV-YYYYMMDD-XXXX */
export const generateInvoiceNumber = (): string => {
  const now  = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${date}-${rand}`;
};
