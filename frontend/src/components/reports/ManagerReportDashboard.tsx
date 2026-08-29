import {
  ArrowDownRight,
  Layers3,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManagerReportSnapshot } from '@/types/reports';
import { formatCurrency, formatDate } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { useAppConfig } from '@/context/AppConfigContext';
import { useTranslation, getLocalizedCategoryName } from '@/i18n';
import {
  chartConfig,
  pieColors,
} from './managerReportConfig';
import { ReportMetricGrid } from './dashboard/ReportMetricGrid';
import { ReportChartsSection } from './dashboard/ReportChartsSection';

interface ManagerReportDashboardProps {
  report: ManagerReportSnapshot;
}

export function ManagerReportDashboard({ report }: ManagerReportDashboardProps) {
  const { t, language } = useTranslation();
  const { currencyConfig } = useAppConfig();
  const { metrics, categories, topItems, productItems, dealItems, payments, visibleInvoices, hourly, meta } = report;

  return (
    <div className="space-y-4">
      {/* ── Metric Cards ── */}
      <ReportMetricGrid report={report} />

      {/* ── Trend Chart + Category Mix ── */}
      <ReportChartsSection report={report} />

      {/* ── Tabs ── */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="h-auto rounded-[20px] bg-card/80 p-1.5">
          <TabsTrigger value="performance" className="rounded-md px-4 py-2.5 cursor-pointer">{t.managerReport.tabPerformance}</TabsTrigger>
          <TabsTrigger value="items" className="rounded-md px-4 py-2.5 cursor-pointer">{t.managerReport.tabItems}</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-md px-4 py-2.5 cursor-pointer">{t.managerReport.tabPayments}</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-md px-4 py-2.5 cursor-pointer">{t.managerReport.tabOrders}</TabsTrigger>
        </TabsList>

        {/* ─ Performance Tab ─ */}
        <TabsContent value="performance" className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.grouping}</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.hourlyMomentum}</h3>
              </div>
              <div className="rounded-md bg-info/10 p-3 text-info">
                <Layers3 className="h-5 w-5" />
              </div>
            </div>

            <ChartContainer config={chartConfig} className="mt-4 h-[240px] w-full aspect-auto">
              <BarChart data={hourly} margin={{ left: 12, right: 12, top: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} minTickGap={12} />
                <YAxis tickLine={false} axisLine={false} width={70} tickFormatter={(value) => `$${Math.round(Number(value))}`} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <>
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-semibold text-foreground">
                            {name === 'Revenue' ? formatCurrency(Number(value)) : Number(value).toLocaleString(currencyConfig.locale)}
                          </span>
                        </>
                      )}
                    />
                  }
                />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.ownerNotes}</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.quickTakeaways}</h3>
              </div>
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.managerReport.categoryShareTitle}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.topCategoryLabel}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.managerReport.salesTrend}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.bestHourLabel}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{t.managerReport.topProducts}</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.bestItemLabel}</p>
              </div>
              {TAX_CONFIG.enabled && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/70">
                    {TAX_CONFIG.label} {t.managerReport.taxCollected} ({metrics.taxRate}%)
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(metrics.totalTax)}</p>
                </div>
              )}
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t.admin.categories}</th>
                    <th className="px-3 py-2">{t.managerReport.netRevenue}</th>
                    <th className="px-3 py-2">{t.managerReport.mixOutput}</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.category} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{getLocalizedCategoryName(category.category, language) || category.label}</td>
                      <td className="px-3 py-2 font-mono text-foreground">{formatCurrency(category.revenue)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{category.share.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>


        {/* ─ Items Tab ─ */}
        <TabsContent value="items" className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.ranking}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.topProducts}</h3>
            <div className="mt-4 space-y-3">
              {topItems.map((item, index) => (
                <div key={item.itemKey} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/12 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{getLocalizedCategoryName(item.category, language) || item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-foreground">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} {t.receipt.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.mixOutput}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.revenueDiscountTax}</h3>
            <ChartContainer config={chartConfig} className="mt-4 h-[260px] w-full aspect-auto">
              <BarChart data={categories} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(value) => `$${Math.round(Number(value))}`} />
                <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={110} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <>
                          <span className="text-muted-foreground">{name}</span>
                          <span className="font-mono font-semibold text-foreground">{formatCurrency(Number(value))}</span>
                        </>
                      )}
                    />
                  }
                />
                <Bar dataKey="discounts" fill="var(--color-discounts)" radius={[0, 10, 10, 0]} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)] xl:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.reportsTitle}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.admin.products} & {t.admin.deals}</h3>
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {[
                { title: t.admin.products, rows: productItems },
                { title: t.admin.deals, rows: dealItems },
              ].map((section) => (
                <div key={section.title} className="overflow-hidden rounded-lg border border-border/70">
                  <div className="bg-background/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {section.title}
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-background/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">{t.receipt.itemDescription}</th>
                        <th className="px-3 py-2">{t.receipt.qty}</th>
                        <th className="px-3 py-2">{t.receipt.amount}</th>
                        <th className="px-3 py-2">{t.managerReport.mixOutput}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.length > 0 ? section.rows.map((item) => (
                        <tr key={item.itemKey} className="border-t border-border/60">
                          <td className="px-3 py-2 font-medium text-foreground">{item.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{item.quantity}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-foreground">{formatCurrency(item.revenue)}</td>
                          <td className="px-3 py-2 text-muted-foreground">{item.share.toFixed(1)}%</td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="px-4 py-6 text-xs text-muted-foreground" colSpan={4}>{t.common.noData}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ─ Payments Tab ─ */}
        <TabsContent value="payments" className="grid gap-3 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.paymentBreakdown}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.paymentBreakdown}</h3>
            <ChartContainer config={chartConfig} className="mt-4 h-[240px] w-full aspect-auto">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => (
                        <>
                          <span className="text-muted-foreground">{item.payload.label}</span>
                          <span className="font-mono font-semibold text-foreground">{formatCurrency(Number(value))}</span>
                        </>
                      )}
                    />
                  }
                />
                <Pie data={payments} dataKey="amount" nameKey="label" innerRadius={72} outerRadius={110} paddingAngle={4}>
                  {payments.map((payment, index) => (
                    <Cell key={payment.group} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.receipt.paymentMode}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.paymentBreakdown}</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t.receipt.paymentMode}</th>
                    <th className="px-3 py-2">{t.receipt.amount}</th>
                    <th className="px-3 py-2">{t.managerReport.mixOutput}</th>
                    <th className="px-3 py-2">{t.managerReport.totalOrders}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.group} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{payment.label}</td>
                      <td className="px-3 py-2 font-mono font-semibold text-foreground">{formatCurrency(payment.amount)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{payment.share.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-muted-foreground">{payment.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {metrics.pendingTotal > 0 && (
              <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-warning/80">{t.pos.pending}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatCurrency(metrics.pendingTotal)} {t.pos.pending}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─ Orders Tab ─ */}
        <TabsContent value="orders" className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.tabOrders}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.tabOrders}</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">{t.receipt.invoiceNumber}</th>
                    <th className="px-3 py-2">{t.pos.orderType}</th>
                    <th className="px-3 py-2">{t.receipt.qty}</th>
                    <th className="px-3 py-2">{t.managerReport.netRevenue}</th>
                    {TAX_CONFIG.enabled && <th className="px-3 py-2">{TAX_CONFIG.label}</th>}
                    <th className="px-3 py-2">{t.receipt.grandTotal}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <p className="font-mono text-xs font-semibold text-foreground">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(invoice.date)}{' '}
                          {invoice.date.toLocaleTimeString(currencyConfig.locale, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">
                          {invoice.source}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{invoice.itemCount}</td>
                      <td className="px-3 py-2">
                        <p className="font-mono font-semibold text-foreground">{formatCurrency(invoice.revenue)}</p>
                        <p className="text-xs text-success-text">{t.receipt.discount} {formatCurrency(invoice.discounts)}</p>
                      </td>
                      {TAX_CONFIG.enabled && (
                        <td className="px-3 py-2">
                          <p className="font-mono text-xs font-semibold text-primary">
                            {formatCurrency(invoice.taxAmount)}
                          </p>
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <p className="font-mono font-bold text-foreground">{formatCurrency(invoice.grandTotal)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.reportsTitle}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.panelTitle}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.managerReport.totalOrders}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{metrics.orders}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t.managerReport.totalOrders}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.managerReport.categoryShareTitle}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{meta.topCategoryLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">{t.managerReport.categoryShareDesc}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.managerReport.discountLoad}</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{metrics.discountRate.toFixed(1)}%</p>
                <p className="mt-2 text-xs text-muted-foreground">{t.managerReport.discountsGiven}</p>
              </div>
              {TAX_CONFIG.enabled ? (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-primary/70">
                    {TAX_CONFIG.label} ({metrics.taxRate}%)
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(metrics.totalTax)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t.managerReport.taxCollected}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.managerReport.topProducts}</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{meta.bestItemLabel}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t.managerReport.topProducts}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
