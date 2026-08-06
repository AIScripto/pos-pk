import { categoryLabels } from '@/data/products';
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

interface ManagerReportFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
}

const ranges: Array<{ value: Filters['range']; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

const datasets: Array<{ value: Filters['dataset']; label: string }> = [
  { value: 'combined', label: 'Live + sample' },
  { value: 'live', label: 'Live only' },
  { value: 'demo', label: 'Sample only' },
];

const groupings: Array<{ value: Filters['trendGrouping']; label: string }> = [
  { value: 'day', label: 'Daily trend' },
  { value: 'weekday', label: 'Weekday trend' },
  { value: 'hour', label: 'Hourly trend' },
];

const rankings: Array<{ value: Filters['rankingMetric']; label: string }> = [
  { value: 'revenue', label: 'Top by revenue' },
  { value: 'quantity', label: 'Top by quantity' },
  { value: 'discount', label: 'Top by discounts' },
];

const categories: Array<Filters['category']> = ['all', 'deals', 'burgers', 'wraps', 'chicken', 'fries', 'drinks'];

export function ManagerReportFilters({ filters, onChange, onExportCsv, onExportExcel, onExportPdf }: ManagerReportFiltersProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/80 p-3 shadow-sm backdrop-blur">
      <div className="grid gap-3 xl:grid-cols-[1fr_0.9fr_0.9fr_0.9fr_0.9fr_auto_auto]">
        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Dataset</label>
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
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Range</label>
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
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Start date</label>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, range: 'custom', startDate: event.target.value })}
            className="h-9 rounded-md border-border/70 bg-background/80 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">End date</label>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, range: 'custom', endDate: event.target.value })}
            className="h-9 rounded-md border-border/70 bg-background/80 text-xs"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Grouping</label>
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
          <label className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ranking</label>
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
              'h-9 rounded-md border-border/70 bg-background/80 px-3 text-xs',
              filters.includeDeals && 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/15',
            )}
          >
            Deals {filters.includeDeals ? 'On' : 'Off'}
          </Button>
        </div>

        <div className="flex gap-2 self-end">
          <Button type="button" variant="outline" onClick={onExportCsv} className="h-9 rounded-md px-3 text-xs">
            CSV
          </Button>
          <Button type="button" variant="outline" onClick={onExportExcel} className="h-9 rounded-md px-3 text-xs">
            Excel
          </Button>
          <Button type="button" variant="outline" onClick={onExportPdf} className="h-9 rounded-md px-3 text-xs">
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
              'rounded-md border px-2.5 py-1 text-xs font-medium transition-all',
              filters.category === category
                ? 'border-primary/20 bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border/70 bg-background/75 text-muted-foreground hover:border-primary/20 hover:text-primary',
            )}
          >
            {category === 'all' ? 'All categories' : categoryLabels[category as Category]}
          </button>
        ))}
      </div>
    </div>
  );
}
