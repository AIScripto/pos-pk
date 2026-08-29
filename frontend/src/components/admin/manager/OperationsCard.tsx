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
    primary: 'bg-muted text-white hover:bg-muted dark:bg-white dark:text-foreground',
    danger:  'bg-danger text-white hover:bg-danger/90',
    warning: 'bg-warning text-white hover:bg-warning',
  }[actionVariant];

  const pendingLabel = actionLabel
    .replace(/^Open\b/, 'Opening')
    .replace(/^Close\b/, 'Closing')
    .concat('…');

  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-muted/25 hover:dark:bg-muted/35 hover:border-primary/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm ${t.border}`}>
      <div className={`flex items-center justify-between px-5 py-3 ${t.headerBg} ${t.headerBorder}`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.iconBg}`}>{icon}</div>
          <span className={`font-black ${t.title}`}>{title}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-2xs font-black uppercase tracking-wide ${
          isPending
            ? 'bg-warning-subtle text-warning-text animate-pulse'
            : isOpen
              ? 'bg-success-subtle text-success-text'
              : 'bg-secondary text-muted-foreground'
        }`}>
          {isPending ? 'please wait' : status}
        </span>
      </div>

      {isPending && (
        <div className="h-0.5 w-full overflow-hidden bg-secondary">
          <div className="h-full animate-[loading_1.2s_ease-in-out_infinite] bg-warning" />
        </div>
      )}

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <p className="text-sm text-muted-foreground">
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
