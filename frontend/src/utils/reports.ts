import { categoryLabels } from '@/data/products';
import { demoReportInvoices } from '@/data/reportDemo';
import {
  ManagerReportFilters,
  ManagerReportSnapshot,
  ReportCategorySummary,
  ReportHourSummary,
  ReportItemSummary,
  ReportOrderSummary,
  ReportPaymentGroup,
  ReportPaymentSummary,
  ReportTrendGrouping,
  ReportTrendPoint,
  ReportTillSummary,
  ReportTillDateSummary,
} from '@/types/reports';
import { Category, Invoice } from '@/types/pos';
import { calculateLinePricing } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { getCurrencyConfig } from '@/config/currency';

const rangeToDays: Record<ManagerReportFilters['range'], number> = {
  today: 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  custom: 30,
};

const rangeToLabel: Record<ManagerReportFilters['range'], string> = {
  today: 'Today',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  custom: 'Custom date range',
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Internal per-line-item record used as the aggregation unit. */
interface SaleLine {
  invoiceId: string;
  date: Date;
  category: Category;
  itemKind: 'product' | 'deal';
  itemKey: string;
  itemName: string;
  quantity: number;
  grossSales: number;
  discount: number;
  revenue: number;
  source: 'live' | 'demo';
  terminalId: string;
}

/** Invoice-level tax index — keyed by invoiceId. */
interface InvoiceTaxRecord {
  taxAmount: number;
  grandTotal: number;
  taxRate: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentAllocations?: TaggedInvoice['paymentAllocations'];
}

interface ReportDateWindow {
  start: Date;
  end: Date;
  label: string;
}

const formatDayKey = (date: Date) =>
  date.toLocaleDateString(getCurrencyConfig().locale, { month: 'short', day: 'numeric' });

const formatHourKey = (hour: number) =>
  `${hour.toString().padStart(2, '0')}:00`;

// ---------------------------------------------------------------------------
// Data source helpers
// ---------------------------------------------------------------------------

type TaggedInvoice = Invoice & { source: 'live' | 'demo' };

const getReportInvoices = (
  liveInvoices: Invoice[],
  dataset: ManagerReportFilters['dataset'],
): TaggedInvoice[] => {
  switch (dataset) {
    case 'live':
      return liveInvoices.map((invoice) => ({ ...invoice, source: 'live' as const }));
    case 'demo':
      return demoReportInvoices.map((invoice) => ({ ...invoice, source: 'demo' as const }));
    default:
      return [
        ...demoReportInvoices.map((invoice) => ({ ...invoice, source: 'demo' as const })),
        ...liveInvoices.map((invoice) => ({ ...invoice, source: 'live' as const })),
      ];
  }
};

// ---------------------------------------------------------------------------
// Tax index — built from invoices (tax is per-invoice, not per line-item)
// ---------------------------------------------------------------------------

const buildTaxIndex = (invoices: TaggedInvoice[]): Map<string, InvoiceTaxRecord> => {
  const index = new Map<string, InvoiceTaxRecord>();
  invoices.forEach((invoice) => {
    index.set(invoice.id, {
      taxAmount: invoice.taxAmount ?? 0,
      grandTotal: invoice.grandTotal,
      taxRate: invoice.taxRate ?? 0,
      paymentMethod: invoice.paymentMethod ?? 'cash',
      paymentStatus: invoice.paymentStatus ?? 'paid',
      paymentAllocations: invoice.paymentAllocations,
    });
  });
  return index;
};

// ---------------------------------------------------------------------------
// Flatten invoices → line items
// ---------------------------------------------------------------------------

const toSaleLines = (invoices: TaggedInvoice[]): SaleLine[] =>
  invoices.flatMap((invoice) =>
    invoice.items.map((item) => {
      const pricing = calculateLinePricing(item);
      const itemKind = item.deal ? 'deal' : 'product';
      const category = itemKind === 'deal' ? 'deals' : (item.product?.category ?? 'deals');
      const itemKey = item.deal
        ? `deal:${item.deal.id}`
        : `product:${item.product?.id ?? item.id}`;
      const itemName = item.deal?.name ?? item.product?.name ?? 'Unknown item';

      return {
        invoiceId: invoice.id,
        date: invoice.date,
        category,
        itemKind,
        itemKey,
        itemName,
        quantity: item.quantity,
        grossSales: pricing.subtotal,
        discount: pricing.discount,
        revenue: pricing.total,
        source: invoice.source,
        terminalId: invoice.terminalId || 'unknown',
      };
    }),
  );

// ---------------------------------------------------------------------------
// Filter lines by date range and category
// ---------------------------------------------------------------------------

const getDateWindow = (filters: ManagerReportFilters): ReportDateWindow => {
  if (filters.range === 'custom' && filters.startDate && filters.endDate) {
    const start = new Date(`${filters.startDate}T00:00:00`);
    const end = new Date(`${filters.endDate}T23:59:59.999`);
    return {
      start,
      end,
      label: `${filters.startDate} to ${filters.endDate}`,
    };
  }

  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (rangeToDays[filters.range] - 1));

  return {
    start,
    end,
    label: rangeToLabel[filters.range],
  };
};

