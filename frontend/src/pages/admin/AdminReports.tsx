// =============================================================================
// AdminReports — reporting workspace
// =============================================================================

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, Loader2, MessageSquareText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { tillConfigApi } from '@/lib/api/till-config.api';
import { ManagerReportDashboard } from '@/components/reports/ManagerReportDashboard';
import { ManagerReportFilters as ManagerReportFilterBar } from '@/components/reports/ManagerReportFilters';
import { ManagerReportTablePanel, type ManagerReportTableTab } from '@/components/reports/ManagerReportTablePanel';
import { SalesInsightAssistant } from '@/components/reports/assistant/SalesInsightAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { invoiceApi, type ApiInvoice, type ApiInvoiceItem } from '@/lib/api/invoice.api';
import { buildManagerReport } from '@/utils/reports';
import { exportManagerReportToCsv, exportManagerReportToExcel, exportManagerReportToPdf } from '@/utils/reportExport';
import type { Category, Deal, Invoice, PaymentAllocation, PaymentMethod, Product } from '@/types/pos';
import type { ManagerReportFilters as ReportFilters } from '@/types/reports';

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

const defaultFilters: ReportFilters = {
  dataset: 'live',
  range: '30d',
  startDate: toDateInput(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)),
  endDate: toDateInput(new Date()),
  category: 'all',
  trendGrouping: 'day',
  rankingMetric: 'revenue',
  includeDeals: true,
};

const reportCategories: Category[] = ['burgers', 'wraps', 'chicken', 'fries', 'drinks', 'deals'];

const normaliseCategory = (value: string): Category => {
  const normalised = value.toLowerCase().replace(/[^a-z]/g, '');
  return reportCategories.find((category) => normalised.includes(category.replace(/s$/, ''))) ?? 'deals';
};

const parseAllocations = (value: unknown): PaymentAllocation[] | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) return value as PaymentAllocation[];
  if (typeof value !== 'string') return undefined;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as PaymentAllocation[] : undefined;
  } catch {
    return undefined;
  }
};

const apiItemToCartItem = (item: ApiInvoiceItem) => {
  const unitPrice = item.unitPricePaisa / 100;
  const code = item.sku ?? item.productCode ?? '';
  const base = {
    id: item.id,
    quantity: item.quantity,
    discountPercent: item.discountPercent ?? 0,
    lumpSumDiscount: (item.lumpDiscountPaisa ?? item.discountPaisa ?? 0) / 100,
  };

  if (item.isDeal || item.dealId) {
    const deal: Deal = {
      id: item.dealId ?? item.id,
      name: item.productName,
      code,
      price: unitPrice,
      originalPrice: unitPrice,
      products: [],
      image: '',
    };
    return { ...base, deal };
  }

  const product: Product = {
    id: item.productId ?? item.id,
    name: item.productName,
    code,
    price: unitPrice,
    category: normaliseCategory(item.category),
    image: '',
  };
  return { ...base, product };
};

const apiInvoiceToReportInvoice = (invoice: ApiInvoice): Invoice => ({
  id: invoice.invoiceNumber || invoice.id,
  date: new Date(invoice.date),
  items: invoice.items.map(apiItemToCartItem),
  subtotal: invoice.subtotalPaisa / 100,
  totalDiscount: invoice.totalDiscountPaisa / 100,
  preTaxTotal: (invoice.subtotalPaisa - invoice.totalDiscountPaisa) / 100,
  taxRate: invoice.taxPaisa > 0 && invoice.subtotalPaisa > 0
    ? Number(((invoice.taxPaisa / Math.max(1, invoice.subtotalPaisa - invoice.totalDiscountPaisa)) * 100).toFixed(2))
    : 0,
  taxAmount: invoice.taxPaisa / 100,
  grandTotal: invoice.grandTotalPaisa / 100,
  customer: invoice.customerName || invoice.customerPhone ? {
    customerId: invoice.customerId,
    name: invoice.customerName ?? '',
    phone: invoice.customerPhone ?? '',
    loyaltyPointsBeforeOrder: 0,
    loyaltyPointsEarned: 0,
    loyaltyPointsAfterOrder: 0,
  } : null,
  paymentMethod: invoice.paymentMethod as PaymentMethod,
  paymentStatus: invoice.paymentStatus as Invoice['paymentStatus'],
  paidAt: invoice.paymentStatus === 'paid' ? new Date(invoice.date) : null,
  paymentAllocations: parseAllocations(invoice.allocationsJson),
  terminalId: invoice.terminalId,
});

