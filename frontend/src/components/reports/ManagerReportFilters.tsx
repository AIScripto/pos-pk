import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ManagerReportFilters as Filters } from '@/types/reports';
import { Category } from '@/types/pos';
import { useTranslation, getLocalizedCategoryName } from '@/i18n';

interface ManagerReportFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

const categories: Array<Filters['category']> = ['all', 'deals', 'burgers', 'wraps', 'chicken', 'fries', 'drinks'];

export function ManagerReportFilters({ filters, onChange, onExportCsv, onExportExcel, onExportPdf }: ManagerReportFiltersProps) {
  const { t, language } = useTranslation();

  const ranges: Array<{ value: Filters['range']; label: string }> = [
    { value: 'today', label: t.managerReport.today },
    { value: '7d', label: t.managerReport.last7Days },
    { value: '30d', label: t.managerReport.last30Days },
    { value: '90d', label: t.managerReport.last90Days },
    { value: 'custom', label: t.managerReport.customRange },
  ];

  const datasets: Array<{ value: Filters['dataset']; label: string }> = [
    { value: 'combined', label: t.managerReport.datasetCombined },
    { value: 'live', label: t.managerReport.datasetLive },
    { value: 'demo', label: t.managerReport.datasetDemo },
  ];

  const groupings: Array<{ value: Filters['trendGrouping']; label: string }> = [
    { value: 'day', label: t.managerReport.dailyTrend },
    { value: 'weekday', label: t.managerReport.weekdayTrend },
    { value: 'hour', label: t.managerReport.hourlyTrend },
  ];

  const rankings: Array<{ value: Filters['rankingMetric']; label: string }> = [
    { value: 'revenue', label: t.managerReport.topByRevenue },
    { value: 'quantity', label: t.managerReport.topByQuantity },
    { value: 'discount', label: t.managerReport.topByDiscount },
  ];

  return (
    <div className="rounded-lg border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur">
      <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr_0.9fr_0.9fr_0.9fr_auto_auto]">
        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.dataset}</label>
          <Select value={filters.dataset} onValueChange={(value: Filters['dataset']) => onChange({ ...filters, dataset: value })}>
            <SelectTrigger className="h-9 rounded-md border-border/70 bg-background/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {datasets.map((dataset) => (
                <SelectItem key={dataset.value} value={dataset.value}>
                  {dataset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.range}</label>
          <Select value={filters.range} onValueChange={(value: Filters['range']) => onChange({ ...filters, range: value })}>
            <SelectTrigger className="h-9 rounded-md border-border/70 bg-background/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ranges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.startDate}</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, range: 'custom', startDate: event.target.value })}
            className="h-9 rounded-md border-border/70 bg-background/80 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.endDate}</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, range: 'custom', endDate: event.target.value })}
            className="h-9 rounded-md border-border/70 bg-background/80 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.grouping}</label>
          <Select
            value={filters.trendGrouping}
            onValueChange={(value: Filters['trendGrouping']) => onChange({ ...filters, trendGrouping: value })}
          >
            <SelectTrigger className="h-9 rounded-md border-border/70 bg-background/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groupings.map((grouping) => (
                <SelectItem key={grouping.value} value={grouping.value}>
                  {grouping.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{t.managerReport.ranking}</label>
          <Select
            value={filters.rankingMetric}
            onValueChange={(value: Filters['rankingMetric']) => onChange({ ...filters, rankingMetric: value })}
          >
            <SelectTrigger className="h-9 rounded-md border-border/70 bg-background/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rankings.map((ranking) => (
                <SelectItem key={ranking.value} value={ranking.value}>
                  {ranking.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 self-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange({ ...filters, includeDeals: !filters.includeDeals })}
            className={cn(
              'h-9 rounded-md border-border/70 bg-background/80 px-3 text-xs cursor-pointer',
              filters.includeDeals && 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15',
            )}
          >
            {filters.includeDeals ? t.managerReport.dealsOn : t.managerReport.dealsOff}
          </Button>
        </div>

        <div className="flex gap-2 self-end">
          <Button type="button" variant="outline" onClick={onExportCsv} className="h-9 rounded-md px-3 text-xs cursor-pointer">
            CSV
          </Button>
          <Button type="button" variant="outline" onClick={onExportExcel} className="h-9 rounded-md px-3 text-xs cursor-pointer">
            Excel
          </Button>
          <Button type="button" variant="outline" onClick={onExportPdf} className="h-9 rounded-md px-3 text-xs cursor-pointer">
            PDF
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange({ ...filters, category })}
            className={cn(
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer',
              filters.category === category
                ? 'border-primary/20 bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border/70 bg-background/75 text-muted-foreground hover:border-primary/20 hover:text-primary',
            )}
          >
            {category === 'all' ? t.managerReport.allCategories : getLocalizedCategoryName(category, language)}
          </button>
        ))}
      </div>
    </div>
  );
}

