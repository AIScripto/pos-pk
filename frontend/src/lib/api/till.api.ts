import { api } from './client';

export interface ApiTillSession {
  id:               string;
  orgId:            string;
  cityId:           string;
  branchId:         string;
  terminalId:       string;
  shiftTemplateId:  string | null;
  shiftName:        string | null;
  businessDate:     string;
  openedBy:         string;
  openedByName:     string;
  openedAt:         string;
  closedAt:         string | null;
  closedBy:         string | null;
  closeSubmittedAt?: string | null;
  status:           'open' | 'pending_close_approval' | 'closed';
  openingCashAmount?: number;
  closingCashAmount?: number | null;
  cashVarianceAmount?: number | null;
  openingCashPaisa?: number;
  closingCashPaisa?: number | null;
  variance?:         number | null;
  notes:            string | null;
}

export interface ApiTillSummary {
  session:            ApiTillSession;
  grossSalesPaisa:    number;
  netSalesPaisa:      number;
  totalDiscountPaisa: number;
  totalTaxPaisa:      number;
  totalTransactions:  number;
  totalCovers:        number;
  cashSalesPaisa:     number;
  cardSalesPaisa:     number;
  walletSalesPaisa:   number;
  codPendingPaisa:    number;
  openingCashAmount?:   number;
  expectedCashAmount?:  number;
  actualCashAmount?:    number | undefined;
  cashVarianceAmount?:  number | undefined;
  openingCashPaisa?:    number;
  expectedCashPaisa?:   number;
  actualCashPaisa?:     number | undefined;
  variance?:            number | undefined;
  categorySales: {
    category:         string;
    totalSalesPaisa:  number;
    itemCount:        number;
    transactionCount: number;
  }[];
}

/**
 * A counted denomination line as the till API accepts it.
 *
 * The server schema takes either `value` (what this client sends) or
 * `denomination`, and passes extra keys through. This interface previously
 * declared only `{ denomination, count }`, so every call site had to cast its
 * real `DenominationEntry` through `any` to get past the compiler.
 */
export interface DenominationPayload {
  value?:        number;
  denomination?: number;
  label?:        string;
  count:         number;
  total?:        number;
}

export interface OpenTillInput {
  terminalId:       string;
  openingCashAmount: number;
  denominations?:   DenominationPayload[];
  notes?:           string;
}

export interface CloseTillInput {
  sessionId:        string;
  closingCashAmount: number;
  denominations?:   DenominationPayload[];
  notes?:           string;
}

export interface OpsStatus {
  businessDayOpen: boolean;
  shiftOpen:       boolean;
  businessDate:    string;
  shiftName:       string | null;
  shiftStartTime:  string | null;
  shiftEndTime:    string | null;
  suggestedShift:  { name: string; startTime: string; endTime: string } | null;
}

export const tillApi = {
  /** Cashier-accessible status check — is the day and shift open? */
  opsStatus(branchId: string) {
    return api.get<OpsStatus>('/till/ops-status', { branchId });
  },

  current(terminalId: string) {
    return api.get<ApiTillSession | null>('/till/current', { terminalId });
  },

  open(input: OpenTillInput) {
    return api.post<ApiTillSession>('/till/open', input);
  },

  close(input: CloseTillInput) {
    return api.post<ApiTillSession>('/till/close', input);
  },

  summary(sessionId: string) {
    return api.get<ApiTillSummary>(`/till/summary/${sessionId}`);
  },

  history(branchId: string, limit = 20) {
    return api.get<ApiTillSession[]>('/till/history', { branchId, limit });
  },
};
