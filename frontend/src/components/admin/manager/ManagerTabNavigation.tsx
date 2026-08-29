import type { ReactNode } from 'react';
import { CalendarDays, LayoutDashboard, Monitor, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TabCategory } from '@/hooks/useManagerPanelState';
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation();

  const TABS: { id: TabCategory; label: string; icon: ReactNode; badge?: ReactNode }[] = [
    {
      id: 'overview',
      label: t.managerReport.managerOverview,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      id: 'openclosing',
      label: t.till.openShift + ' & ' + t.till.closeShift,
      icon: <CalendarDays className="h-4 w-4" />,
      badge: (hasOpenDay || hasOpenShift) ? (
        <span className="flex h-2 w-2 rounded-full bg-success" title="Active" />
      ) : null,
    },
    {
      id: 'tills',
      label: t.admin.tillSetup,
      icon: <Monitor className="h-4 w-4" />,
      badge: pendingTills > 0 ? (
        <span className="rounded-full bg-warning px-2 py-0.5 text-2xs font-black text-white animate-pulse">
          {pendingTills} {t.pos.pending}
        </span>
      ) : openTills > 0 ? (
        <span className="rounded-full bg-success-subtle text-success-text px-2 py-0.5 text-2xs font-black">
          {openTills} {t.common.active}
        </span>
      ) : null,
    },
    {
      id: 'kitchen',
      label: t.kds.kdsTitle,
      icon: <UtensilsCrossed className="h-4 w-4" />,
      badge: totalKitchenOrders > 0 ? (
        <span className="rounded-full bg-danger px-2 py-0.5 text-2xs font-black text-white">
          {totalKitchenOrders}
        </span>
      ) : null,
    },
  ];

  return (
    <div className="flex overflow-x-auto rounded-2xl border border-border/80 bg-secondary/70 p-1.5 backdrop-blur-sm scrollbar-none">
      <div className="flex w-full min-w-max gap-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                active
                  ? "bg-card text-foreground shadow-sm dark:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/40 dark:hover:bg-muted/40"
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