const filterLines = (lines: SaleLine[], filters: ManagerReportFilters): SaleLine[] => {
  const window = getDateWindow(filters);

  return lines.filter((line) => {
    if (line.date < window.start || line.date > window.end) return false;
    if (!filters.includeDeals && line.category === 'deals') return false;
    if (filters.category !== 'all' && line.category !== filters.category) return false;
    return true;
  });
};

// ---------------------------------------------------------------------------
// Order summaries — carries tax from the invoice-level tax index
// ---------------------------------------------------------------------------

const buildOrderSummaries = (
  lines: SaleLine[],
  taxIndex: Map<string, InvoiceTaxRecord>,
): ReportOrderSummary[] => {
  const orderMap = new Map<string, ReportOrderSummary>();

  lines.forEach((line) => {
    const existing = orderMap.get(line.invoiceId);
    if (existing) {
      existing.revenue += line.revenue;
      existing.discounts += line.discount;
      existing.itemCount += line.quantity;
      return;
    }

    const taxRecord = taxIndex.get(line.invoiceId);
    orderMap.set(line.invoiceId, {
      id: line.invoiceId,
      date: line.date,
      revenue: line.revenue,
      discounts: line.discount,
      taxAmount: taxRecord?.taxAmount ?? 0,
      grandTotal: taxRecord?.grandTotal ?? line.revenue,
      itemCount: line.quantity,
      source: line.source,
      paymentMethod: taxRecord?.paymentMethod ?? 'cash',
      paymentStatus: taxRecord?.paymentStatus ?? 'paid',
    });
  });

  // After accumulation — grandTotal should reflect revenue + tax (tax is fixed per invoice)
  // Re-derive grandTotal for each order from revenue + stamped taxAmount
  return Array.from(orderMap.values())
    .map((order) => ({
      ...order,
      grandTotal: order.revenue + order.taxAmount,
    }))
    .sort((left, right) => right.date.getTime() - left.date.getTime());
};

// ---------------------------------------------------------------------------
// Trend buckets — tax is distributed proportionally per invoice-bucket
// ---------------------------------------------------------------------------

const buildTrend = (
  lines: SaleLine[],
  grouping: ReportTrendGrouping,
  filters: ManagerReportFilters,
  taxIndex: Map<string, InvoiceTaxRecord>,
): ReportTrendPoint[] => {
  const buckets = new Map<string, ReportTrendPoint>();
  const window = getDateWindow(filters);

  if (grouping === 'hour') {
    for (let hour = 0; hour < 24; hour += 1) {
      const label = formatHourKey(hour);
      buckets.set(label, { label, revenue: 0, orders: 0, discounts: 0, itemsSold: 0, tax: 0, sortValue: hour });
    }
  } else if (grouping === 'weekday') {
    weekdayLabels.forEach((label, index) => {
      buckets.set(label, { label, revenue: 0, orders: 0, discounts: 0, itemsSold: 0, tax: 0, sortValue: index });
    });
  } else {
    for (let cursor = new Date(window.start); cursor <= window.end; cursor.setDate(cursor.getDate() + 1)) {
      const label = formatDayKey(cursor);
      buckets.set(label, {
        label,
        revenue: 0,
        orders: 0,
        discounts: 0,
        itemsSold: 0,
        tax: 0,
        sortValue: new Date(cursor).getTime(),
      });
    }
  }

  // Track which invoices have already had their tax counted in a given bucket
  const orderTracker = new Map<string, Set<string>>();
  const taxTracker = new Map<string, Set<string>>(); // bucket key → set of invoiceIds already taxed

  lines.forEach((line) => {
    const key =
      grouping === 'hour'
        ? formatHourKey(line.date.getHours())
        : grouping === 'weekday'
          ? weekdayLabels[line.date.getDay()]
          : formatDayKey(line.date);

    const bucket = buckets.get(key);
    if (!bucket) return;

    bucket.revenue += line.revenue;
    bucket.discounts += line.discount;
    bucket.itemsSold += line.quantity;

    // Count unique orders
    const trackedOrders = orderTracker.get(key) ?? new Set<string>();
    trackedOrders.add(line.invoiceId);
    orderTracker.set(key, trackedOrders);
    bucket.orders = trackedOrders.size;

    // Accumulate invoice-level tax once per invoice per bucket
    const taxed = taxTracker.get(key) ?? new Set<string>();
    if (!taxed.has(line.invoiceId)) {
      taxed.add(line.invoiceId);
      taxTracker.set(key, taxed);
      bucket.tax += taxIndex.get(line.invoiceId)?.taxAmount ?? 0;
    }
  });

  return Array.from(buckets.values()).sort((left, right) => left.sortValue - right.sortValue);
};

