import type { ManagerPanelState } from '@/hooks/useManagerPanelState';
import { Monitor, CheckCircle2 } from 'lucide-react';
import { SectionHeader, PanelHeader, THEMES, formatTime } from './ManagerCommon';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';

type TillsManagementTabProps = Pick<
  ManagerPanelState,
  | 'data'
  | 'isLoading'
  | 'openTills'
  | 'pendingTills'
  | 'activeTillsList'
  | 'forceClose'
  | 'approveClose'
  | 'rejectClose'
  | 'openModalPrompt'
>;

export function TillsManagementTab({
  data,
  isLoading,
  openTills,
  pendingTills,
  activeTillsList,
  forceClose,
  approveClose,
  rejectClose,
  openModalPrompt,
}: TillsManagementTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionHeader icon={<Monitor className="h-4 w-4" />} label="Till Management & Approvals" theme="amber" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Open Tills Table */}
          <div className={cn("overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-muted/25 hover:dark:bg-muted/35 hover:border-primary/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm", THEMES.emerald.border)}>
            <PanelHeader
              theme="emerald"
              icon={<Monitor className="h-4 w-4" />}
              title="Open Tills"
              subtitle={`Live sessions for ${data?.businessDate ?? 'today'}`}
              right={
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${openTills > 0 ? THEMES.emerald.badge : 'bg-secondary text-muted-foreground'}`}>
                  {openTills} open
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    {['Till', 'Cashier', 'Shift', 'Orders', 'Sale', 'Action'].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[11px] font-black uppercase tracking-wide text-muted-foreground ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTillsList.map((till) => (
                    <tr key={till.sessionId} className="border-t border-border">
                      <td className="px-5 py-3">
                        <p className="font-bold text-foreground dark:text-white">{till.terminalName}</p>
                        <p className="text-xs text-muted-foreground/70">{till.terminalCode ?? `#${till.terminalId}`}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{till.openedBy || 'Cashier'}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-foreground">{till.shiftName ?? '—'}</p>
                        <p className="text-xs text-muted-foreground/70">{formatTime(till.openedAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-foreground dark:text-white" style={{ fontSize: '15px' }}>{till.orderCount}</td>
                      <td className="px-5 py-3 text-right font-black text-success-text" style={{ fontSize: '15px' }}>{formatCurrency(till.currentSale)}</td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => {
                            openModalPrompt({
                              title: 'Force Close Till Session',
                              description: `Force close terminal ${till.terminalName} (${till.openedBy || 'Cashier'}). Use this if the terminal is offline or abandoned.`,
                              inputLabel: 'Reason / Force Close Notes',
                              defaultValue: '',
                              theme: 'danger',
                              onConfirm: (notes: string) => forceClose.mutate({ sessionId: till.sessionId, notes }),
                            });
                          }}
                          disabled={forceClose.isPending}
                          className="inline-flex h-8 items-center rounded-lg border border-danger-border bg-danger-subtle px-3 text-xs font-black text-danger-text hover:bg-danger-subtle dark:hover:bg-danger/60 transition disabled:opacity-50"
                        >
                          Force Close
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && openTills === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground/70">No tills are currently open.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Closes Approvals */}
          <div className={cn("overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:bg-muted/25 hover:dark:bg-muted/35 hover:border-primary/40 hover:shadow-lg transition-all duration-200 backdrop-blur-sm", THEMES.amber.border)}>
            <PanelHeader
              theme="amber"
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Pending Till Closings"
              subtitle="Awaiting manager approval"
              right={
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${pendingTills > 0 ? THEMES.amber.badge : 'bg-secondary text-muted-foreground'}`}>
                  {pendingTills} pending
                </span>
              }
            />
            <div className="divide-y divide-border">
              {(data?.pendingCloseTills ?? []).map((till) => (
                <div key={till.sessionId} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground dark:text-white">{till.terminalName}</p>
                      <span className="rounded bg-warning-subtle px-1.5 py-0.5 text-2xs font-black text-warning-text">PENDING</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {till.openedBy || 'Cashier'} · submitted {till.submittedAt ? formatTime(till.submittedAt) : '—'}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="font-semibold text-foreground">
                        Closing <span className="text-foreground dark:text-white font-bold" style={{ fontSize: '14.5px' }}>{formatCurrency((till.closingCashPaisa ?? 0) / 100)}</span>
                      </span>
                      <span className={`font-semibold ${(till.variance ?? 0) === 0 ? 'text-success-text' : 'text-danger-text'}`}>
                        Variance <span className="font-bold" style={{ fontSize: '14.5px' }}>{formatCurrency((till.variance ?? 0) / 100)}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        openModalPrompt({
                          title: 'Approve Till Closing',
                          description: `Confirm closing figures for terminal ${till.terminalName}. Closing Cash: ${formatCurrency((till.closingCashPaisa ?? 0) / 100)}, Variance: ${formatCurrency((till.variance ?? 0) / 100)}.`,
                          inputLabel: 'Approval Notes',
                          defaultValue: '',
                          theme: 'emerald',
                          onConfirm: (notes: string) => approveClose.mutate({ sessionId: till.sessionId, notes }),
                        });
                      }}
                      disabled={approveClose.isPending}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-success px-4 text-xs font-black text-white hover:bg-success/90 disabled:opacity-50 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        openModalPrompt({
                          title: 'Reject Till Closing',
                          description: `Reject this closing request and return terminal ${till.terminalName} back to the cashier for correction.`,
                          inputLabel: 'Reason for Rejection',
                          defaultValue: '',
                          theme: 'danger',
                          onConfirm: (notes: string) => rejectClose.mutate({ sessionId: till.sessionId, notes }),
                        });
                      }}
                      disabled={rejectClose.isPending}
                      className="inline-flex h-9 items-center rounded-xl border border-danger-border px-4 text-xs font-black text-danger-text hover:bg-danger-subtle disabled:opacity-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!isLoading && pendingTills === 0 && (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground/70">No till closings are waiting for approval.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
