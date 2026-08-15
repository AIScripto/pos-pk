import { useTill } from '@/context/TillContext';
import { LockOpen, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { formatLocalizedTime } from '@/i18n/digits';

interface TillStatusBadgeProps {
  onOpenTill:  () => void;
  onCloseTill: () => void;
  className?:  string;
}

export function TillStatusBadge({ onOpenTill, onCloseTill, className }: TillStatusBadgeProps) {
  const { t, language } = useTranslation();
  const { isOpen, session } = useTill();

  const openedTime = session?.openedAt ? formatLocalizedTime(session.openedAt, language) : null;

  return (
    <button
      onClick={isOpen ? onCloseTill : onOpenTill}
      title={isOpen ? `${t.common.tillStatus}: ${t.common.open}` : `${t.common.tillStatus}: ${t.common.tillClosed}`}
      aria-label={isOpen ? `${t.common.close} ${t.common.till}` : `${t.common.open} ${t.common.till}`}
      className={cn(
        'flex h-11 items-center gap-2 rounded-xl border px-3 py-1 font-display transition-all focus-visible:outline-none focus-visible:ring-2 active:scale-[0.97] shrink-0 cursor-pointer shadow-2xs',
        isOpen
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 focus-visible:ring-emerald-400'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60 focus-visible:ring-rose-400 animate-pulse',
        className,
      )}
    >
      {isOpen
        ? <LockOpen className="w-4 h-4 shrink-0" />
        : <Lock     className="w-4 h-4 shrink-0" />
      }
      <div className="flex flex-col min-w-0 text-left justify-center">
        <span className="font-display text-[9px] font-black uppercase tracking-[0.14em] opacity-75 leading-none mb-0.5">
          {t.common.tillStatus}
        </span>
        <span className="font-display text-xs font-extrabold leading-tight whitespace-nowrap">
          {isOpen ? `${t.common.open}${openedTime ? ` · ${openedTime}` : ''}` : t.common.tillClosed}
        </span>
      </div>
    </button>
  );
}
