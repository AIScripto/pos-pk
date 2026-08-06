// ─────────────────────────────────────────────────────────────────────────────
// Invoice — the financial record of a completed transaction.
// Every field that could be needed for audit, reporting, or sync is present.
// All monetary amounts are stored in the smallest currency unit (paisa / cents).
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity }     from './common.js';
import type { AppliedDiscount } from './config.js';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'wallet'
  | 'cash_on_delivery'
  | 'card_on_delivery';

export type PaymentStatus = 'paid' | 'pending' | 'voided';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

// ── Invoice ───────────────────────────────────────────────────────────────────

export interface Invoice extends BaseEntity {
  // ── Complete organisational reference ────────────────────────────────────
  orgId:         string;
  cityId:        string;
  branchId:      string;
  terminalId:    string;
  tillSessionId: string;
  cashierId:     string;   // userId of the cashier who processed the sale

  // ── Table reference (dine-in only) ───────────────────────────────────────
  tableId:       string | null;
  tableName:     string | null;   // denormalised "T4" — survives table rename
  covers:        number | null;   // number of guests

  // ── Order metadata ────────────────────────────────────────────────────────
  orderType:     OrderType;
  date:          string;           // ISO 8601

  // ── Customer (optional) ───────────────────────────────────────────────────
  customerId:    string | null;
  customerName:  string | null;
  customerPhone: string | null;
  loyaltyPointsEarned:  number;
  loyaltyPointsRedeemed: number;

  // ── Line items ────────────────────────────────────────────────────────────
  items:         InvoiceItem[];

  // ── Financials (all in paisa) ─────────────────────────────────────────────
  subtotalPaisa:      number;   // sum of line item totals before any discount
  lineDiscountPaisa:  number;   // total of all line-item discounts
  orderDiscountPaisa: number;   // order-level discount
  totalDiscountPaisa: number;   // lineDiscount + orderDiscount
  taxablePaisa:       number;   // subtotal − totalDiscount
  taxRate:            number;   // percentage e.g. 16
  taxPaisa:           number;   // computed tax amount
  grandTotalPaisa:    number;   // taxable + tax
  roundingPaisa:      number;   // rounding adjustment (±)

  // ── Discounts applied ─────────────────────────────────────────────────────
  discounts: AppliedDiscount[];

  // ── Payment ───────────────────────────────────────────────────────────────
  paymentMethod:  PaymentMethod;
  paymentStatus:  PaymentStatus;
  paidAt:         string | null;
  /** Split payment support — multiple methods */
  paymentAllocations: PaymentAllocation[];

  // ── Notes ─────────────────────────────────────────────────────────────────
  orderNotes: string | null;
  voidReason: string | null;
  voidedBy:   string | null;

  // ── Cloud sync ────────────────────────────────────────────────────────────
  synced:   boolean;
  syncedAt: string | null;
}

export interface InvoiceItem extends BaseEntity {
  invoiceId:     string;
  productId:     string | null;
  dealId:        string | null;
  productName:   string;    // denormalised
  productCode:   string;    // denormalised
  category:      string;    // denormalised
  unitPricePaisa: number;
  quantity:      number;
  discountPercent: number;
  lumpDiscountPaisa: number;
  lineTotalPaisa:  number;  // (unitPrice × qty) − discounts
  isDeal:        boolean;
}

export interface PaymentAllocation {
  method:     PaymentMethod;
  amountPaisa: number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateInvoiceDTO {
  orgId:         string;
  cityId:        string;
  branchId:      string;
  terminalId:    string;
  tillSessionId: string;
  cashierId:     string;
  tableId?:      string;
  covers?:       number;
  orderType:     OrderType;
  customerId?:   string;
  items:         CreateInvoiceItemDTO[];
  discounts?:    AppliedDiscount[];
  paymentMethod:  PaymentMethod;
  paymentAllocations?: PaymentAllocation[];
  orderNotes?:   string;
  loyaltyPointsToRedeem?: number;
}

export interface CreateInvoiceItemDTO {
  productId?:        string;
  dealId?:           string;
  productName:       string;
  productCode:       string;
  category:          string;
  unitPricePaisa:    number;
  quantity:          number;
  discountPercent?:  number;
  lumpDiscountPaisa?: number;
  isDeal:            boolean;
}
