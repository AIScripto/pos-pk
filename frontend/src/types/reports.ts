import { Category, Invoice } from '@/types/pos';

export type ReportDatasetMode = 'combined' | 'live' | 'demo';
export type ReportRangeKey = 'today' | '7d' | '30d' | '90d' | 'custom';
export type ReportTrendGrouping = 'day' | 'weekday' | 'hour';
export type ReportRankingMetric = 'revenue' | 'quantity' | 'discount';
export type ReportCategoryFilter = Category | 'all';
export type ReportItemKind = 'product' | 'deal';
export type ReportPaymentGroup = 'cash' | 'credit' | 'wallet' | 'pending';

export interface ManagerReportFilters {
  dataset: ReportDatasetMode;
  range: ReportRangeKey;
  startDate: string;
  endDate: string;
  category: ReportCategoryFilter;
  trendGrouping: ReportTrendGrouping;
  rankingMetric: ReportRankingMetric;
  includeDeals: boolean;
}

export interface ReportMetricSummary {
  revenue: number;
  grossSales: number;
  discounts: number;
  orders: number;
  itemsSold: number;
  avgOrderValue: number;
  avgItemsPerOrder: number;
  discountRate: number;
  /** Total tax collected across all visible orders (invoice-level, post-discount). */
  totalTax: number;
  /** The tax rate used (from TAX_CONFIG). 0 when tax is disabled. */
  taxRate: number;
  cashTotal: number;
  cardTotal: number;
  walletTotal: number;
  pendingTotal: number;
  productRevenue: number;
  dealRevenue: number;
  productQuantity: number;
  dealQuantity: number;
}

export interface ReportTrendPoint {
  label: string;
  revenue: number;
  orders: number;
  discounts: number;
  itemsSold: number;
  /** Tax collected within this trend bucket. */
  tax: number;
  sortValue: number;
}

export interface ReportCategorySummary {
  category: Category;
  label: string;
  revenue: number;
  discounts: number;
  quantity: number;
  orderCount: number;
  share: number;
}

export interface ReportItemSummary {
  itemKey: string;
  name: string;
  category: Category;
  itemKind: ReportItemKind;
  quantity: number;
  revenue: number;
  discounts: number;
  orderCount: number;
  share: number;
}

export interface ReportHourSummary {
  hour: string;
  revenue: number;
  quantity: number;
  orderCount: number;
}

export interface ReportOrderSummary {
  id: string;
  date: Date;
  revenue: number;
  discounts: number;
  /** Tax amount taken from the stored invoice snapshot. */
  taxAmount: number;
  /** Grand total including tax (revenue + taxAmount). */
  grandTotal: number;
  itemCount: number;
  source: 'live' | 'demo';
  paymentMethod: string;
  paymentStatus: string;
}

export interface ReportPaymentSummary {
  group: ReportPaymentGroup;
  label: string;
  amount: number;
  orderCount: number;
  share: number;
}

export interface ManagerReportSnapshot {
  sourceInvoices: Invoice[];
  visibleInvoices: ReportOrderSummary[];
  metrics: ReportMetricSummary;
  trend: ReportTrendPoint[];
  categories: ReportCategorySummary[];
  topItems: ReportItemSummary[];
  productItems: ReportItemSummary[];
  dealItems: ReportItemSummary[];
  payments: ReportPaymentSummary[];
  hourly: ReportHourSummary[];
  tillSummaries: ReportTillSummary[];
  tillDateSummaries: ReportTillDateSummary[];
  meta: {
    datasetLabel: string;
    windowLabel: string;
    dateRangeLabel: string;
    categoryLabel: string;
    topCategoryLabel: string;
    bestHourLabel: string;
    bestItemLabel: string;
  };
}

export interface ReportTillSummary {
  terminalId: string;
  terminalName: string;
  revenue: number;
  discounts: number;
  quantity: number;
  orderCount: number;
  share: number;
}

export interface ReportTillDateSummary {
  dateLabel: string;
  terminalId: string;
  terminalName: string;
  revenue: number;
  discounts: number;
  quantity: number;
  orderCount: number;
}
