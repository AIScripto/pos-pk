import type { ReactNode } from 'react';
import { Monitor, CheckCircle2, ReceiptText, WalletCards } from 'lucide-react';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';

export function KpiCard({ title, value, icon, accent, large }: {
  title: string; value: string; icon: ReactNode;
  accent: 'neutral' | 'emerald' | 'amber'; large?: boolean;
}) {
  const iconBg =
    accent === 'emerald' ? 'bg-success-subtle text-success-text' :
    accent === 'amber'   ? 'bg-warning-subtle text-warning-text' :
                           'bg-secondary text-muted-foreground';
  const valueCls = accent === 'emerald' ? 'text-success-text' : 'text-foreground dark:text-white';

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-sm dark:bg-muted/25 hover:dark:bg-muted/35 hover:border-primary/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{title}</p>
          className="font-display font-black" <p className={cn("mt-2 text-4xl font-black tracking-tight", valueCls)} >{value}</p>
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
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <KpiCard title={t.till.openShift}     value={isLoading ? '—' : String(openTills)}   icon={<Monitor className="h-5 w-5" />}    accent={openTills > 0 ? 'emerald' : 'neutral'} />
      <KpiCard title={t.till.pendingVerification} value={isLoading ? '—' : String(pendingTills)} icon={<CheckCircle2 className="h-5 w-5" />} accent={pendingTills > 0 ? 'amber' : 'neutral'} />
      <KpiCard title={t.managerReport.totalOrders}   value={isLoading ? '—' : String(totalOrders)} icon={<ReceiptText className="h-5 w-5" />} accent="neutral" />
      <KpiCard title={t.managerReport.netSales}   value={isLoading ? '—' : formatCurrency(currentSale)} icon={<WalletCards className="h-5 w-5" />} accent="emerald" large />
    </div>
  );
}

