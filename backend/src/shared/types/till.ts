// ─────────────────────────────────────────────────────────────────────────────
// Till / Cash-Drawer Management
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

// ── PKR denominations (extend for other currencies in OrgConfig) ──────────────

export interface DenominationDef {
  value: number;   // face value in paisa e.g. 100000 = Rs 1,000
  label: string;   // display "1,000"
  type:  'note' | 'coin';
}

export const PKR_DENOMINATIONS: DenominationDef[] = [
  { value: 500000, label: '5,000', type: 'note'  },
  { value: 100000, label: '1,000', type: 'note'  },
  { value:  50000, label: '500',   type: 'note'  },
  { value:  10000, label: '100',   type: 'note'  },
  { value:   5000, label: '50',    type: 'note'  },
  { value:   2000, label: '20',    type: 'note'  },
  { value:   1000, label: '10',    type: 'coin'  },
  { value:    500, label: '5',     type: 'coin'  },
  { value:    200, label: '2',     type: 'coin'  },
  { value:    100, label: '1',     type: 'coin'  },
];

export const USD_DENOMINATIONS: DenominationDef[] = [
  { value: 10000, label: '100',  type: 'note' },
  { value:  5000, label: '50',   type: 'note' },
  { value:  2000, label: '20',   type: 'note' },
  { value:  1000, label: '10',   type: 'note' },
  { value:   500, label: '5',    type: 'note' },
  { value:   100, label: '1',    type: 'note' },
  { value:    25, label: '0.25', type: 'coin' },
  { value:    10, label: '0.10', type: 'coin' },
  { value:     5, label: '0.05', type: 'coin' },
  { value:     1, label: '0.01', type: 'coin' },
];

// ── Denomination entry (cashier fills this in) ────────────────────────────────

export interface DenominationEntry {
  value:      number;   // face value in paisa
  label:      string;
  count:      number;
  totalPaisa: number;   // value × count
}

export const blankDenominations = (
  defs: DenominationDef[] = PKR_DENOMINATIONS,
): DenominationEntry[] =>
  defs.map((d) => ({ value: d.value, label: d.label, count: 0, totalPaisa: 0 }));

export const sumDenominations = (entries: DenominationEntry[]): number =>
  entries.reduce((acc, e) => acc + e.totalPaisa, 0);

// ── Till Session ──────────────────────────────────────────────────────────────

export type TillStatus = 'open' | 'closed';

export interface TillSession extends BaseEntity {
  // ── Complete organisational reference ────────────────────────────────────
  orgId:       string;
  cityId:      string;
  branchId:    string;
  terminalId:  string;

  status:      TillStatus;
  openedAt:    string;
  openedBy:    string;    // userId
  openedByName: string;   // denormalised
  openingCashPaisa: number;
  openingDenominations: DenominationEntry[];

  closedAt?:   string;
  closedBy?:   string;    // userId
  closingCashPaisa?:    number;
  closingDenominations?: DenominationEntry[];
  variance?:   number;    // closingCash − expectedCash (paisa)
  notes?:      string;

  synced:      boolean;
  syncedAt?:   string;
}

// ── Till Summary (computed, not stored) ───────────────────────────────────────

export interface CategorySaleLine {
  category:         string;
  label:            string;
  totalSalesPaisa:  number;
  transactionCount: number;
  itemCount:        number;
}

export interface TillSummary {
  grossSalesPaisa:    number;
  totalDiscountPaisa: number;
  totalTaxPaisa:      number;
  netSalesPaisa:      number;
  totalTransactions:  number;
  totalCovers:        number;
  cashSalesPaisa:     number;
  cardSalesPaisa:     number;
  walletSalesPaisa:   number;
  codPendingPaisa:    number;
  categorySales:      CategorySaleLine[];
  openingCashPaisa:   number;
  expectedCashPaisa:  number;
  actualCashPaisa?:   number;
  variance?:          number;
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface OpenTillDTO {
  orgId:       string;
  cityId:      string;
  branchId:    string;
  terminalId:  string;
  openedBy:    string;
  denominations: DenominationEntry[];
  notes?:      string;
}

export interface CloseTillDTO {
  sessionId:    string;
  closedBy:     string;
  denominations: DenominationEntry[];
  notes?:       string;
}
