import { ArrowUpRight } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ManagerReportSnapshot } from '@/types/reports';
import { formatCurrency } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { useTranslation, getLocalizedCategoryName } from '@/i18n';
import {
  chartConfig,
  getPlainCategoryLabel,
  pieColors,
  renderCategoryShareLabel,
} from '../managerReportConfig';

interface ReportChartsSectionProps {
  report: ManagerReportSnapshot;
}

export function ReportChartsSection({ report }: ReportChartsSectionProps) {
  const { t, language } = useTranslation();
  const { categories, trend, meta } = report;

  return (
    <div className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.trendOutput}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.revenueDiscountTax}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{meta.datasetLabel} filtered by {meta.categoryLabel.toLowerCase()} for {meta.dateRangeLabel}.</p>
          </div>
          <div className="rounded-md bg-primary/10 p-3 text-primary">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <ChartContainer config={chartConfig} className="mt-4 h-[240px] w-full aspect-auto">
          <AreaChart data={trend} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
            <defs>
              <linearGradient id="trendRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="trendDiscount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-discounts)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-discounts)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="trendTax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-tax)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-tax)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={18} />
            <YAxis tickLine={false} axisLine={false} width={78} tickFormatter={(value) => `$${Math.round(Number(value))}`} />
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
            <ChartLegend content={<ChartLegendContent />} />
            <Area type="monotone" dataKey="discounts" stroke="var(--color-discounts)" fill="url(#trendDiscount)" strokeWidth={2} />
            {TAX_CONFIG.enabled && (
              <Area type="monotone" dataKey="tax" stroke="var(--color-tax)" fill="url(#trendTax)" strokeWidth={2} />
            )}
            <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#trendRevenue)" strokeWidth={3} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.mixOutput}</p>
            <h3 className="mt-2 text-xl font-bold text-foreground">{t.managerReport.categoryShareTitle}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t.managerReport.categoryShareDesc}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-border/60 bg-background/60 p-4">
          <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
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
              <Pie
                data={categories}
                dataKey="revenue"
                nameKey="label"
                innerRadius={74}
                outerRadius={110}
                paddingAngle={4}
                labelLine={false}
                label={renderCategoryShareLabel}
              >
                {categories.map((category, index) => (
                  <Cell key={category.category} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {categories.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
              {categories.map((category, index) => (
                <div
                  key={category.category}
                  className="rounded-lg border border-border/60 bg-card/80 px-3 py-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    <div className="min-w-0">
                      <span
                        className="block text-[11px] font-semibold uppercase leading-4 tracking-[0.08em]"
                        style={{ color: pieColors[index % pieColors.length] }}
                      >
                        {getLocalizedCategoryName(category.category, language) || getPlainCategoryLabel(category.label)}
                      </span>
                      <span className="mt-1 block text-xs font-semibold leading-4 text-foreground">
                        {category.share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-md border border-dashed border-border/70 bg-background/60 px-4 py-6 text-center text-xs text-muted-foreground">
              {t.common.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

