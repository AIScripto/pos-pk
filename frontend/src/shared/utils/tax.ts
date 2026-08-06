// ─────────────────────────────────────────────────────────────────────────────
// Tax calculation utilities — exclusive and inclusive modes
// ─────────────────────────────────────────────────────────────────────────────

import type { TaxConfig, TaxCalculation } from '../types/config.js';

/**
 * Calculate tax on a paisa amount using the given TaxConfig.
 *
 * EXCLUSIVE (Pakistan / USA):
 *   Tax is added ON TOP of the taxable amount.
 *   grandTotal = taxable + tax
 *
 * INCLUSIVE (UK / EU / Australia):
 *   Tax is already INSIDE the price.
 *   Tax content = price − (price / (1 + rate))
 *   grandTotal = taxable (unchanged)
 */
export function calculateTax(
  taxableAmountPaisa: number,
  config: Pick<TaxConfig, 'rate' | 'mode' | 'isActive'> | null,
): TaxCalculation {
  if (!config || !config.isActive || config.rate === 0) {
    return {
      preTaxAmount: taxableAmountPaisa,
      taxRate:      0,
      taxAmount:    0,
      grandTotal:   taxableAmountPaisa,
    };
  }

  if (config.mode === 'inclusive') {
    // Tax is inside the price — extract it
    const taxAmount = Math.round(
      taxableAmountPaisa - taxableAmountPaisa / (1 + config.rate / 100),
    );
    return {
      preTaxAmount: taxableAmountPaisa - taxAmount,
      taxRate:      config.rate,
      taxAmount,
      grandTotal:   taxableAmountPaisa,   // price doesn't change
    };
  }

  // Exclusive — add tax on top
  const taxAmount = Math.round(taxableAmountPaisa * (config.rate / 100));
  return {
    preTaxAmount: taxableAmountPaisa,
    taxRate:      config.rate,
    taxAmount,
    grandTotal:   taxableAmountPaisa + taxAmount,
  };
}

/**
 * Calculate line item total in paisa.
 * (unitPrice × qty) − lineDiscount% − lumpDiscount (all in paisa).
 */
export function calculateLineTotal(
  unitPricePaisa:    number,
  quantity:          number,
  discountPercent:   number,
  lumpDiscountPaisa: number,
): number {
  const gross    = unitPricePaisa * quantity;
  const pctDisc  = Math.round(gross * (discountPercent / 100));
  const total    = gross - pctDisc - lumpDiscountPaisa;
  return Math.max(0, total);
}
