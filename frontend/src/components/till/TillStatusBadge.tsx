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
          ? 'border-success/40 bg-success/10 text-success-text hover:bg-success/20 hover:border-success/60 focus-visible:ring-success'
          : 'border-danger/40 bg-danger/10 text-danger-text hover:bg-danger/20 hover:border-danger/60 focus-visible:ring-danger animate-pulse',
        className,
      )}
    >
      {isOpen
        ? <LockOpen className="w-4 h-4 shrink-0" />
        : <Lock     className="w-4 h-4 shrink-0" />
      }
      <div className="flex flex-col min-w-0 text-left justify-center">
        <span className="font-display text-2xs font-black uppercase tracking-[0.14em] opacity-75 leading-none mb-0.5">
          {t.common.tillStatus}
        </span>
        <span className="font-display text-xs font-extrabold leading-tight whitespace-nowrap">
          {isOpen ? `${t.common.open}${openedTime ? ` · ${openedTime}` : ''}` : t.common.tillClosed}
        </span>
      </div>
    </button>
  );
}
