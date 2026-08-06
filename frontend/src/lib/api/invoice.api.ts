import { api } from './client';

export interface ApiInvoiceItem {
  id:            string;
  productId:     string | null;
  dealId?:       string | null;
  productName:   string;
  productCode:   string;
  sku?:          string;
  category:      string;
  isDeal?:       boolean;
  quantity:      number;
  unitPricePaisa: number;
  discountPercent?: number;
  lumpDiscountPaisa?: number;
  discountPaisa:  number;
  lineTotalPaisa: number;
}

export interface ApiInvoice {
  id:                  string;
  orgId:               string;
  cityId:              string;
  branchId:            string;
  terminalId:          string;
  tillSessionId:       string;
  cashierId:           string;
  tableId:             string | null;
  orderType:           string;
  date:                string;
  invoiceNumber?:      string;
  customerId:          string | null;
  customerName:        string | null;
  customerPhone:       string | null;
  subtotalPaisa:       number;
  totalDiscountPaisa:  number;
  taxPaisa:            number;
  grandTotalPaisa:     number;
  paymentMethod:       string;
  paymentStatus:       string;
  allocationsJson?:     unknown;
  orderNotes:          string | null;
  items:               ApiInvoiceItem[];
  createdAt:           string;
}

export interface CreateInvoiceInput {
  branchId?:         string;
  terminalId:        string;
  tillSessionId:     string;
  tableId?:          string;
  orderType:         string;
  customerId?:       string;
  customerName?:     string;
  customerPhone?:    string;
  orderNotes?:       string;
  managerApprovalToken?: string;
  paymentMethod:     string;
  covers?:           number;
  items: {
    productId?:     string;
    dealId?:        string;
    productName:    string;
    productCode?:   string;
    category:       string;
    quantity:       number;
    unitPricePaisa: number;
    discountPercent?: number;
    lumpDiscountPaisa?: number;
    notes?:         string;
  }[];
  lineDiscountPaisa?:  number;
  orderDiscountPaisa?: number;
  loyaltyPointsUsed?:  number;
}

export interface InvoiceListResult {
  invoices: ApiInvoice[];
  total:    number;
  page:     number;
  pages:    number;
}

export const invoiceApi = {
  create(data: CreateInvoiceInput) {
    return api.post<ApiInvoice>('/invoices', data);
  },

  list(params?: { branchId?: string; tillSessionId?: string; page?: number; limit?: number }) {
    return api.get<ApiInvoice[]>('/invoices', params as Record<string, string | number | undefined> | undefined);
  },

  tillSummary(sessionId: string) {
    return api.get<unknown>(`/invoices/till/${sessionId}/summary`);
  },

  voidInvoice(id: string, reason: string) {
    return api.delete<ApiInvoice>(`/invoices/${id}`, { reason });
  },
};
