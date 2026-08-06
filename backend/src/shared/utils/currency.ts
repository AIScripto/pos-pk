// ─────────────────────────────────────────────────────────────────────────────
// Currency utilities — all amounts stored as INTEGER (paisa / cents)
// This eliminates floating-point rounding errors in financial calculations.
// ─────────────────────────────────────────────────────────────────────────────

import type { OrgConfig } from '../types/config.js';

/** Convert a display amount (e.g. 149.50) to smallest unit (14950 paisa). */
export const toSmallestUnit = (amount: number, decimalPlaces = 2): number =>
  Math.round(amount * Math.pow(10, decimalPlaces));

/** Convert smallest unit (14950 paisa) to display amount (149.50). */
export const fromSmallestUnit = (paisa: number, decimalPlaces = 2): number =>
  paisa / Math.pow(10, decimalPlaces);

/**
 * Format a paisa amount into a human-readable currency string.
 * Uses OrgConfig for symbol, position, decimal places and separators.
 *
 * @example
 *   formatMoney(14950, pkrConfig)  → "Rs 149.50"
 *   formatMoney(14950, usdConfig)  → "$149.50"
 *   formatMoney(14950, deConfig)   → "149,50 €"
 */
export function formatMoney(paisa: number, config: Pick<OrgConfig,
  'currencySymbol' | 'currencyPos' | 'decimalPlaces' |
  'thousandSep'   | 'decimalSep'  | 'locale'>
): string {
  const amount   = fromSmallestUnit(paisa, config.decimalPlaces);
  const parts    = amount.toFixed(config.decimalPlaces).split('.');
  const intPart  = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandSep);
  const decPart  = parts[1] ?? '';
  const formatted = config.decimalPlaces > 0
    ? `${intPart}${config.decimalSep}${decPart}`
    : intPart;

  return config.currencyPos === 'before'
    ? `${config.currencySymbol}${formatted}`
    : `${formatted} ${config.currencySymbol}`;
}

/**
 * Simple formatter — used when OrgConfig is not available (UI defaults).
 * Falls back to PKR formatting.
 */
export function formatCurrency(paisa: number): string {
  const amount = fromSmallestUnit(paisa);
  return `Rs ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Percentage of a paisa amount, rounded to integer. */
export const pct = (paisa: number, percent: number): number =>
  Math.round(paisa * (percent / 100));

/** Safe integer addition — avoids NaN/undefined propagation. */
export const safeAdd = (...values: number[]): number =>
  values.reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);
