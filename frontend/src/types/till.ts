// ── Till / Cash-Drawer Management Types ────────────────────────────────────

export interface DenominationDef {
  value: number;
  label: string;
  type: 'note' | 'coin';
}

// ---------------------------------------------------------------------------
// Regional Currency Denomination Presets (PKR, USD, EUR, GBP, AED, SAR, CAD)
// ---------------------------------------------------------------------------

export const REGIONAL_DENOMINATIONS: Record<string, DenominationDef[]> = {
  // ── Pakistan (PKR) ────────────────────────────────────────────────────────
  PKR: [
    { value: 5000, label: '5,000', type: 'note' },
    { value: 1000, label: '1,000', type: 'note' },
    { value: 500,  label: '500',   type: 'note' },
    { value: 100,  label: '100',   type: 'note' },
    { value: 50,   label: '50',    type: 'note' },
    { value: 20,   label: '20',    type: 'note' },
    { value: 10,   label: '10',    type: 'coin' },
    { value: 5,    label: '5',     type: 'coin' },
    { value: 2,    label: '2',     type: 'coin' },
    { value: 1,    label: '1',     type: 'coin' },
  ],

  // ── United States (USD) ───────────────────────────────────────────────────
  USD: [
    { value: 100,  label: '100',  type: 'note' },
    { value: 50,   label: '50',   type: 'note' },
    { value: 20,   label: '20',   type: 'note' },
    { value: 10,   label: '10',   type: 'note' },
    { value: 5,    label: '5',    type: 'note' },
    { value: 2,    label: '2',    type: 'note' },
    { value: 1,    label: '1',    type: 'note' },
    { value: 0.25, label: '0.25', type: 'coin' },
    { value: 0.10, label: '0.10', type: 'coin' },
    { value: 0.05, label: '0.05', type: 'coin' },
    { value: 0.01, label: '0.01', type: 'coin' },
  ],

  // ── Eurozone (EUR) ────────────────────────────────────────────────────────
  EUR: [
    { value: 500,  label: '500',  type: 'note' },
    { value: 200,  label: '200',  type: 'note' },
    { value: 100,  label: '100',  type: 'note' },
    { value: 50,   label: '50',   type: 'note' },
    { value: 20,   label: '20',   type: 'note' },
    { value: 10,   label: '10',   type: 'note' },
    { value: 5,    label: '5',    type: 'note' },
    { value: 2,    label: '2',    type: 'coin' },
    { value: 1,    label: '1',    type: 'coin' },
    { value: 0.50, label: '0.50', type: 'coin' },
    { value: 0.20, label: '0.20', type: 'coin' },
    { value: 0.10, label: '0.10', type: 'coin' },
    { value: 0.05, label: '0.05', type: 'coin' },
  ],

  // ── United Kingdom (GBP) ──────────────────────────────────────────────────
  GBP: [
    { value: 50,   label: '50',   type: 'note' },
    { value: 20,   label: '20',   type: 'note' },
    { value: 10,   label: '10',   type: 'note' },
    { value: 5,    label: '5',    type: 'note' },
    { value: 2,    label: '2',    type: 'coin' },
    { value: 1,    label: '1',    type: 'coin' },
    { value: 0.50, label: '0.50', type: 'coin' },
    { value: 0.20, label: '0.20', type: 'coin' },
    { value: 0.10, label: '0.10', type: 'coin' },
    { value: 0.05, label: '0.05', type: 'coin' },
  ],

  // ── United Arab Emirates (AED) ────────────────────────────────────────────
  AED: [
    { value: 1000, label: '1,000', type: 'note' },
    { value: 500,  label: '500',   type: 'note' },
    { value: 200,  label: '200',   type: 'note' },
    { value: 100,  label: '100',   type: 'note' },
    { value: 50,   label: '50',    type: 'note' },
    { value: 20,   label: '20',    type: 'note' },
    { value: 10,   label: '10',    type: 'note' },
    { value: 5,    label: '5',     type: 'note' },
    { value: 1,    label: '1',     type: 'coin' },
    { value: 0.50, label: '0.50', type: 'coin' },
  ],

  // ── Saudi Arabia (SAR) ────────────────────────────────────────────────────
  SAR: [
    { value: 500,  label: '500',   type: 'note' },
    { value: 200,  label: '200',   type: 'note' },
    { value: 100,  label: '100',   type: 'note' },
    { value: 50,   label: '50',    type: 'note' },
    { value: 20,   label: '20',    type: 'note' },
    { value: 10,   label: '10',    type: 'note' },
    { value: 5,    label: '5',     type: 'note' },
    { value: 2,    label: '2',     type: 'coin' },
    { value: 1,    label: '1',     type: 'coin' },
  ],
};

export const PKR_DENOMINATIONS = REGIONAL_DENOMINATIONS.PKR;

// ---------------------------------------------------------------------------
// Per-denomination count entry
// ---------------------------------------------------------------------------

export interface DenominationEntry {
  value: number;
  label: string;
  type?: 'note' | 'coin';
  count: number;
  total: number; // value × count
}

export function getDenominationsForCurrency(currencyCode?: string): DenominationDef[] {
  const code = (currencyCode || 'PKR').toUpperCase();
  return REGIONAL_DENOMINATIONS[code] ?? REGIONAL_DENOMINATIONS.PKR;
}

// Helper — build a blank denomination sheet dynamically for the configured currency
export function blankDenominations(currencyCode?: string): DenominationEntry[] {
  const defs = getDenominationsForCurrency(currencyCode);
  return defs.map((d) => ({
    value: d.value,
    label: d.label,
    type:  d.type,
    count: 0,
    total: 0,
  }));
}

// Helper — sum a denomination sheet
export function sumDenominations(entries: DenominationEntry[]): number {
  return entries.reduce((acc, e) => acc + e.total, 0);
}

// ---------------------------------------------------------------------------
// Till Session
// ---------------------------------------------------------------------------

export type TillStatus = 'open' | 'pending_close_approval' | 'closed';

export interface TillSession {
  id: string;
  branchId?: string;
  terminalId?: string;
  shiftTemplateId?: string | null;
  shiftName?: string | null;
  businessDate?: string;
  status: TillStatus;
  openedAt: string;
  openedBy: string;
  openingCash: number;
  openingDenominations: DenominationEntry[];

  closedAt?: string;
  closedBy?: string;
  closingCash?: number;
  closingDenominations?: DenominationEntry[];

  variance?: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Till Summary
// ---------------------------------------------------------------------------

export interface CategorySaleLine {
  category: string;
  label: string;
  totalSales: number;
  transactionCount: number;
}

export interface TillSummary {
  grossSales: number;
  totalDiscount: number;
  totalTax: number;
  netSales: number;
  totalTransactions: number;

  cashSales: number;
  cardSales: number;
  codPending: number;

  categorySales: CategorySaleLine[];

  openingCash: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
}