function ReportWorkspaceHeader({
  activePanel,
  onPanelChange,
}: {
  activePanel: 'performance' | 'assistant';
  onPanelChange: (panel: 'performance' | 'assistant') => void;
}) {
  return (
    <div className="relative flex-shrink-0 border-b border-border bg-card shadow-sm">
      <div className="relative flex items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20 text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground">Reports & Sales Intelligence</h1>
            <p className="text-[11px] font-medium text-muted-foreground">Date-range reporting · Products and deals · Cash and credit analysis</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPanelChange('performance')}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold transition-all ${
              activePanel === 'performance'
                ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                : 'border-border bg-secondary text-muted-foreground hover:bg-secondary'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Sales report
          </button>
          <button
            onClick={() => onPanelChange('assistant')}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold transition-all ${
              activePanel === 'assistant'
                ? 'border-primary bg-primary text-white shadow-sm shadow-primary/20'
                : 'border-border bg-secondary text-muted-foreground hover:bg-secondary'
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5" /> Insight assistant
          </button>
        </div>
      </div>
    </div>
  );
}

function SalesPerformancePanel({
  filters,
  onFiltersChange,
  reportView,
  onReportViewChange,
  tableTab,
  onTableTabChange,
}: {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  reportView: 'visual' | 'tabular';
  onReportViewChange: (view: 'visual' | 'tabular') => void;
  tableTab: ManagerReportTableTab;
  onTableTabChange: (tab: ManagerReportTableTab) => void;
}) {
  const { user } = useAuth();
  const branchId = user?.branchId || user?.branchIds?.[0] || '';

  const { data: invoiceResult, isLoading, error } = useQuery({
    queryKey: ['admin-report-invoices'],
    queryFn: () => invoiceApi.list({ page: 1, limit: 1000 }),
  });

  const { data: tillConfigs = [] } = useQuery({
    queryKey: ['admin-report-tills', branchId],
    queryFn: () => tillConfigApi.listTills(branchId),
    enabled: !!branchId,
  });

  const tillMap = useMemo(() => {
    const map: Record<string, string> = {
      'DEMO-TILL-01': 'Till 1',
      'DEMO-TILL-02': 'Till 2',
    };
    tillConfigs.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [tillConfigs]);

  const reportInvoices = useMemo(
    () => (invoiceResult ?? []).map(apiInvoiceToReportInvoice),
    [invoiceResult],
  );

  const report = useMemo(
    () => buildManagerReport(reportInvoices, filters),
    [reportInvoices, filters],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-background px-6 py-4">
      <div className="mx-auto max-w-[1600px] space-y-3">
        <div className="rounded-lg border border-border/70 bg-card/90 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-primary/75">Comprehensive report</p>
              <h2 className="mt-1 text-lg font-bold text-foreground">Sales performance by selected date range</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tracks product and deal revenue, order value, tax, cash collection, credit/card collection, wallet, and pending COD.
              </p>
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>
          {error && (
            <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning-text">
              Live invoices could not be loaded. Switch the dataset filter to sample data to preview the report layout.
            </div>
          )}
        </div>

        <ManagerReportFilterBar
          filters={filters}
          onChange={onFiltersChange}
          onExportCsv={() => exportManagerReportToCsv(report)}
          onExportExcel={() => exportManagerReportToExcel(report)}
          onExportPdf={() => exportManagerReportToPdf(report)}
        />
        <Tabs value={reportView} onValueChange={(value) => onReportViewChange(value as 'visual' | 'tabular')} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <TabsList className="h-9 rounded-md">
              <TabsTrigger value="visual" className="h-8 text-xs">Visual dashboard</TabsTrigger>
              <TabsTrigger value="tabular" className="h-8 text-xs">Text report tables</TabsTrigger>
            </TabsList>
            <p className="text-xs text-muted-foreground">
              Exports use the same selected filters and date range.
            </p>
          </div>
          <TabsContent value="visual" className="mt-0">
            <ManagerReportDashboard report={report} />
          </TabsContent>
          <TabsContent value="tabular" className="mt-0">
            <ManagerReportTablePanel report={report} activeTab={tableTab} onTabChange={onTableTabChange} tillMap={tillMap} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const activePanel = searchParams.get('panel') === 'assistant' ? 'assistant' : 'performance';
  const reportView = searchParams.get('view') === 'tabular' ? 'tabular' : 'visual';
  const tableTabParam = searchParams.get('tab');
  const tableTab: ManagerReportTableTab =
    tableTabParam === 'details' || tableTabParam === 'hourly' || tableTabParam === 'orders'
      ? (tableTabParam as ManagerReportTableTab)
      : 'summary';

  const updateReportRoute = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    setSearchParams(params);
  };

  const handlePanelChange = (panel: 'performance' | 'assistant') => {
    updateReportRoute(panel === 'assistant'
      ? { panel: 'assistant', view: null, tab: null }
      : { panel: 'performance', view: reportView, tab: reportView === 'tabular' ? tableTab : null });
  };

  const handleReportViewChange = (view: 'visual' | 'tabular') => {
    updateReportRoute({ panel: 'performance', view, tab: view === 'tabular' ? tableTab : null });
  };

  const handleTableTabChange = (tab: ManagerReportTableTab) => {
    updateReportRoute({ panel: 'performance', view: 'tabular', tab });
  };

  return (
    <div className="flex-1 flex min-h-0 flex-col overflow-hidden bg-muted/40 rounded-2xl border border-border shadow-sm">
      <ReportWorkspaceHeader activePanel={activePanel} onPanelChange={handlePanelChange} />

      {activePanel === 'performance' ? (
        <SalesPerformancePanel
          filters={filters}
          onFiltersChange={setFilters}
          reportView={reportView}
          onReportViewChange={handleReportViewChange}
          tableTab={tableTab}
          onTableTabChange={handleTableTabChange}
        />
      ) : (
        <SalesInsightAssistant />
      )}
    </div>
  );
}
