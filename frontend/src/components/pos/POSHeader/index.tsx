import { Sun, Moon, PauseCircle, LockKeyhole, LogOut, Monitor, UserRound, Clock3, Keyboard, Store } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLock }  from '@/context/LockContext';
import { useAuth }  from '@/context/AuthContext';
import { useTill }  from '@/context/TillContext';
import { useAppConfig } from '@/context/AppConfigContext';
import { TillStatusBadge } from '@/components/till/TillStatusBadge';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useTranslation } from '@/i18n';
import { formatLocalizedTime, formatLocalizedDate, toLocalizedDigits } from '@/i18n/digits';
import { useEffect, useState } from 'react';
import { CurrentShift, tillConfigApi } from '@/lib/api/till-config.api';
import { getRememberedTerminalLabel } from '@/lib/pos-terminal-selection';

interface POSHeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  heldCount?: number;
  onOpenHeld?: () => void;
  onOpenTill?: () => void;
  onCloseTill?: () => void;
}

export function POSHeader({ heldCount = 0, onOpenHeld, onOpenTill, onCloseTill }: POSHeaderProps) {
  const { t, language } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { lock, unlock } = useLock();
  const { user, logout } = useAuth();
  const { session } = useTill();
  const { orgConfig, currencyConfig } = useAppConfig();
  const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);

  const handleLogout = () => {
    unlock(); // clear lock state so the next login starts fresh
    logout();
  };
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const activeBranchId = session?.branchId || user?.branchId || '';

  useEffect(() => {
    if (!activeBranchId) {
      setCurrentShift(null);
      return;
    }

    tillConfigApi.currentShift(activeBranchId)
      .then(setCurrentShift)
      .catch(() => setCurrentShift(null));
  }, [activeBranchId]);

  const formattedTime = formatLocalizedTime(currentTime, language);
  const formattedDate = formatLocalizedDate(currentTime, language);

  const defaultCounter = `${t.common.counter} ${toLocalizedDigits('01', language)}`;
  const tillLabel = user?.terminalName || getRememberedTerminalLabel() || (session?.terminalId ? `#${session.terminalId}` : defaultCounter);
  const userLabel = user?.name || session?.openedBy || t.common.notSignedIn;
  const shiftLabel = currentShift?.shift
    ? `${currentShift.shift.name} ${currentShift.shift.startTime}-${currentShift.shift.endTime}`
    : session?.shiftName || t.common.noActiveShift;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/90 dark:bg-muted/90 backdrop-blur-md px-4 py-2 min-h-14 flex items-center shadow-sm no-print">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-warning to-warning shadow-md shadow-primary/20">
            <Store className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[18px] tracking-[0.02em] text-foreground leading-tight">
              {orgConfig?.businessName || 'Crisp&Crumbs'} <span className="text-primary font-black">POS</span>
            </h1>
            <p className="font-display text-2xs uppercase tracking-[0.22em] text-muted-foreground leading-tight font-semibold">
              {t.common.subTitle}
            </p>
          </div>
        </div>

        {/* Center — till status + branch + held */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
          {/* Till status */}
          {onOpenTill && onCloseTill && (
            <TillStatusBadge onOpenTill={onOpenTill} onCloseTill={onCloseTill} />
          )}

          <HeaderInfoChip icon={<Monitor className="h-3.5 w-3.5" />} label={t.common.till} value={tillLabel} />
          <HeaderInfoChip icon={<UserRound className="h-3.5 w-3.5" />} label={t.common.user} value={userLabel} />
          <HeaderInfoChip icon={<Clock3 className="h-3.5 w-3.5" />} label={t.common.shift} value={shiftLabel} />

          {/* Function Keys Legend Chip */}
          <div className="hidden md:flex h-11 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 dark:bg-primary/40 px-3 py-1 no-print shadow-2xs shrink-0">
            <Keyboard className="w-4 h-4 text-primary shrink-0" />
            <div className="flex flex-col min-w-0 justify-center">
              <span className="font-display text-2xs font-black uppercase tracking-[0.14em] text-primary leading-none mb-0.5">
                {t.common.shortcuts}
              </span>
              <span className="font-mono font-black text-xs text-foreground leading-tight whitespace-nowrap">
                {t.common.shortcutsActive}
              </span>
            </div>
          </div>

          {onOpenHeld && (
            <button
              onClick={onOpenHeld}
              aria-label={`Held orders${heldCount > 0 ? ` — ${heldCount} held` : ''}`}
              className="flex h-11 items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 dark:bg-warning/20 px-3 py-1 font-body font-bold text-xs text-warning-text hover:bg-warning/20 hover:border-warning/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning shadow-2xs shrink-0 cursor-pointer active:scale-[0.97]"
            >
              <PauseCircle className="w-4 h-4 text-warning-text shrink-0" />
              <div className="flex flex-col min-w-0 text-left justify-center">
                <span className="font-display text-2xs font-black uppercase tracking-[0.14em] text-warning-text leading-none mb-0.5">
                  {t.common.parkedQueue}
                </span>
                <span className="font-display text-xs font-extrabold leading-tight whitespace-nowrap flex items-center gap-1">
                  <span>{`F3 ${t.common.park}`}</span>
                  {heldCount > 0 && (
                    <span className="bg-warning text-foreground rounded-full px-1.5 py-0.5 font-display font-black text-2xs leading-3 shadow-xs">
                      {heldCount}
                    </span>
                  )}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Right — time + theme */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-right shadow-sm">
            <p className="font-display font-black text-[18px] tabular-nums text-foreground leading-tight">
              {formattedTime}
            </p>
            <p className="font-display text-2xs font-bold text-muted-foreground leading-tight uppercase tracking-wider">
              {formattedDate}
            </p>
          </div>

          <LanguageSelector />

          <button
            onClick={lock}
            className="rounded-xl border border-border bg-card p-2 transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label="Lock screen"
            title="Lock screen"
          >
            <LockKeyhole className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-border bg-card p-2 transition-all hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-warning" />
              : <Moon className="w-4 h-4 text-muted-foreground" />
            }
          </button>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-danger-border bg-danger-subtle p-2 transition-all hover:bg-danger-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger shadow-sm"
            aria-label="Log out"
            title={`Log out${user?.name ? ` (${user.name})` : ''}`}
          >
            <LogOut className="w-4 h-4 text-danger-text" />
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderInfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-xl border border-border bg-white dark:bg-muted/90 px-3 py-1 shadow-2xs shrink-0">
      <span className="shrink-0 text-primary" aria-hidden="true">{icon}</span>
      <div className="flex flex-col min-w-0 justify-center">
        <span className="font-display text-2xs font-black uppercase tracking-[0.14em] text-muted-foreground/70 leading-none mb-0.5">
          {label}
        </span>
        <span className="font-display text-xs font-extrabold text-foreground leading-tight whitespace-nowrap">
          {value}
        </span>
      </div>
    </div>
  );
}
