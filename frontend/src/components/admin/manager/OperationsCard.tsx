import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { THEMES, Theme } from './ManagerCommon';

export function OperationsCard({
  theme, icon, title, status, detail,
  actionLabel, actionIcon, actionVariant, disabled, isPending, onAction,
}: {
  theme: Theme;
  icon: ReactNode;
  title: string;
  status: string;
  detail: string;
  actionLabel: string;
  actionIcon: ReactNode;
  actionVariant: 'primary' | 'danger' | 'warning';
  disabled: boolean;
  isPending: boolean;
  onAction: () => void;
}) {
  const t = THEMES[theme];
  const isOpen = status === 'open';

  const btnClass = {
    primary: 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950',
    danger:  'bg-red-600 text-white hover:bg-red-700',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
  }[actionVariant];

  const pendingLabel = actionLabel
    .replace(/^Open\b/, 'Opening')
    .replace(/^Close\b/, 'Closing')
    .concat('…');

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm ${t.border}`}>
      <div className={`flex items-center justify-between px-5 py-3 ${t.headerBg} ${t.headerBorder}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.iconBg}`}>{icon}</div>
          <span className={`font-black ${t.title}`}>{title}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
          isPending
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 animate-pulse'
            : isOpen
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {isPending ? 'please wait' : status}
        </span>
      </div>

      {isPending && (
        <div className="h-0.5 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <div className="h-full animate-[loading_1.2s_ease-in-out_infinite] bg-amber-400" />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isPending ? `Please wait — ${pendingLabel.toLowerCase()}` : detail}
        </p>
        <button
          onClick={onAction}
          disabled={disabled || isPending}
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${btnClass}`}
        >
          {isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" />{pendingLabel}</>
            : <>{actionIcon}{actionLabel}</>
          }
        </button>
      </div>
    </div>
  );
}
