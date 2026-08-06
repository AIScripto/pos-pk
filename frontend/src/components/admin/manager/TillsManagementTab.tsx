import { Monitor, CheckCircle2 } from 'lucide-react';
import { SectionHeader, PanelHeader, THEMES, formatTime } from './ManagerCommon';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';

interface TillsManagementTabProps {
  data: any;
  isLoading: boolean;
  openTills: number;
  pendingTills: number;
  activeTillsList: any[];
  forceClose: any;
  approveClose: any;
  rejectClose: any;
  openModalPrompt: (params: any) => void;
}

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
          <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm", THEMES.emerald.border)}>
            <PanelHeader
              theme="emerald"
              icon={<Monitor className="h-4 w-4" />}
              title="Open Tills"
              subtitle={`Live sessions for ${data?.businessDate ?? 'today'}`}
              right={
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${openTills > 0 ? THEMES.emerald.badge : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {openTills} open
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {['Till', 'Cashier', 'Shift', 'Orders', 'Sale', 'Action'].map((h, i) => (
                      <th key={h} className={`px-5 py-3 text-[11px] font-black uppercase tracking-wide text-slate-500 ${i >= 3 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeTillsList.map((till) => (
                    <tr key={till.sessionId} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="px-5 py-3">
                        <p className="font-bold text-slate-950 dark:text-white">{till.terminalName}</p>
                        <p className="text-xs text-slate-400">{till.terminalCode ?? `#${till.terminalId}`}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{till.openedBy || 'Cashier'}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{till.shiftName ?? '—'}</p>
                        <p className="text-xs text-slate-400">{formatTime(till.openedAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-950 dark:text-white" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>{till.orderCount}</td>
                      <td className="px-5 py-3 text-right font-black text-emerald-600" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>{formatCurrency(till.currentSale)}</td>
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
                          className="inline-flex h-8 items-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 transition disabled:opacity-50"
                        >
                          Force Close
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && openTills === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No tills are currently open.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Closes Approvals */}
          <div className={cn("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-850 dark:bg-slate-900/25 hover:dark:bg-slate-900/35 hover:border-slate-700/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm", THEMES.amber.border)}>
            <PanelHeader
              theme="amber"
              icon={<CheckCircle2 className="h-4 w-4" />}
              title="Pending Till Closings"
              subtitle="Awaiting manager approval"
              right={
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${pendingTills > 0 ? THEMES.amber.badge : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {pendingTills} pending
                </span>
              }
            />
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data?.pendingCloseTills ?? []).map((till: any) => (
                <div key={till.sessionId} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-950 dark:text-white">{till.terminalName}</p>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-700">PENDING</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {till.openedBy || 'Cashier'} · submitted {till.submittedAt ? formatTime(till.submittedAt) : '—'}
                    </p>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        Closing <span className="text-slate-950 dark:text-white font-bold" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '14.5px' }}>{formatCurrency((till.closingCashPaisa ?? 0) / 100)}</span>
                      </span>
                      <span className={`font-semibold ${(till.variance ?? 0) === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        Variance <span className="font-bold" style={{ fontFamily: "'Roboto', sans-serif", fontSize: '14.5px' }}>{formatCurrency((till.variance ?? 0) / 100)}</span>
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
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50 transition"
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
                      className="inline-flex h-9 items-center rounded-xl border border-red-200 px-4 text-xs font-black text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 disabled:opacity-50 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {!isLoading && pendingTills === 0 && (
                <p className="px-5 py-10 text-center text-sm text-slate-400">No till closings are waiting for approval.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
