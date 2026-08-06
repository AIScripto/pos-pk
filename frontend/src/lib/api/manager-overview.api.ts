import { api } from './client';

export interface ManagerOverview {
  branch: {
    id: string;
    name: string;
    label: string;
  };
  businessDate: string;
  operations: {
    businessDay: {
      id: string;
      businessDate: string;
      status: string;
      openedAt: string;
      openedByName: string;
    } | null;
    shiftSession: {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      status: string;
      openedAt: string;
      openedByName: string;
    } | null;
    suggestedBusinessDate: string;
    suggestedShift: {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
    } | null;
  };
  totals: {
    openTills: number;
    pendingCloseTills: number;
    totalOrders: number;
    currentSale: number;
    kitchenActiveOrders: number;
  };
  tills: {
    sessionId: string;
    terminalId: string;
    terminalName: string;
    terminalCode: string | null;
    openedBy: string;
    openedAt: string;
    shiftName: string | null;
    businessDate: string;
    orderCount: number;
    currentSale: number;
  }[];
  pendingCloseTills: {
    sessionId: string;
    terminalId: string;
    terminalName: string;
    terminalCode: string | null;
    openedBy: string;
    openedAt: string;
    submittedAt: string | null;
    shiftName: string | null;
    closingCashPaisa: number | null;
    variance: number | null;
    notes: string | null;
  }[];
  kitchen: {
    statusCounts: Record<string, number>;
    orders: {
      id: string;
      orderNumber: string;
      orderType: string;
      status: string;
      terminalId: string;
      cashierName: string;
      placedAt: string;
      itemCount: number;
      items: {
        id: string;
        productName: string;
        quantity: number;
        status: string;
      }[];
    }[];
  };
}

export interface ClosingTotals {
  invoiceCount: number;
  grossSalesPaisa: number;
  netSalesPaisa: number;
  totalDiscountPaisa: number;
  totalTaxPaisa: number;
  cashSalesPaisa: number;
  cardSalesPaisa: number;
  walletSalesPaisa: number;
  codPendingPaisa: number;
  openingCashPaisa: number;
  expectedCashPaisa: number;
  actualCashPaisa: number;
  variancePaisa: number;
  openTills: number;
  pendingCloseTills: number;
  closedTills: number;
}

export interface ClosingTillLine {
  sessionId: string;
  terminalName: string;
  terminalCode: string | null;
  openedByName: string;
  status: string;
  openedAt: string;
  closeSubmittedAt: string | null;
  approvedAt: string | null;
  invoiceCount: number;
  grossSalesPaisa: number;
  cashSalesPaisa: number;
  openingCashPaisa: number;
  expectedCashPaisa: number;
  actualCashPaisa: number | null;
  variancePaisa: number | null;
}

export interface ShiftClosingSummary {
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    status: string;
    openedAt: string;
    openedByName?: string;
    closedAt?: string | null;
  };
  totals: ClosingTotals;
  tills: ClosingTillLine[];
}

export interface BusinessDayClosingSummary {
  businessDay: {
    id: string;
    businessDate: string;
    status: string;
    openedAt: string;
    openedByName: string;
  };
  totals: ClosingTotals;
  tills: ClosingTillLine[];
  shifts: ShiftClosingSummary[];
}

export const managerOverviewApi = {
  overview(branchId?: string) {
    return api.get<ManagerOverview>('/admin/manager/overview', { branchId });
  },

  currentOperations(branchId?: string) {
    return api.get<ManagerOverview['operations']>('/admin/manager/operations/current', { branchId });
  },

  shiftSummary(branchId?: string) {
    return api.get<ShiftClosingSummary>('/admin/manager/shift/summary', { branchId });
  },

  businessDaySummary(branchId?: string) {
    return api.get<BusinessDayClosingSummary>('/admin/manager/business-day/summary', { branchId });
  },

  openBusinessDay(branchId: string) {
    return api.post<unknown>('/admin/manager/business-day/open', { branchId });
  },

  closeBusinessDay(branchId: string, notes?: string) {
    return api.post<unknown>('/admin/manager/business-day/close', { branchId, notes });
  },

  openShift(branchId: string, shiftTemplateId?: string) {
    return api.post<unknown>('/admin/manager/shift/open', { branchId, shiftTemplateId });
  },

  closeShift(branchId: string, notes?: string) {
    return api.post<unknown>('/admin/manager/shift/close', { branchId, notes });
  },

  approveTillClose(sessionId: string, notes?: string) {
    return api.post<unknown>(`/admin/manager/tills/${sessionId}/approve-close`, { notes });
  },

  rejectTillClose(sessionId: string, notes?: string) {
    return api.post<unknown>(`/admin/manager/tills/${sessionId}/reject-close`, { notes });
  },

  forceCloseTill(sessionId: string, notes?: string) {
    return api.post<unknown>(`/admin/manager/tills/${sessionId}/force-close`, { notes });
  },
};
