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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <p className="mt-2.5 text-3.5xl font-black tracking-tight text-slate-950 dark:text-white font-display" style={{ fontWeight: 900 }}>
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2.5',
            accent === 'positive'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
              : accent === 'tax'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
