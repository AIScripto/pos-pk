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
          <TabsTrigger value="performance" className="rounded-md px-4 py-2.5">Performance</TabsTrigger>
          <TabsTrigger value="items" className="rounded-md px-4 py-2.5">Items</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-md px-4 py-2.5">Payments</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-md px-4 py-2.5">Orders</TabsTrigger>
        </TabsList>

        {/* ─ Performance Tab ─ */}
        <TabsContent value="performance" className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Grouped Analysis</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">Hourly order momentum</h3>
              </div>
              <div className="rounded-md bg-sky-500/10 p-3 text-sky-500">
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
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Owner Notes</p>
                <h3 className="mt-2 text-xl font-bold text-foreground">Quick operational takeaways</h3>
              </div>
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Top category</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.topCategoryLabel}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Best hour</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.bestHourLabel}</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Best seller</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{meta.bestItemLabel}</p>
              </div>
              {TAX_CONFIG.enabled && (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-500/70">
                    {TAX_CONFIG.label} collected ({metrics.taxRate}%)
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{formatCurrency(metrics.totalTax)}</p>
                </div>
              )}
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Revenue</th>
                    <th className="px-3 py-2">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.category} className="border-t border-border/60">
                      <td className="px-3 py-2 font-medium text-foreground">{category.label}</td>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Ranking Output</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Top items from the selected view</h3>
            <div className="mt-4 space-y-3">
              {topItems.map((item, index) => (
                <div key={item.itemKey} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/70 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/12 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-foreground">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Category Output</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Revenue vs discount by category</h3>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Product vs Deal Output</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Separate product and deal leaders</h3>
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {[
                { title: 'Top products', rows: productItems },
                { title: 'Top deals', rows: dealItems },
              ].map((section) => (
                <div key={section.title} className="overflow-hidden rounded-lg border border-border/70">
                  <div className="bg-background/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {section.title}
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-background/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Revenue</th>
                        <th className="px-3 py-2">Share</th>
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
                          <td className="px-4 py-6 text-xs text-muted-foreground" colSpan={4}>No rows for this filter.</td>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Tender Mix</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Cash, credit and pending value</h3>
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Payment Ledger</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Tender reconciliation summary</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Tender</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Share</th>
                    <th className="px-3 py-2">Order refs</th>
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
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">Collection watch</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatCurrency(metrics.pendingTotal)} is still pending, usually COD orders awaiting settlement.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─ Orders Tab ─ */}
        <TabsContent value="orders" className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Order Output</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">Recent order slice</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-border/70">
              <table className="w-full text-left">
                <thead className="bg-background/80 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Invoice</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Revenue</th>
                    {TAX_CONFIG.enabled && <th className="px-3 py-2">{TAX_CONFIG.label}</th>}
                    <th className="px-3 py-2">Total</th>
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
                        <p className="text-xs text-emerald-600">Discount {formatCurrency(invoice.discounts)}</p>
                      </td>
                      {TAX_CONFIG.enabled && (
                        <td className="px-3 py-2">
                          <p className="font-mono text-xs font-semibold text-blue-500">
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">Analysis Output</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">What this filter set is telling you</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ticket density</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{metrics.orders}</p>
                <p className="mt-2 text-xs text-muted-foreground">orders are visible under the active dataset, category, and time window.</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Merchandising signal</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{meta.topCategoryLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">is currently leading revenue contribution inside the selected slice.</p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Discount watch</p>
                <p className="mt-2 text-xl font-semibold text-foreground">{metrics.discountRate.toFixed(1)}%</p>
                <p className="mt-2 text-xs text-muted-foreground">of gross sales is being given away through discounts in this view.</p>
              </div>
              {TAX_CONFIG.enabled ? (
                <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-500/70">
                    {TAX_CONFIG.label} liability ({metrics.taxRate}%)
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(metrics.totalTax)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    collected across {metrics.orders} order{metrics.orders !== 1 ? 's' : ''} in this view.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Fast read</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{meta.bestItemLabel}</p>
                  <p className="mt-2 text-xs text-muted-foreground">is the strongest performer based on the current item ranking input.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
