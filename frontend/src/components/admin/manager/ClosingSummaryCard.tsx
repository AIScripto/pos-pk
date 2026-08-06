import { AlertTriangle, Banknote, Boxes } from 'lucide-react';
import { THEMES, Theme, PanelHeader } from './ManagerCommon';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';

export function ReviewMetric({ label, value, accent = 'neutral' }: { label: string; value: string; accent?: 'neutral' | 'good' | 'bad' }) {
  const color = accent === 'good' ? 'text-emerald-600 dark:text-emerald-400' : accent === 'bad' ? 'text-red-600 dark:text-rose-400' : 'text-slate-950 dark:text-white';
  return (
    <div className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-800/80 bg-white dark:bg-slate-950/20 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={cn("mt-1 text-2xl font-black tracking-tight", color)} style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}>{value}</p>
    </div>
  );
}

export function ReviewPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-900/40">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-base font-black text-slate-900 dark:text-slate-100" style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 900 }}>{value}</p>
    </div>
  );
}

export function ClosingSummaryCard({ theme, title, subtitle, totals, lines, emptyText }: {
  theme: Theme;
  title: string;
  subtitle: string;
  totals?: {
    invoiceCount: number; grossSalesPaisa: number; totalDiscountPaisa: number;
    totalTaxPaisa: number; cashSalesPaisa: number; cardSalesPaisa: number;
    walletSalesPaisa: number; codPendingPaisa: number; expectedCashPaisa: number;
    actualCashPaisa: number; variancePaisa: number;
    openTills: number; pendingCloseTills: number; closedTills: number;
  };
  lines: {
    sessionId: string; terminalName: string; terminalCode: string | null;
    openedByName: string; status: string; invoiceCount: number;
    grossSalesPaisa: number; expectedCashPaisa: number;
    actualCashPaisa: number | null; variancePaisa: number | null;
  }[];
  emptyText: string;
}) {
  const t = THEMES[theme];
  const hasBlock = Boolean(totals && (totals.openTills > 0 || totals.pendingCloseTills > 0));

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm ${t.border}`}>
      <PanelHeader
        theme={theme}
        icon={hasBlock ? <AlertTriangle className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
        title={title}
        subtitle={subtitle}
      />

      {totals ? (
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ReviewMetric label="Sales"         value={formatCurrency(totals.grossSalesPaisa / 100)} />
            <ReviewMetric label="Cash"          value={formatCurrency(totals.cashSalesPaisa / 100)} />
            <ReviewMetric label="Expected Cash" value={formatCurrency(totals.expectedCashPaisa / 100)} />
            <ReviewMetric
              label="Variance"
              value={Math.abs(totals.variancePaisa) < 100
                ? formatCurrency(0)
                : formatCurrency(totals.variancePaisa / 100)}
              accent={Math.abs(totals.variancePaisa) < 100 ? 'neutral' : totals.variancePaisa > 0 ? 'good' : 'bad'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <ReviewPill label="Orders" value={String(totals.invoiceCount)} />
            <ReviewPill label="Card"   value={formatCurrency(totals.cardSalesPaisa / 100)} />
            <ReviewPill label="Wallet" value={formatCurrency(totals.walletSalesPaisa / 100)} />
            <ReviewPill label="COD"    value={formatCurrency(totals.codPendingPaisa / 100)} />
          </div>

          {hasBlock && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Close blocked — {totals.openTills} open till(s) and {totals.pendingCloseTills} pending approval(s) must be cleared first.</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {['Unit', 'Status', 'Orders', 'Sales', 'Variance'].map((h, i) => (
                    <th key={h} className={`pb-2 pr-3 text-[11px] font-black uppercase tracking-wide text-slate-400 ${i >= 2 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.sessionId} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-3">
                      <p className="font-bold text-slate-950 dark:text-white">{line.terminalName}</p>
                      <p className="text-xs text-slate-400">{line.terminalCode || line.openedByName || '—'}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-black uppercase ${line.status === 'open' ? 'bg-emerald-100 text-emerald-700' : line.status === 'closed' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-amber-100 text-amber-700'}`}>
                        {line.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right font-bold text-slate-950 dark:text-white" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>{line.invoiceCount}</td>
                    <td className="py-3 pr-3 text-right font-bold text-slate-950 dark:text-white" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>{formatCurrency(line.grossSalesPaisa / 100)}</td>
                    <td className="py-3 pr-3 text-right font-black" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>
                      {line.variancePaisa == null ? '—' : (
                        <span className={
                          Math.abs(line.variancePaisa) < 100
                            ? 'text-slate-500'
                            : line.variancePaisa > 0 ? 'text-emerald-600' : 'text-rose-500'
                        }>
                          {Math.abs(line.variancePaisa) < 100 ? formatCurrency(0) : formatCurrency(line.variancePaisa / 100)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {lines.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-400">{emptyText}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
          <Boxes className="mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
