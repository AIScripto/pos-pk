import type { ReactNode } from 'react';
import { Monitor, CheckCircle2, ReceiptText, WalletCards } from 'lucide-react';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';

export function KpiCard({ title, value, icon, accent, large }: {
  title: string; value: string; icon: ReactNode;
  accent: 'neutral' | 'emerald' | 'amber'; large?: boolean;
}) {
  const iconBg =
    accent === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
    accent === 'amber'   ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                           'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
  const valueCls = accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-950 dark:text-white';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={cn("mt-2 text-3.5xl font-black tracking-tight", valueCls)} style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}>{value}</p>
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  );
}

interface ManagerKpiGridProps {
  isLoading: boolean;
  openTills: number;
  pendingTills: number;
  totalOrders: number;
  currentSale: number;
}

export function ManagerKpiGrid({
  isLoading,
  openTills,
  pendingTills,
  totalOrders,
  currentSale,
}: ManagerKpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard title="Open Tills"     value={isLoading ? '—' : String(openTills)}   icon={<Monitor className="h-5 w-5" />}    accent={openTills > 0 ? 'emerald' : 'neutral'} />
      <KpiCard title="Pending Closes" value={isLoading ? '—' : String(pendingTills)} icon={<CheckCircle2 className="h-5 w-5" />} accent={pendingTills > 0 ? 'amber' : 'neutral'} />
      <KpiCard title="Total Orders"   value={isLoading ? '—' : String(totalOrders)} icon={<ReceiptText className="h-5 w-5" />} accent="neutral" />
      <KpiCard title="Current Sale"   value={isLoading ? '—' : formatCurrency(currentSale)} icon={<WalletCards className="h-5 w-5" />} accent="emerald" large />
    </div>
  );
}
