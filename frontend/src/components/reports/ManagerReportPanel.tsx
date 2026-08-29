import { useState } from 'react';
import { BarChart3, Lock, ShieldCheck, X } from 'lucide-react';
import { ManagerAccessGate } from '@/components/reports/ManagerAccessGate';
import { ManagerReportDashboard } from '@/components/reports/ManagerReportDashboard';
import { ManagerReportFilters } from '@/components/reports/ManagerReportFilters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MANAGER_REPORT_PASSWORD } from '@/data/reportDemo';
import { buildManagerReport } from '@/utils/reports';
import { Invoice } from '@/types/pos';
import { ManagerReportFilters as ReportFilters } from '@/types/reports';
import { localDefault } from '@/config/localCredentials';
import { useTranslation } from '@/i18n';

interface ManagerReportPanelProps {
  invoices: Invoice[];
}

const defaultFilters: ReportFilters = {
  dataset: 'combined',
  range: '30d',
  startDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  category: 'all',
  trendGrouping: 'day',
  rankingMetric: 'revenue',
  includeDeals: true,
};

export function ManagerReportPanel({ invoices }: ManagerReportPanelProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState(localDefault(MANAGER_REPORT_PASSWORD));
  const [unlocked, setUnlocked] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>(defaultFilters);
  const report = buildManagerReport(invoices, filters);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPassword(localDefault(MANAGER_REPORT_PASSWORD));
      setUnlocked(false);
    }
  };

  const handleUnlock = () => {
    if (password !== MANAGER_REPORT_PASSWORD) {
      toast({
        title: 'Access denied',
        description: 'The manager password is incorrect.',
        variant: 'destructive',
      });
      return;
    }

    setUnlocked(true);
    toast({
      title: 'Manager access granted',
      description: 'Reporting panel unlocked successfully.',
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-manager-btn="true"
        className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] h-11 px-2.5 py-1 rounded-xl border border-special/60 dark:border-special/70 bg-special-subtle hover:bg-special-subtle hover:border-special transition-all cursor-pointer shadow-md active:scale-[0.96] group shrink-0 relative"
      >
        {/* Top row: F12 + BarChart3 Icon */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-black text-xs sm:text-[13px] text-special-text group-hover:text-special transition-colors">
            F12
          </span>
          <BarChart3 className="w-4 h-4 shrink-0 text-special-text transition-transform duration-150 group-hover:scale-110" />
        </div>

        {/* Bottom row: Manager label */}
        <span className="font-display font-extrabold text-[11px] sm:text-xs text-special-text dark:text-special tracking-tight leading-tight mt-0.5">
          {t.common.manager}
        </span>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[min(1500px,96vw)] h-[94vh] gap-0 overflow-hidden rounded-[32px] border border-border/70 bg-background/95 p-0 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.75)] backdrop-blur-2xl [&>button]:hidden">
          <div className="flex items-center justify-between border-b border-border/70 bg-card/70 px-6 py-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t.managerReport.panelTitle}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                {t.managerReport.panelDesc}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon"
            aria-label="Close" onClick={() => handleOpenChange(false)} className="rounded-2xl cursor-pointer">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="h-[calc(94vh-82px)] overflow-hidden p-4">
            {!unlocked ? (
              <ManagerAccessGate
                password={password}
                isSubmitting={false}
                onPasswordChange={setPassword}
                onUnlock={handleUnlock}
              />
            ) : (
              <div className="flex h-full flex-col gap-4 overflow-hidden">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_auto]">
                  <div className="rounded-[28px] border border-border/70 bg-card/80 p-4 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.55)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/75">{t.managerReport.accessScope}</p>
                        <h3 className="text-xl font-bold text-foreground">{t.managerReport.ownerVisibility}</h3>
                        <p className="text-sm text-muted-foreground">
                          {report.meta.datasetLabel} across {report.meta.windowLabel.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      className="h-12 rounded-2xl border-border/70 bg-card/80 px-5 cursor-pointer"
                      onClick={() => handleOpenChange(false)}
                    >
                      {t.managerReport.lockPanel}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 pos-scrollbar">
                  <div className="space-y-4 pb-4">
                    <ManagerReportFilters filters={filters} onChange={setFilters} />
                    <ManagerReportDashboard report={report} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ManagerReportPanel;

