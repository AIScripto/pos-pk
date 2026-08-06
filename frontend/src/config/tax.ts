/**
 * Tax Configuration
 *
 * Centralised tax settings for the POS system.
 * Edit the values here to change tax behaviour across the entire application
 * without touching any business logic or UI files.
 */

export interface TaxConfig {
  /** Whether tax is enabled globally. Set to false to disable all tax calculations. */
  enabled: boolean;

  /**
   * Tax rate expressed as a percentage (e.g. 21 means 21 %).
   * This is the default rate applied to every invoice.
   * Accepted range: 0 – 100.
   */
  defaultRatePercent: number;

  /**
   * Human-readable label shown on invoices and receipts.
   * e.g. "VAT", "GST", "Sales Tax"
   */
  label: string;

  /**
   * Whether the listed product prices already include tax (inclusive)
   * or whether tax is added on top of the pre-discount total (exclusive).
   *
   * - 'exclusive'  → tax = (subtotal - discount) × rate          (most common for POS)
   * - 'inclusive'  → tax = grandTotal - grandTotal / (1 + rate)  (GST / VAT inclusive pricing)
   */
  mode: 'exclusive' | 'inclusive';
}

export interface RuntimeTaxRule {
  label?: string;
  rate?: number;
  mode?: 'exclusive' | 'inclusive' | string;
  appliesTo?: string;
  paymentMethod?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Active tax configuration. It is updated from the Configuration API at runtime
 * by AppConfigProvider, while keeping this object stable for existing imports.
 */
export const TAX_CONFIG: TaxConfig = {
  enabled: true,
  defaultRatePercent: 16,
  label: 'Tax',
  mode: 'exclusive',
};

let activeTaxRules: RuntimeTaxRule[] = [];

const normalisePaymentMethod = (paymentMethod?: string) => {
  if (!paymentMethod) return 'all';
  if (paymentMethod.includes('card')) return 'card';
  if (paymentMethod.includes('wallet')) return 'wallet';
  if (paymentMethod.includes('cash')) return 'cash';
  return paymentMethod;
};

const isActiveRule = (rule: RuntimeTaxRule) => rule.isActive !== false && Number(rule.rate ?? 0) >= 0;

export function configureTaxRules(rules?: RuntimeTaxRule[] | null) {
  if (!rules) return;

  activeTaxRules = (rules ?? []).filter(isActiveRule);

  const defaultRule =
    activeTaxRules.find((rule) => rule.isDefault) ??
    activeTaxRules.find((rule) => ['all', 'cash', undefined, null].includes(rule.paymentMethod as string | null)) ??
    activeTaxRules[0];

  TAX_CONFIG.enabled = activeTaxRules.length > 0;

  if (defaultRule) {
    TAX_CONFIG.defaultRatePercent = Number(defaultRule.rate ?? TAX_CONFIG.defaultRatePercent);
    TAX_CONFIG.label = defaultRule.label || TAX_CONFIG.label;
    TAX_CONFIG.mode = defaultRule.mode === 'inclusive' ? 'inclusive' : 'exclusive';
  }
}

export function getTaxConfigForPayment(paymentMethod = 'cash'): TaxConfig {
  const normalisedPayment = normalisePaymentMethod(paymentMethod);
  const matchingRule =
    activeTaxRules.find((rule) => normalisePaymentMethod(rule.paymentMethod ?? undefined) === normalisedPayment) ??
    activeTaxRules.find((rule) => rule.isDefault) ??
    activeTaxRules.find((rule) => normalisePaymentMethod(rule.paymentMethod ?? undefined) === 'all');

  if (!matchingRule) return TAX_CONFIG;

  return {
    enabled: true,
    defaultRatePercent: Number(matchingRule.rate ?? TAX_CONFIG.defaultRatePercent),
    label: matchingRule.label || TAX_CONFIG.label,
    mode: matchingRule.mode === 'inclusive' ? 'inclusive' : 'exclusive',
  };
}
