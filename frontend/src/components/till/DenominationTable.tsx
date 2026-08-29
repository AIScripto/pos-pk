import { DenominationEntry, PKR_DENOMINATIONS, sumDenominations } from '@/types/till';
import { formatCurrency } from '@/utils/pos';
import { useAppConfig } from '@/context/AppConfigContext';
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

interface DenominationTableProps {
  entries: DenominationEntry[];
  onChange: (entries: DenominationEntry[]) => void;
  /** Show a readonly total row at the bottom */
  showTotal?: boolean;
  /** Highlight the row if count > 0 */
  highlightFilled?: boolean;
  layout?: 'table' | 'compact';
}

export function DenominationTable({
  entries,
  onChange,
  showTotal = true,
  highlightFilled = true,
  layout = 'table',
}: DenominationTableProps) {
  const { t } = useTranslation();
  const { currencyConfig } = useAppConfig();
  const total = sumDenominations(entries);

  const handleCount = (index: number, raw: string) => {
    const count = Math.max(0, Math.floor(Number(raw) || 0));
    const updated = entries.map((e, i) =>
      i === index ? { ...e, count, total: e.value * count } : e
    );
    onChange(updated);
  };

  if (layout === 'compact') {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 gap-1.5">
          {entries.map((entry, i) => {
            const isNote = entry.type ? entry.type === 'note' : entry.value >= 20;
            const filled = entry.count > 0;
            return (
              <div
                key={entry.value}
                className={cn(
                  'grid grid-cols-[78px_96px_1fr] items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-colors',
                  filled && highlightFilled
                    ? 'border-primary/35 bg-primary/8'
                    : 'border-border bg-secondary/40',
                )}
              >
                <span className={cn(
                  'flex h-7 items-center justify-center rounded-md text-xs font-display font-black',
                  isNote
                    ? 'bg-warning/15 text-warning border border-warning/25'
                    : 'bg-secondary border border-border text-muted-foreground',
                )}>
                  {currencyConfig.currencySymbol} {entry.label}
                </span>
                <input
                  type="number"
                  min="0"
                  value={entry.count === 0 ? '' : entry.count}
                  onChange={(e) => handleCount(i, e.target.value)}
                  placeholder="0"
                  className="h-7 w-full rounded-md border border-border bg-background px-2 text-right font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <p className={cn(
                  'truncate text-right font-mono text-xs tabular-nums',
                  filled ? 'font-bold text-foreground' : 'text-muted-foreground/50',
                )}>
                  {entry.count > 0 ? formatCurrency(entry.total) : '—'}
                </p>
              </div>
            );
          })}
        </div>

        {showTotal && (
          <div className="mt-1.5 flex items-center justify-between rounded-lg border border-pos-success/30 bg-pos-success/8 px-3 py-1.5">
            <span className="font-display text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">
              {t.till.totalCounted}
            </span>
            <span className="font-display text-base font-black tabular-nums text-pos-success">
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border">
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_24px_90px] gap-0 bg-secondary/80 px-4 py-2">
        <span className="font-display font-bold text-2xs uppercase tracking-[0.15em] text-muted-foreground">
          {t.till.denominationGrid}
        </span>
        <span className="font-display font-bold text-2xs uppercase tracking-[0.15em] text-muted-foreground text-right">
          {t.receipt.qty}
        </span>
        <span />
        <span className="font-display font-bold text-2xs uppercase tracking-[0.15em] text-muted-foreground text-right">
          {t.pos.subtotal}
        </span>
      </div>

      {/* Rows */}
      {entries.map((entry, i) => {
        const isNote = entry.type ? entry.type === 'note' : entry.value >= 20;
        const filled = entry.count > 0;
        return (
          <div
            key={entry.value}
            className={cn(
              'grid grid-cols-[1fr_80px_24px_90px] items-center gap-0 px-4 py-1.5 border-t border-border/50 transition-colors',
              filled && highlightFilled
                ? 'bg-primary/5'
                : 'hover:bg-secondary/30',
            )}
          >
            {/* Denomination label */}
            <div className="flex items-center gap-2">
              <span className={cn(
                'flex h-6 min-w-[44px] items-center justify-center rounded-md text-[11px] font-display font-bold',
                isNote
                  ? 'bg-warning/15 text-warning border border-warning/25'
                  : 'bg-secondary border border-border text-muted-foreground',
              )}>
                {currencyConfig.currencySymbol} {entry.label}
              </span>
            </div>

            {/* Count input */}
            <input
              type="number"
              min="0"
              value={entry.count === 0 ? '' : entry.count}
              onChange={(e) => handleCount(i, e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-border bg-secondary py-1 px-2 text-right font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />

            {/* Multiplication sign */}
            <span className="text-center font-display text-xs text-muted-foreground/50 select-none">×</span>

            {/* Sub-total */}
            <span className={cn(
              'text-right font-mono text-sm tabular-nums',
              filled ? 'font-semibold text-foreground' : 'text-muted-foreground/50',
            )}>
              {entry.count > 0 ? formatCurrency(entry.total) : '—'}
            </span>
          </div>
        );
      })}

      {/* Total row */}
      {showTotal && (
        <div className="grid grid-cols-[1fr_80px_24px_90px] items-center gap-0 px-4 py-3 border-t-2 border-border bg-secondary/60">
          <span className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide col-span-3">
            {t.till.totalCounted}
          </span>
          <span className="text-right font-display font-black text-[18px] text-primary tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      )}
    </div>
  );
}

