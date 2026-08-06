/**
 * Data Validation Schemas
 *
 * Validates user input, API responses, and persisted data
 * to prevent data corruption and crashes.
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// POS Cart & Transactions
// ─────────────────────────────────────────────────────────────────────────

export const PhoneNumberSchema = z
  .string()
  .min(1, 'Phone number required')
  .regex(/^\+?[\d\s\-()]*$/, 'Invalid phone format');

export const CartItemSchema = z.object({
  id: z.string().min(1, 'Item ID required'),
  quantity: z.number().int('Quantity must be whole number').min(1, 'Quantity must be at least 1').max(999, 'Quantity too high'),
  discountPercent: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  lumpSumDiscount: z.number().min(0, 'Discount cannot be negative').max(999999, 'Discount amount too high'),
});

export const CartTotalsSchema = z.object({
  subtotal: z.number().min(0, 'Subtotal cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative'),
  tax: z.number().min(0, 'Tax cannot be negative'),
  grandTotal: z.number().min(0, 'Total cannot be negative'),
});

export const InvoiceSchema = z.object({
  id: z.string().min(1, 'Invoice ID required'),
  date: z.date(),
  items: z.array(CartItemSchema).min(1, 'Invoice must have at least 1 item'),
  subtotal: z.number().min(0),
  discount: z.number().min(0),
  tax: z.number().min(0),
  grandTotal: z.number().min(0.01, 'Total must be greater than 0'),
  paymentMethod: z.enum(['cash', 'card', 'cash-on-delivery', 'card-on-delivery']),
  paymentStatus: z.enum(['paid', 'pending', 'voided']),
});

// ─────────────────────────────────────────────────────────────────────────
// Customer Data
// ─────────────────────────────────────────────────────────────────────────

export const CustomerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Customer name required').max(100, 'Name too long'),
  phone: PhoneNumberSchema,
  loyaltyPoints: z.number().min(0, 'Loyalty points cannot be negative').int(),
  totalOrders: z.number().min(0).int(),
  totalSpent: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastOrderAt: z.date().nullable(),
});

export const ActiveCustomerSchema = z.object({
  customerId: z.string().nullable(),
  name: z.string().min(1, 'Name required').max(100),
  phone: PhoneNumberSchema,
});

// ─────────────────────────────────────────────────────────────────────────
// Till Operations
// ─────────────────────────────────────────────────────────────────────────

export const DenominationSchema = z.record(
  z.string(),
  z.object({
    count: z.number().int().min(0, 'Count cannot be negative'),
    value: z.number().min(0, 'Value cannot be negative'),
  })
);

export const TillSessionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['open', 'closed', 'reconciling']),
  openedAt: z.date(),
  closedAt: z.date().nullable(),
  openingCash: z.number().min(0, 'Opening balance cannot be negative'),
  closingCash: z.number().nullable(),
  variance: z.number().nullable(), // closingCash - expectedCash
});

// ─────────────────────────────────────────────────────────────────────────
// Validation Helper Functions
// ─────────────────────────────────────────────────────────────────────────

/**
 * Safely parse and validate data
 * Returns { success: true, data } or { success: false, error: string }
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return { success: false, error: message };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Validate cart totals and ensure no impossible states
 */
export function validateCartCalculation(subtotal: number, discount: number, tax: number, total: number): boolean {
  // Prevent negative values
  if (subtotal < 0 || discount < 0 || tax < 0 || total < 0) return false;

  // Discount cannot exceed subtotal
  if (discount > subtotal) return false;

  // Tax must be roughly calculated from subtotal (allow ±0.1 for rounding)
  const expectedTax = subtotal * 0.21; // 21% tax
  if (Math.abs(tax - expectedTax) > 0.1) console.warn('Tax calculation mismatch');

  // Total should be subtotal - discount + tax (allow ±0.01 for floating point)
  const expectedTotal = subtotal - discount + tax;
  if (Math.abs(total - expectedTotal) > 0.01) return false;

  return true;
}

/**
 * Validate phone number format (loose, accepts various formats)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || phone.length < 10) return false;
  // Remove common separators and check length
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^\+?\d{10,}$/.test(cleaned);
}

/**
 * Detect and prevent duplicate invoice IDs (within last 100ms)
 */
const recentInvoiceIds = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 100;

export function isDuplicateInvoiceId(id: string): boolean {
  const lastTime = recentInvoiceIds.get(id);
  const now = Date.now();

  if (lastTime && now - lastTime < DUPLICATE_WINDOW_MS) {
    return true; // Duplicate within window
  }

  recentInvoiceIds.set(id, now);

  // Cleanup old entries
  if (recentInvoiceIds.size > 1000) {
    const cutoff = now - DUPLICATE_WINDOW_MS;
    for (const [key, time] of recentInvoiceIds) {
      if (time < cutoff) recentInvoiceIds.delete(key);
    }
  }

  return false;
}

/**
 * Sanitize customer input strings (trim whitespace, remove control chars)
 */
export function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, maxLength);
}
