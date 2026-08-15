import {
  Clock3,
  Layers3,
  ReceiptText,
  Tag,
  TrendingUp,
  BadgePercent,
  Banknote,
  CreditCard,
  PackageCheck,
} from 'lucide-react';
import { ManagerReportSnapshot } from '@/types/reports';
import { formatCurrency } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { ReportMetricCard } from '../ReportMetricCard';
import { useTranslation } from '@/i18n';

interface ReportMetricGridProps {
  report: ManagerReportSnapshot;
}

export function ReportMetricGrid({ report }: ReportMetricGridProps) {
  const { t } = useTranslation();
  const { metrics, payments, meta } = report;

  return (
    <div className="space-y-4">
      {/* ── Metric Cards ── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard
          title={t.managerReport.revenuePreTax}
          value={formatCurrency(metrics.revenue)}
          hint={`${meta.windowLabel} across ${metrics.orders} tracked orders`}
          icon={TrendingUp}
        />
        <ReportMetricCard
          title={t.managerReport.averageOrder}
          value={formatCurrency(metrics.avgOrderValue)}
          hint={`${metrics.itemsSold} items sold with ${metrics.avgItemsPerOrder.toFixed(1)} items per ticket`}
          icon={ReceiptText}
        />
        <ReportMetricCard
          title={t.managerReport.discountLoad}
          value={`${metrics.discountRate.toFixed(1)}%`}
          hint={`${formatCurrency(metrics.discounts)} discounted from ${formatCurrency(metrics.grossSales)} gross sales`}
          accent="neutral"
          icon={Tag}
        />
        {TAX_CONFIG.enabled ? (
          <ReportMetricCard
            title={`${TAX_CONFIG.label} ${t.managerReport.taxCollected} (${metrics.taxRate}%)`}
            value={formatCurrency(metrics.totalTax)}
            hint={`Total ${TAX_CONFIG.label.toLowerCase()} collected. Grand total incl. tax: ${formatCurrency(TAX_CONFIG.mode === 'inclusive' ? metrics.revenue : metrics.revenue + metrics.totalTax)}`}
            accent="tax"
            icon={BadgePercent}
          />
        ) : (
          <ReportMetricCard
            title={t.managerReport.salesTrend}
            value={meta.bestHourLabel}
            hint={`${meta.topCategoryLabel} leads, with ${meta.bestItemLabel} topping the item list`}
            accent="neutral"
            icon={Clock3}
          />
        )}
      </div>

      {/* ── Product / Deal / Tender Summary ── */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReportMetricCard
          title={t.managerReport.productRevenue}
          value={formatCurrency(metrics.productRevenue)}
          hint={`${metrics.productQuantity} items sold in ${meta.dateRangeLabel}`}
          icon={PackageCheck}
        />
        <ReportMetricCard
          title={t.managerReport.dealRevenue}
          value={formatCurrency(metrics.dealRevenue)}
          hint={`${metrics.dealQuantity} items sold; ${metrics.revenue > 0 ? ((metrics.dealRevenue / metrics.revenue) * 100).toFixed(1) : '0.0'}% of sales`}
          icon={Layers3}
        />
        <ReportMetricCard
          title={t.managerReport.cashCollected}
          value={formatCurrency(metrics.cashTotal)}
          hint={`${payments.find((payment) => payment.group === 'cash')?.share.toFixed(1) ?? '0.0'}% of tendered value`}
          accent="neutral"
          icon={Banknote}
        />
        <ReportMetricCard
          title={t.managerReport.creditCard}
          value={formatCurrency(metrics.cardTotal)}
          hint={`${payments.find((payment) => payment.group === 'credit')?.share.toFixed(1) ?? '0.0'}% of tendered value`}
          accent="tax"
          icon={CreditCard}
        />
      </div>
    </div>
  );
}

