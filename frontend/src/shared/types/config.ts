// ─────────────────────────────────────────────────────────────────────────────
// Organisation-level configuration — currency, tax, loyalty, discounts
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

// ── Currency & Locale ─────────────────────────────────────────────────────────

export interface OrgConfig extends BaseEntity {
  orgId: string;

  // Currency
  currencyCode:   string;   // ISO 4217  "PKR" | "USD" | "GBP" | "EUR"
  currencySymbol: string;   // "Rs" | "$" | "£" | "€"
  currencyPos:    'before' | 'after';   // symbol before amount vs amount before symbol
  decimalPlaces:  number;   // 2 for most; 0 for JPY; 3 for KWD

  // Number formatting
  thousandSep:    string;   // "," (en) or "." (de)
  decimalSep:     string;   // "." (en) or "," (de)

  // Locale & timezone
  locale:         string;   // "en-PK" | "en-US" | "en-GB" | "de-DE"
  timezone:       string;   // "Asia/Karachi" | "America/New_York"
  dateFormat:     string;   // "DD/MM/YYYY" | "MM/DD/YYYY"
  timeFormat:     '12h' | '24h';
  country:        string;   // ISO 3166-1 alpha-2  "PK" | "US" | "GB"

  // Phone
  phoneCountryCode: string; // "+92" | "+1" | "+44"

  // Receipt
  receiptHeader:  string;
  receiptFooter:  string;
  showLoyaltyOnReceipt: boolean;

  // Business registration
  taxRegLabel:    string;   // "NTN" | "VAT No." | "EIN" | "ABN"
  taxRegNumber:   string;
  businessEmail:  string;
  businessPhone:  string;
}

// ── Tax ───────────────────────────────────────────────────────────────────────

export interface TaxConfig extends BaseEntity {
  orgId:      string;
  branchId:   string | null;  // null = applies to whole org; set = branch override
  name:       string;         // "Punjab GST 16%" | "Sales Tax" | "VAT 20%"
  label:      string;         // Short label on receipt: "GST" | "VAT" | "Tax"
  rate:       number;         // Percentage  e.g. 16.0
  mode:       'exclusive' | 'inclusive';
  // exclusive → tax added on top  (PK, US)
  // inclusive → tax already in price (UK, EU, AU)
  appliesTo:  TaxScope;
  isDefault:  boolean;
}

export type TaxScope = 'all' | 'dine_in' | 'takeaway' | 'delivery';

export interface TaxCalculation {
  preTaxAmount: number;   // integer paisa/cents
  taxRate:      number;   // percentage
  taxAmount:    number;   // integer paisa/cents
  grandTotal:   number;   // integer paisa/cents
}

// ── Discount ──────────────────────────────────────────────────────────────────

export interface DiscountPreset extends BaseEntity {
  orgId:              string;
  name:               string;       // "Staff 25%" | "Happy Hour"
  type:               DiscountType;
  value:              number;       // 25 (%) or 150 (fixed, paisa)
  level:              DiscountLevel;
  reason:             DiscountReason;
  requiresManagerPin: boolean;
  /** Maximum discount amount in paisa — null means no cap */
  maxValuePaisa:      number | null;
}

export type DiscountType   = 'percentage' | 'fixed';
export type DiscountLevel  = 'line_item'  | 'order';
export type DiscountReason =
  | 'loyalty' | 'staff' | 'promotional' | 'manager_override'
  | 'complaint' | 'happy_hour' | 'bulk' | 'other';

export interface AppliedDiscount {
  presetId:   string | null;
  name:       string;
  type:       DiscountType;
  value:      number;       // the % or fixed amount entered
  amountPaisa: number;      // actual paisa deducted
  level:      DiscountLevel;
  reason:     DiscountReason;
  approvedBy: string | null;  // manager userId
}

// ── Loyalty ───────────────────────────────────────────────────────────────────

export interface LoyaltyConfig extends BaseEntity {
  orgId:           string;
  isEnabled:       boolean;
  /** Spend X minor units = 1 point. */
  earnRatePaisa:   number;
  /** 1 point = X minor units of discount. */
  pointValuePaisa: number;
  minPointsRedeem: number;
  /** Max % of order that can be paid with points */
  maxRedeemPct:    number;
  pointsExpireDays: number | null;
  tiersEnabled:    boolean;
  tiers:           LoyaltyTier[];
}

export interface LoyaltyTier extends BaseEntity {
  configId:       string;
  name:           string;   // "Bronze" | "Silver" | "Gold" | "Platinum"
  minPoints:      number;   // lifetime points threshold
  color:          string;   // hex colour
  icon:           string;   // emoji or icon name
  earnMultiplier: number;   // Gold = 2.0
  discountPct:    number;   // extra order discount for tier members
}
