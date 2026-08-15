import { Sun, Moon, PauseCircle, LockKeyhole, LogOut, Monitor, UserRound, Clock3, Keyboard } from 'lucide-react';
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
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 min-h-14 flex items-center shadow-sm no-print">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-amber-500 to-orange-500 shadow-md shadow-blue-500/20">
            <span className="text-lg" aria-hidden="true">🍔</span>
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[18px] tracking-[0.02em] text-slate-900 dark:text-slate-100 leading-tight">
              {orgConfig?.businessName || 'Crisp&Crumbs'} <span className="text-blue-600 dark:text-blue-400 font-black">POS</span>
            </h1>
            <p className="font-display text-[9px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 leading-tight font-semibold">
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
          <div className="hidden md:flex h-11 items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-500/10 dark:bg-blue-950/40 px-3 py-1 no-print shadow-2xs shrink-0">
            <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="flex flex-col min-w-0 justify-center">
              <span className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400 leading-none mb-0.5">
                {t.common.shortcuts}
              </span>
              <span className="font-mono font-black text-xs text-slate-900 dark:text-slate-100 leading-tight whitespace-nowrap">
                {t.common.shortcutsActive}
              </span>
            </div>
          </div>

          {onOpenHeld && (
            <button
              onClick={onOpenHeld}
              aria-label={`Held orders${heldCount > 0 ? ` — ${heldCount} held` : ''}`}
              className="flex h-11 items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/20 px-3 py-1 font-body font-bold text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-2xs shrink-0 cursor-pointer active:scale-[0.97]"
            >
              <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0 text-left justify-center">
                <span className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400 leading-none mb-0.5">
                  {t.common.parkedQueue}
                </span>
                <span className="font-display text-xs font-extrabold leading-tight whitespace-nowrap flex items-center gap-1">
                  <span>{`F3 ${t.common.park}`}</span>
                  {heldCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 rounded-full px-1.5 py-0.2 font-display font-black text-[10px] leading-3 shadow-xs">
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
          <div className="hidden sm:block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 text-right shadow-sm">
            <p className="font-display font-black text-[18px] tabular-nums text-slate-900 dark:text-slate-100 leading-tight">
              {formattedTime}
            </p>
            <p className="font-display text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-tight uppercase tracking-wider">
              {formattedDate}
            </p>
          </div>

          <LanguageSelector />

          <button
            onClick={lock}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label="Lock screen"
            title="Lock screen"
          >
            <LockKeyhole className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-slate-600" />
            }
          </button>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-2 transition-all hover:bg-rose-100 dark:hover:bg-rose-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-sm"
            aria-label="Log out"
            title={`Log out${user?.name ? ` (${user.name})` : ''}`}
          >
            <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
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
    <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 px-3 py-1 shadow-2xs shrink-0">
      <span className="shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true">{icon}</span>
      <div className="flex flex-col min-w-0 justify-center">
        <span className="font-display text-[9px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-400 leading-none mb-0.5">
          {label}
        </span>
        <span className="font-display text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight whitespace-nowrap">
          {value}
        </span>
      </div>
    </div>
  );
}
