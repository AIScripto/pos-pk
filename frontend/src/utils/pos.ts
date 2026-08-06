import { CartItem } from '@/types/pos';
import { getTaxConfigForPayment } from '@/config/tax';
import { formatConfiguredCurrency, getCurrencyConfig } from '@/config/currency';


// Utility functions for POS system

/**
 * Generate a unique ID using timestamp and random string
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Generate a short, cashier-friendly label for a held order slot.
 * @param heldOrderCount - number of orders already on hold (used to number new slots).
 */
export const generateHoldLabel = (heldOrderCount: number): string => {
  const now = new Date();
  const time = now.toLocaleTimeString(getCurrencyConfig().locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  return `Hold #${heldOrderCount + 1} – ${time}`;
};



/**
 * Format money with the active organisation currency configuration.
 */
export const formatCurrency = (amount: number): string => {
  return formatConfiguredCurrency(amount);
};

/**
 * Format date for invoices
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(getCurrencyConfig().locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Format date for receipt (shorter format)
 */
export const formatReceiptDate = (date: Date): string => {
  return new Intl.DateTimeFormat(getCurrencyConfig().locale, {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${timestamp}-${random}`;
};

export const getItemUnitPrice = (item: Pick<CartItem, 'product' | 'deal'>): number => {
  return item.product?.price ?? item.deal?.price ?? 0;
};

export const getCartItemIdentity = (item: Pick<CartItem, 'id' | 'product' | 'deal'>) => {
  if (item.deal) {
    return {
      itemKey: `deal:${item.deal.id}`,
      name: item.deal.name,
    };
  }

  return {
    itemKey: `product:${item.product?.id ?? item.id}`,
    name: item.product?.name ?? 'Unknown item',
  };
};

export const normalizePhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatPhoneNumber = (value: string): string => {
  const digits = normalizePhoneNumber(value).slice(0, 11);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

/**
 * Calculate loyalty points earned based on the configured earn rate.
 * @param amount - total amount in major currency units.
 * @param earnRatePaisa - spend amount in paisa to earn 1 point (defaults to 1000, i.e., 10 major units).
 */
export const calculateLoyaltyPoints = (amount: number, earnRatePaisa = 1000): number => {
  const amountPaisa = Math.round(amount * 100);
  return Math.max(0, Math.floor(amountPaisa / earnRatePaisa));
};

/**
 * Calculate line item total
 */
export const calculateLineTotal = (
  unitPrice: number,
  quantity: number,
  discountPercent: number = 0,
  lumpSumDiscount: number = 0
): number => {
  const subtotal = unitPrice * quantity;
  const safePercent = Number.isFinite(discountPercent) ? Math.min(100, Math.max(0, discountPercent)) : 0;
  const safeLump = Number.isFinite(lumpSumDiscount) ? Math.max(0, lumpSumDiscount) : 0;
  const percentDiscount = subtotal * (safePercent / 100);
  return Math.max(0, subtotal - percentDiscount - safeLump);
};

export const calculateLinePricing = (
  item: Pick<CartItem, 'product' | 'deal' | 'quantity' | 'discountPercent' | 'lumpSumDiscount'>
) => {
  const unitPrice = getItemUnitPrice(item);
  const subtotal = unitPrice * item.quantity;
  const total = calculateLineTotal(unitPrice, item.quantity, item.discountPercent, item.lumpSumDiscount);

  return {
    unitPrice,
    subtotal,
    total,
    discount: subtotal - total,
  };
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (
  items: Array<Pick<CartItem, 'product' | 'deal' | 'quantity' | 'discountPercent' | 'lumpSumDiscount'>>
) => {
  let subtotal = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    const linePricing = calculateLinePricing(item);

    subtotal += linePricing.subtotal;
    totalDiscount += linePricing.discount;
  });

  const grandTotal = Math.max(0, subtotal - totalDiscount);

  return {
    subtotal,
    totalDiscount,
    grandTotal,
  };
};

/**
 * Calculate savings on a deal
 */
export const calculateDealSavings = (originalPrice: number, dealPrice: number): number => {
  return originalPrice - dealPrice;
};

/**
 * Get savings percentage
 */
export const getSavingsPercent = (originalPrice: number, dealPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - dealPrice) / originalPrice) * 100);
};

/**
 * Calculate tax from a pre-tax (post-discount) total.
 *
 * Selects the correct tax rate based on the Configuration → Tax rules.
 *
 * @param preTaxTotal   - The cart total AFTER discounts have been subtracted.
 * @param paymentMethod - The selected payment method key (e.g. "card", "cash").
 */
export const calculateTax = (
  preTaxTotal: number,
  paymentMethod: string = 'cash',
): { taxRate: number; taxLabel: string; taxAmount: number; grandTotal: number } => {

  const cfg       = getTaxConfigForPayment(paymentMethod);
  const safeTotal = Math.max(0, preTaxTotal);

  if (!cfg.enabled || cfg.defaultRatePercent <= 0) {
    return { taxRate: 0, taxLabel: cfg.label, taxAmount: 0, grandTotal: safeTotal };
  }

  const rate = Math.min(100, Math.max(0, cfg.defaultRatePercent));

  if (cfg.mode === 'inclusive') {
    const taxAmount = safeTotal - safeTotal / (1 + rate / 100);
    return {
      taxRate:   rate,
      taxLabel:  cfg.label,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal: Math.round(safeTotal * 100) / 100,
    };
  }

  // Exclusive — tax is added on top.
  const taxAmount = safeTotal * (rate / 100);
  return {
    taxRate:    rate,
    taxLabel:   cfg.label,
    taxAmount:  Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round((safeTotal + taxAmount) * 100) / 100,
  };
};