// ---------------------------------------------------------------------------
// Category summaries
// ---------------------------------------------------------------------------

const buildCategorySummaries = (lines: SaleLine[], totalRevenue: number): ReportCategorySummary[] => {
  const map = new Map<Category, ReportCategorySummary>();

  lines.forEach((line) => {
    const current = map.get(line.category) ?? {
      category: line.category,
      label: categoryLabels[line.category],
      revenue: 0,
      discounts: 0,
      quantity: 0,
      orderCount: 0,
      share: 0,
    };

    current.revenue += line.revenue;
    current.discounts += line.discount;
    current.quantity += line.quantity;
    current.orderCount += 1;
    map.set(line.category, current);
  });

  return Array.from(map.values())
    .map((summary) => ({
      ...summary,
      share: totalRevenue > 0 ? (summary.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((left, right) => right.revenue - left.revenue);
};

// ---------------------------------------------------------------------------
// Top items
// ---------------------------------------------------------------------------

const buildTopItems = (
  lines: SaleLine[],
  metric: ManagerReportFilters['rankingMetric'],
): ReportItemSummary[] => {
  const map = new Map<string, ReportItemSummary>();

  lines.forEach((line) => {
    const current = map.get(line.itemKey) ?? {
      itemKey: line.itemKey,
      name: line.itemName,
      category: line.category,
      itemKind: line.itemKind,
      quantity: 0,
      revenue: 0,
      discounts: 0,
      orderCount: 0,
      share: 0,
    };

    current.quantity += line.quantity;
    current.revenue += line.revenue;
    current.discounts += line.discount;
    current.orderCount += 1;
    map.set(line.itemKey, current);
  });

  const totalRevenue = lines.reduce((sum, line) => sum + line.revenue, 0);

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      share: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((left, right) => right[metric] - left[metric]);
};

// ---------------------------------------------------------------------------
// Payment tender breakdown
// ---------------------------------------------------------------------------

const getPaymentGroup = (method: string, status: string): ReportPaymentGroup => {
  if (status === 'pending' || method.includes('on-delivery')) return 'pending';
  if (method === 'card' || method === 'credit' || method === 'card-on-delivery') return 'credit';
  if (method === 'wallet') return 'wallet';
  return 'cash';
};

const paymentLabel: Record<ReportPaymentGroup, string> = {
  cash: 'Cash',
  credit: 'Credit / Card',
  wallet: 'Wallet',
  pending: 'Pending COD',
};

const buildPaymentSummaries = (
  visibleInvoiceIds: Set<string>,
  taxIndex: Map<string, InvoiceTaxRecord>,
): ReportPaymentSummary[] => {
  const map = new Map<ReportPaymentGroup, ReportPaymentSummary>();

  visibleInvoiceIds.forEach((invoiceId) => {
    const invoice = taxIndex.get(invoiceId);
    if (!invoice) return;

    const allocations = invoice.paymentAllocations?.length
      ? invoice.paymentAllocations
      : [{ method: invoice.paymentMethod as never, amount: invoice.grandTotal }];

    allocations.forEach((allocation) => {
      const group = getPaymentGroup(String(allocation.method), invoice.paymentStatus);
      const current = map.get(group) ?? {
        group,
        label: paymentLabel[group],
        amount: 0,
        orderCount: 0,
        share: 0,
      };

      current.amount += allocation.amount;
      current.orderCount += 1;
      map.set(group, current);
    });
  });

  const total = Array.from(map.values()).reduce((sum, payment) => sum + payment.amount, 0);
  return (['cash', 'credit', 'wallet', 'pending'] as ReportPaymentGroup[])
    .map((group) => map.get(group) ?? {
      group,
      label: paymentLabel[group],
      amount: 0,
      orderCount: 0,
      share: 0,
    })
    .map((payment) => ({
      ...payment,
      share: total > 0 ? (payment.amount / total) * 100 : 0,
    }));
};

// ---------------------------------------------------------------------------
// Hourly breakdown
// ---------------------------------------------------------------------------

const buildHourlyBreakdown = (lines: SaleLine[]): ReportHourSummary[] => {
  const hours = Array.from({ length: 24 }, (_, hour) => ({
    hour: formatHourKey(hour),
    revenue: 0,
    quantity: 0,
    orderCount: 0,
    orderIds: new Set<string>(),
  }));

  lines.forEach((line) => {
    const bucket = hours[line.date.getHours()];
    bucket.revenue += line.revenue;
    bucket.quantity += line.quantity;
    bucket.orderIds.add(line.invoiceId);
    bucket.orderCount = bucket.orderIds.size;
  });

  return hours.map(({ orderIds, ...hour }) => hour);
};

// ---------------------------------------------------------------------------
// Till breakdown
// ---------------------------------------------------------------------------

const buildTillSummaries = (lines: SaleLine[], totalRevenue: number): ReportTillSummary[] => {
  const map = new Map<string, ReportTillSummary>();

  lines.forEach((line) => {
    const current = map.get(line.terminalId) ?? {
      terminalId: line.terminalId,
      terminalName: '',
      revenue: 0,
      discounts: 0,
      quantity: 0,
      orderCount: 0,
      share: 0,
    };

    current.revenue += line.revenue;
    current.discounts += line.discount;
    current.quantity += line.quantity;
    map.set(line.terminalId, current);
  });

  const terminalInvoices = new Map<string, Set<string>>();
  lines.forEach((line) => {
    const set = terminalInvoices.get(line.terminalId) ?? new Set<string>();
    set.add(line.invoiceId);
    terminalInvoices.set(line.terminalId, set);
  });

  return Array.from(map.values())
    .map((summary) => {
      const orders = terminalInvoices.get(summary.terminalId)?.size ?? 0;
      return {
        ...summary,
        orderCount: orders,
        share: totalRevenue > 0 ? (summary.revenue / totalRevenue) * 100 : 0,
      };
    })
    .sort((left, right) => right.revenue - left.revenue);
};

const buildTillDateSummaries = (lines: SaleLine[]): ReportTillDateSummary[] => {
  const map = new Map<string, ReportTillDateSummary>();

  lines.forEach((line) => {
    const dateLabel = line.date.toISOString().slice(0, 10);
    const key = `${line.terminalId}_${dateLabel}`;

    const current = map.get(key) ?? {
      dateLabel,
      terminalId: line.terminalId,
      terminalName: '',
      revenue: 0,
      discounts: 0,
      quantity: 0,
      orderCount: 0,
    };

    current.revenue += line.revenue;
    current.discounts += line.discount;
    current.quantity += line.quantity;
    map.set(key, current);
  });

  const terminalDateInvoices = new Map<string, Set<string>>();
  lines.forEach((line) => {
    const dateLabel = line.date.toISOString().slice(0, 10);
    const key = `${line.terminalId}_${dateLabel}`;
    const set = terminalDateInvoices.get(key) ?? new Set<string>();
    set.add(line.invoiceId);
    terminalDateInvoices.set(key, set);
  });

  return Array.from(map.values())
    .map((summary) => {
      const key = `${summary.terminalId}_${summary.dateLabel}`;
      const orders = terminalDateInvoices.get(key)?.size ?? 0;
      return {
        ...summary,
        orderCount: orders,
      };
    })
    .sort((left, right) => right.dateLabel.localeCompare(left.dateLabel) || right.revenue - left.revenue);
};

// ---------------------------------------------------------------------------
// Dataset label helper
// ---------------------------------------------------------------------------

const getDatasetLabel = (dataset: ManagerReportFilters['dataset']) => {
  switch (dataset) {
    case 'live':
      return 'Live POS orders';
    case 'demo':
      return 'Sample manager dataset';
    default:
      return 'Live + sample data';
  }
};

// ---------------------------------------------------------------------------
// Main builder
// ---------------------------------------------------------------------------

export const buildManagerReport = (
  liveInvoices: Invoice[],
  filters: ManagerReportFilters,
): ManagerReportSnapshot => {
  const sourceInvoices = getReportInvoices(liveInvoices, filters.dataset).sort(
    (left, right) => right.date.getTime() - left.date.getTime(),
  );

  // Build invoice-level tax index BEFORE filtering lines
  const taxIndex = buildTaxIndex(sourceInvoices);
  const dateWindow = getDateWindow(filters);

  const saleLines = filterLines(toSaleLines(sourceInvoices), filters);

  // Collect the unique invoiceIds that remain after line-filtering
  const visibleInvoiceIds = new Set(saleLines.map((l) => l.invoiceId));

  const visibleInvoices = buildOrderSummaries(saleLines, taxIndex);

  // Metric totals — revenue/discounts from line items; tax from invoice index
  const revenue = saleLines.reduce((sum, line) => sum + line.revenue, 0);
  const grossSales = saleLines.reduce((sum, line) => sum + line.grossSales, 0);
  const discounts = saleLines.reduce((sum, line) => sum + line.discount, 0);
  const itemsSold = saleLines.reduce((sum, line) => sum + line.quantity, 0);
  const orders = visibleInvoices.length;

  // Sum tax only from invoices that appear in filtered lines
  const totalTax = Array.from(visibleInvoiceIds).reduce(
    (sum, id) => sum + (taxIndex.get(id)?.taxAmount ?? 0),
    0,
  );

  const payments = buildPaymentSummaries(visibleInvoiceIds, taxIndex);
  const cashTotal = payments.find((payment) => payment.group === 'cash')?.amount ?? 0;
  const cardTotal = payments.find((payment) => payment.group === 'credit')?.amount ?? 0;
  const walletTotal = payments.find((payment) => payment.group === 'wallet')?.amount ?? 0;
  const pendingTotal = payments.find((payment) => payment.group === 'pending')?.amount ?? 0;

  // Tax rate is a config-level setting — read from any one invoice or fall back to config
  const taxRate = TAX_CONFIG.enabled ? TAX_CONFIG.defaultRatePercent : 0;

  const categories = buildCategorySummaries(saleLines, revenue);
  const hourly = buildHourlyBreakdown(saleLines);
  const rankedItems = buildTopItems(saleLines, filters.rankingMetric);
  const topItems = rankedItems.slice(0, 8);
  const productItems = rankedItems.filter((item) => item.itemKind === 'product').slice(0, 8);
  const dealItems = rankedItems.filter((item) => item.itemKind === 'deal').slice(0, 8);
  const trend = buildTrend(saleLines, filters.trendGrouping, filters, taxIndex);
  const productRevenue = saleLines
    .filter((line) => line.itemKind === 'product')
    .reduce((sum, line) => sum + line.revenue, 0);
  const dealRevenue = saleLines
    .filter((line) => line.itemKind === 'deal')
    .reduce((sum, line) => sum + line.revenue, 0);
  const productQuantity = saleLines
    .filter((line) => line.itemKind === 'product')
    .reduce((sum, line) => sum + line.quantity, 0);
  const dealQuantity = saleLines
    .filter((line) => line.itemKind === 'deal')
    .reduce((sum, line) => sum + line.quantity, 0);

  return {
    sourceInvoices: sourceInvoices.map(({ source, ...invoice }) => invoice),
    visibleInvoices: visibleInvoices.slice(0, 8),
    metrics: {
      revenue,
      grossSales,
      discounts,
      orders,
      itemsSold,
      avgOrderValue: orders > 0 ? revenue / orders : 0,
      avgItemsPerOrder: orders > 0 ? itemsSold / orders : 0,
      discountRate: grossSales > 0 ? (discounts / grossSales) * 100 : 0,
      totalTax,
      taxRate,
      cashTotal,
      cardTotal,
      walletTotal,
      pendingTotal,
      productRevenue,
      dealRevenue,
      productQuantity,
      dealQuantity,
    },
    trend,
    categories,
    topItems,
    productItems,
    dealItems,
    payments,
    hourly,
    tillSummaries: buildTillSummaries(saleLines, revenue),
    tillDateSummaries: buildTillDateSummaries(saleLines),
    meta: {
      datasetLabel: getDatasetLabel(filters.dataset),
      windowLabel: rangeToLabel[filters.range],
      dateRangeLabel: dateWindow.label,
      categoryLabel:
        filters.category === 'all' ? 'All categories' : categoryLabels[filters.category],
      topCategoryLabel: categories[0]?.label ?? 'No category data',
      bestHourLabel:
        [...hourly].sort((left, right) => right.revenue - left.revenue)[0]?.hour ?? 'No traffic',
      bestItemLabel: topItems[0]?.name ?? 'No item data',
    },
  };
};
