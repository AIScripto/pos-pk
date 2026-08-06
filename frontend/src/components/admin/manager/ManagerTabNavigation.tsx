import type { ReactNode } from 'react';
import { CalendarDays, LayoutDashboard, Monitor, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabCategory } from '@/hooks/useManagerPanelState';

interface ManagerTabNavigationProps {
  activeTab: TabCategory;
  setActiveTab: (tab: TabCategory) => void;
  hasOpenDay: boolean;
  hasOpenShift: boolean;
  openTills: number;
  pendingTills: number;
  totalKitchenOrders: number;
}

export function ManagerTabNavigation({
  activeTab,
  setActiveTab,
  hasOpenDay,
  hasOpenShift,
  openTills,
  pendingTills,
  totalKitchenOrders,
}: ManagerTabNavigationProps) {
  const TABS: { id: TabCategory; label: string; icon: ReactNode; badge?: ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'openclosing',
      label: 'Open & Closing',
      icon: <CalendarDays className="h-4 w-4" />,
      badge: (hasOpenDay || hasOpenShift) ? (
        <span className="flex h-2 w-2 rounded-full bg-emerald-500" title="Day/Shift Active" />
      ) : null,
    },
    {
      id: 'tills',
      label: 'Tills Status',
      icon: <Monitor className="h-4 w-4" />,
      badge: pendingTills > 0 ? (
        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
          {pendingTills} Pending
        </span>
      ) : openTills > 0 ? (
        <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-black">
          {openTills} Open
        </span>
      ) : null,
    },
    {
      id: 'kitchen',
      label: 'Kitchen Pipeline',
      icon: <UtensilsCrossed className="h-4 w-4" />,
      badge: totalKitchenOrders > 0 ? (
        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-black text-white">
          {totalKitchenOrders}
        </span>
      ) : null,
    },
  ];

  return (
    <div className="flex overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-100/70 p-1.5 dark:border-slate-800/80 dark:bg-slate-900/60 backdrop-blur-sm scrollbar-none">
      <div className="flex w-full min-w-max gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200",
                active
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40"
              )}
            >
              {tab.icon}
              <span className="uppercase tracking-wider font-extrabold">{tab.label}</span>
              {tab.badge && <span className="ml-1">{tab.badge}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
