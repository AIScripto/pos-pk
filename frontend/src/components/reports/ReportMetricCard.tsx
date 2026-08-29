import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReportMetricCard({
  title,
  value,
  hint,
  accent = 'positive',
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  accent?: 'positive' | 'neutral' | 'tax';
  icon: LucideIcon;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-muted/25 hover:dark:bg-muted/35 hover:border-primary/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
            {title}
          </p>
          <p className="mt-2.5 text-4xl font-black tracking-tight text-foreground dark:text-white font-display" style={{ fontWeight: 900 }}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2.5',
            accent === 'positive'
              ? 'bg-success-subtle text-success-text'
              : accent === 'tax'
                ? 'bg-info-subtle text-primary'
                : 'bg-secondary text-muted-foreground',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{hint}</p>
    </div>
  );
}
