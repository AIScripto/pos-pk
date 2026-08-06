import { FileText, ListChecks, ReceiptText, Clock, Calculator } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ManagerReportSnapshot } from '@/types/reports';
import { formatCurrency, formatDate } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';

export type ManagerReportTableTab = 'summary' | 'details' | 'hourly' | 'tills' | 'orders';

const categoryLabels: Record<string, string> = {
  burgers: 'Burgers',
  wraps: 'Wraps',
  chicken: 'Chicken',
  fries: 'Fries',
  drinks: 'Drinks',
  deals: 'Deals',
};

function SectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
}

function ReportTable({
  headers,
  rows,
  footer,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
  footer?: Array<string | number>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/70">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              {headers.map((header) => (
                <th key={header} className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? rows.map((row, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/35">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-foreground/85">
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={headers.length} className="px-3 py-8 text-center text-muted-foreground">
                  No rows match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
          {footer && rows.length > 0 && (
            <tfoot className="sticky bottom-0 bg-muted/90 font-bold border-t border-border">
              <tr>
                {footer.map((cell, cellIndex) => (
                  <td key={`footer-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export function ManagerReportTablePanel({
  report,
  activeTab = 'summary',
  onTabChange,
  tillMap = {},
}: {
  report: ManagerReportSnapshot;
  activeTab?: ManagerReportTableTab;
  onTabChange?: (tab: ManagerReportTableTab) => void;
  tillMap?: Record<string, string>;
}) {
  const {
    metrics,
    categories,
    topItems,
    payments,
    trend,
    visibleInvoices,
    hourly,
    tillSummaries = [],
    tillDateSummaries = [],
    meta,
  } = report;

  const summaryRows = [
    ['Total Amount (Gross Sales)', formatCurrency(metrics.grossSales)],
    ['Discount (Discounts Given)', formatCurrency(metrics.discounts)],
    ['Net Amount (Pre-tax Sales)', formatCurrency(metrics.revenue)],
    [`${TAX_CONFIG.label} Tax Collected`, formatCurrency(metrics.totalTax)],
    ['Grand Total (Sales + Tax)', formatCurrency(metrics.revenue + metrics.totalTax)],
    ['Bills Count (Total Orders)', metrics.orders],
    ['Qty (Total Items Sold)', metrics.itemsSold],
    ['Average Bill Amount', formatCurrency(metrics.avgOrderValue)],
    ['Average Items per Bill', metrics.avgItemsPerOrder.toFixed(2)],
    ['Cash Amount', formatCurrency(metrics.cashTotal)],
    ['Card Amount', formatCurrency(metrics.cardTotal)],
    ['Wallet Amount', formatCurrency(metrics.walletTotal)],
    ['Pending Delivery Amount', formatCurrency(metrics.pendingTotal)],
  ];

  const totalPaymentAmt = payments.reduce((sum, p) => sum + p.amount, 0);

  // Top Items Footer calculations
  const totalTopQty = topItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalTopAmount = topItems.reduce((sum, item) => sum + item.revenue + item.discounts, 0);
  const totalTopDisc = topItems.reduce((sum, item) => sum + item.discounts, 0);
  const totalTopNet = topItems.reduce((sum, item) => sum + item.revenue, 0);
  const totalTopOrders = topItems.reduce((sum, item) => sum + item.orderCount, 0);
  const totalTopShare = topItems.reduce((sum, item) => sum + item.share, 0);

  return (
    <div className="rounded-lg border border-border/70 bg-card/90 p-3 shadow-sm">
      <Tabs value={activeTab} onValueChange={(value) => onTabChange?.(value as ManagerReportTableTab)} className="w-full">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/75">Tabular report</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {meta.dateRangeLabel} · {meta.datasetLabel} · {meta.categoryLabel}
            </p>
          </div>
          <TabsList className="h-9 rounded-md">
            <TabsTrigger value="summary" className="h-8 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" /> Summary
            </TabsTrigger>
            <TabsTrigger value="details" className="h-8 gap-1.5 text-xs">
              <ListChecks className="h-3.5 w-3.5" /> Detailed
            </TabsTrigger>
            <TabsTrigger value="hourly" className="h-8 gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" /> Hourly Sales
            </TabsTrigger>
            <TabsTrigger value="tills" className="h-8 gap-1.5 text-xs">
              <Calculator className="h-3.5 w-3.5" /> Till Wise
            </TabsTrigger>
            <TabsTrigger value="orders" className="h-8 gap-1.5 text-xs">
              <ReceiptText className="h-3.5 w-3.5" /> Orders
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="mt-0 space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <div>
              <SectionTitle icon={FileText} title="Executive summary" meta={`${metrics.orders} orders`} />
              <ReportTable headers={['Metric', 'Value']} rows={summaryRows} />
            </div>
            <div>
              <SectionTitle icon={FileText} title="Payment summary" meta={`${payments.length} tender groups`} />
              <ReportTable
                headers={['Payment Mode', 'Amount', 'Bills Count', 'Share %']}
                rows={payments.map((payment) => [
                  payment.label,
                  formatCurrency(payment.amount),
                  payment.orderCount,
                  `${payment.share.toFixed(1)}%`,
                ])}
                footer={[
                  'Total',
                  formatCurrency(totalPaymentAmt),
                  metrics.orders,
                  '100%',
                ]}
              />
            </div>
          </div>
          <div>
            <SectionTitle icon={FileText} title="Category breakdown" />
            <ReportTable
              headers={['Category', 'Amount', 'Disc', 'Net Amount', 'Qty', 'Bills Count', 'Share %']}
              rows={categories.map((category) => [
                category.label,
                formatCurrency(category.revenue + category.discounts),
                formatCurrency(category.discounts),
                formatCurrency(category.revenue),
                category.quantity,
                category.orderCount,
                `${category.share.toFixed(1)}%`,
              ])}
              footer={[
                'Total',
                formatCurrency(metrics.grossSales),
                formatCurrency(metrics.discounts),
                formatCurrency(metrics.revenue),
                metrics.itemsSold,
                categories.reduce((sum, c) => sum + c.orderCount, 0),
                '100%',
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-0 space-y-4">
          <div>
            <SectionTitle icon={ListChecks} title="Product and deal ranking" meta={`Sorted by ${meta.bestItemLabel}`} />
            <ReportTable
              headers={['Item', 'Category', 'Qty', 'Amount', 'Disc', 'Net Amount', 'Bills Count', 'Share %']}
              rows={topItems.map((item) => [
                item.name,
                categoryLabels[item.category] || item.category,
                item.quantity,
                formatCurrency(item.revenue + item.discounts),
                formatCurrency(item.discounts),
                formatCurrency(item.revenue),
                item.orderCount,
                `${item.share.toFixed(1)}%`,
              ])}
              footer={[
                'Total (Top Items)',
                '—',
                totalTopQty,
                formatCurrency(totalTopAmount),
                formatCurrency(totalTopDisc),
                formatCurrency(totalTopNet),
                totalTopOrders,
                `${totalTopShare.toFixed(1)}%`,
              ]}
            />
          </div>
          <div>
            <SectionTitle icon={ListChecks} title="Trend buckets" meta={report.meta.windowLabel} />
            <ReportTable
              headers={['Bucket', 'Amount', 'Disc', 'Net Amount', 'Bills Count', 'Qty', TAX_CONFIG.label]}
              rows={trend.map((bucket) => [
                bucket.label,
                formatCurrency(bucket.revenue + bucket.discounts),
                formatCurrency(bucket.discounts),
                formatCurrency(bucket.revenue),
                bucket.orders,
                bucket.itemsSold,
                formatCurrency(bucket.tax),
              ])}
              footer={[
                'Total',
                formatCurrency(metrics.grossSales),
                formatCurrency(metrics.discounts),
                formatCurrency(metrics.revenue),
                metrics.orders,
                metrics.itemsSold,
                formatCurrency(metrics.totalTax),
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="mt-0">
          <SectionTitle icon={Clock} title="Hourly sales breakdown" meta="Analyzed by hour of day" />
          <ReportTable
            headers={['Hour', 'Bills Count', 'Qty', 'Net Amount']}
            rows={hourly.map((h) => [
              h.hour,
              h.orderCount,
              h.quantity,
              formatCurrency(h.revenue),
            ])}
            footer={[
              'Total',
              metrics.orders,
              metrics.itemsSold,
              formatCurrency(metrics.revenue),
            ]}
          />
        </TabsContent>

        <TabsContent value="tills" className="mt-0 space-y-4">
          <div>
            <SectionTitle icon={Calculator} title="Till performance summary" />
            <ReportTable
              headers={['Till Name', 'Bills Count', 'Qty', 'Amount', 'Disc', 'Net Amount', 'Share %']}
              rows={tillSummaries.map((ts) => [
                tillMap[ts.terminalId] || ts.terminalName || `Till ${ts.terminalId}`,
                ts.orderCount,
                ts.quantity,
                formatCurrency(ts.revenue + ts.discounts),
                formatCurrency(ts.discounts),
                formatCurrency(ts.revenue),
                `${ts.share.toFixed(1)}%`,
              ])}
              footer={[
                'Total',
                metrics.orders,
                metrics.itemsSold,
                formatCurrency(metrics.grossSales),
                formatCurrency(metrics.discounts),
                formatCurrency(metrics.revenue),
                '100%',
              ]}
            />
          </div>
          <div>
            <SectionTitle icon={Calculator} title="Detailed till sales date wise" />
            <ReportTable
              headers={['Date', 'Till Name', 'Bills Count', 'Qty', 'Amount', 'Disc', 'Net Amount']}
              rows={tillDateSummaries.map((tds) => [
                tds.dateLabel,
                tillMap[tds.terminalId] || tds.terminalName || `Till ${tds.terminalId}`,
                tds.orderCount,
                tds.quantity,
                formatCurrency(tds.revenue + tds.discounts),
                formatCurrency(tds.discounts),
                formatCurrency(tds.revenue),
              ])}
              footer={[
                'Total',
                '—',
                metrics.orders,
                metrics.itemsSold,
                formatCurrency(metrics.grossSales),
                formatCurrency(metrics.discounts),
                formatCurrency(metrics.revenue),
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <SectionTitle icon={ReceiptText} title="Invoice detail" meta={`${visibleInvoices.length} filtered invoices`} />
          <ReportTable
            headers={['Bill#', 'Date', 'Source', 'Items Count', 'Amount', 'Disc', TAX_CONFIG.label, 'Net Amount', 'Payment Mode', 'Status']}
            rows={visibleInvoices.map((invoice) => [
              invoice.id,
              formatDate(invoice.date),
              invoice.source === 'live' ? 'Live POS' : 'Sample',
              invoice.itemCount,
              formatCurrency(invoice.revenue + invoice.discounts),
              formatCurrency(invoice.discounts),
              formatCurrency(invoice.taxAmount),
              formatCurrency(invoice.grandTotal),
              invoice.paymentMethod.toUpperCase(),
              invoice.paymentStatus.toUpperCase(),
            ])}
            footer={[
              'Total',
              '—',
              '—',
              visibleInvoices.reduce((sum, inv) => sum + inv.itemCount, 0),
              formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.revenue + inv.discounts, 0)),
              formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.discounts, 0)),
              formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0)),
              formatCurrency(visibleInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)),
              '—',
              '—',
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
