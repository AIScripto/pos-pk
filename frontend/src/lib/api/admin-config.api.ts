import { api } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrgConfigBranch {
  id:          string;
  name:        string;
  label:       string;
  addrLine1:   string;
  addrLine2?:  string;
  addrArea:    string;
  addrCity:    string;
  addrState:   string;
  addrCountry: string;
  addrPostCode: string;
  addrLat?:    number;
  addrLng?:    number;
  phone?:      string;
  email?:      string;
  city?:       { id: string; name: string; code: string };
  area?:       { id: string; name: string; tag:  string } | null;
}

export interface OrgConfig {
  id:    string;
  orgId: string;
  // Business Profile (org-level only)
  businessName:  string;
  businessEmail: string;
  businessPhone: string;
  taxRegLabel:   string;
  taxRegNumber:  string;
  logoUrl:       string;
  // Default branch — drives address resolution
  defaultBranchId:  string | null;
  defaultBranch:    OrgConfigBranch | null;
  // Currency
  currencyCode:     string;
  currencySymbol:   string;
  symbolPosition:   string;
  decimalPlaces:    number;
  thousandSep:      string;
  decimalSep:       string;
  // Locale
  locale:           string;
  timezone:         string;
  dateFormat:       string;
  timeFormat:       string;
  country:          string;
  phoneCountryCode: string;
  // Receipt
  receiptHeader:        string;
  receiptFooter:        string;
  showLoyaltyOnReceipt: boolean;
}

export type TaxMode = 'exclusive' | 'inclusive';
export type TaxAppliesTo = 'all' | 'dine_in' | 'takeaway' | 'delivery';
export type TaxPaymentMethod = 'all' | 'card' | 'cash' | 'wallet';

export interface TaxConfig {
  id:        string;
  orgId:     string;
  branchId:  string | null;
  name:      string;
  label:     string;
  rate:      number;
  mode:      TaxMode;
  appliesTo: TaxAppliesTo;
  /** Which payment method this rate applies to. The backend resolves an exact
   *  match first and falls back to "all"; the tax section reads and writes it,
   *  but it was missing from this interface. */
  paymentMethod: TaxPaymentMethod;
  isDefault: boolean;
  isActive:  boolean;
}

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountPreset {
  id:        string;
  orgId:     string;
  name:      string;
  type:      DiscountType;
  value:     number;
  sortOrder: number;
  isActive:  boolean;
}

export interface LoyaltyConfig {
  id:               string;
  orgId:            string;
  isEnabled:        boolean;
  earnRatePaisa:    number;
  pointValuePaisa:  number;
  minPointsRedeem:  number;
  maxRedeemPct:     number;
  pointsExpireDays: number | null;
  tiersEnabled:     boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminConfigApi = {
  // Org Config
  getOrgConfig:    ()           => api.get<OrgConfig>('/admin/config/org'),
  upsertOrgConfig: (data: Partial<OrgConfig>) => api.patch<OrgConfig>('/admin/config/org', data),

  // Tax Config
  listTaxConfigs:   ()           => api.get<TaxConfig[]>('/admin/config/tax'),
  createTaxConfig:  (data: Partial<TaxConfig>) => api.post<TaxConfig>('/admin/config/tax', data),
  updateTaxConfig:  (id: string, data: Partial<TaxConfig>) => api.patch<TaxConfig>(`/admin/config/tax/${id}`, data),
  deleteTaxConfig:  (id: string) => api.delete<void>(`/admin/config/tax/${id}`),

  // Discounts
  listDiscounts:    ()           => api.get<DiscountPreset[]>('/admin/config/discounts'),
  createDiscount:   (data: Partial<DiscountPreset>) => api.post<DiscountPreset>('/admin/config/discounts', data),
  updateDiscount:   (id: string, data: Partial<DiscountPreset>) => api.patch<DiscountPreset>(`/admin/config/discounts/${id}`, data),
  deleteDiscount:   (id: string) => api.delete<void>(`/admin/config/discounts/${id}`),

  // Loyalty
  getLoyaltyConfig:    ()           => api.get<LoyaltyConfig>('/admin/config/loyalty'),
  upsertLoyaltyConfig: (data: Partial<LoyaltyConfig>) => api.patch<LoyaltyConfig>('/admin/config/loyalty', data),
};
