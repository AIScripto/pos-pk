import { AlertTriangle, ArrowRight, CalendarDays, Clock3, Lock, Monitor, Play, StopCircle, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { SectionHeader, KITCHEN_STATES, formatDate } from './ManagerCommon';
import { OperationsCard } from './OperationsCard';
import { formatCurrency } from '@/utils/pos';

interface OverviewTabProps {
  pendingTills: number;
  openTills: number;
  totalKitchenOrders: number;
  activeTillsList: any[];
  kitchenByState: Map<string, any[]>;
  ops: any;
  isLoading: boolean;
  branchId: string;
  openDay: any;
  closeDay: any;
  openShift: any;
  closeShift: any;
  canCloseDay: boolean;
  canCloseShift: boolean;
  openModalPrompt: (params: any) => void;
  setActiveTab: (tab: 'overview' | 'openclosing' | 'tills' | 'kitchen') => void;
}

export function OverviewTab({
  pendingTills,
  openTills,
  totalKitchenOrders,
  activeTillsList,
  kitchenByState,
  ops,
  isLoading,
  branchId,
  openDay,
  closeDay,
  openShift,
  closeShift,
  canCloseDay,
  canCloseShift,
  openModalPrompt,
  setActiveTab,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">

      {/* Pending Till Approvals Callout Banner */}
      {pendingTills > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50/80 p-4 dark:border-amber-800/80 dark:bg-amber-950/40 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-200">Action Required: Till Closings Waiting Approval</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {pendingTills} terminal till {pendingTills === 1 ? 'session has' : 'sessions have'} been submitted for closing and {pendingTills === 1 ? 'requires' : 'require'} manager approval.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tills')}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 text-xs font-black text-white hover:bg-amber-700 transition"
          >
            Review Approvals <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Operations Quick Status Cards */}
      <div className="space-y-3">
        <SectionHeader icon={<TrendingUp className="h-4 w-4" />} label="Operations Quick Status" theme="blue" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <OperationsCard
            theme="blue"
            icon={<CalendarDays className="h-5 w-5" />}
            title="Business Day"
            status={ops?.businessDay?.status ?? 'not open'}
            detail={ops?.businessDay
              ? `${formatDate(ops.businessDay.businessDate)} · ${ops.businessDay.openedByName || 'Manager'}`
              : `Suggested ${ops?.suggestedBusinessDate ?? 'today'}`}
            actionLabel={ops?.businessDay ? 'Close Day' : 'Open Day'}
            actionIcon={ops?.businessDay ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            actionVariant={ops?.businessDay ? 'danger' : 'primary'}
            isPending={openDay.isPending || closeDay.isPending}
            disabled={!branchId || isLoading || openDay.isPending || closeDay.isPending || Boolean(ops?.shiftSession) || openTills > 0 || pendingTills > 0 || (ops?.businessDay ? !canCloseDay : false)}
            onAction={() => {
              if (!ops?.businessDay) return openDay.mutate();
              openModalPrompt({
                title: 'Close Business Day',
                description: 'Are you sure you want to close this business day? All active shifts must be closed, and all tills cleared.',
                inputLabel: 'Closing Notes',
                defaultValue: '',
                theme: 'danger',
                onConfirm: (notes: string) => closeDay.mutate(notes),
              });
            }}
          />

          <OperationsCard
            theme="orange"
            icon={<Clock3 className="h-5 w-5" />}
            title="Shift"
            status={ops?.shiftSession?.status ?? 'not open'}
            detail={ops?.shiftSession
              ? `${ops.shiftSession.name} · ${ops.shiftSession.startTime}–${ops.shiftSession.endTime}`
              : ops?.suggestedShift
                ? `Next: ${ops.suggestedShift.name} ${ops.suggestedShift.startTime}–${ops.suggestedShift.endTime}`
                : 'No remaining shifts today'}
            actionLabel={ops?.shiftSession ? 'Close Shift' : 'Open Shift'}
            actionIcon={ops?.shiftSession ? <StopCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            actionVariant={ops?.shiftSession ? 'warning' : 'primary'}
            isPending={openShift.isPending || closeShift.isPending}
            disabled={!ops?.businessDay || openShift.isPending || closeShift.isPending || openTills > 0 || pendingTills > 0 || (!ops?.shiftSession && !ops?.suggestedShift) || (ops?.shiftSession ? !canCloseShift : false)}
            onAction={() => {
              if (!ops?.shiftSession) return openShift.mutate();
              openModalPrompt({
                title: 'Close Current Shift',
                description: 'Are you sure you want to close this shift? All till sessions must be closed first.',
                inputLabel: 'Shift Closing Notes',
                defaultValue: '',
                theme: 'orange',
                onConfirm: (notes: string) => closeShift.mutate(notes),
              });
            }}
          />
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Till Quick Summary */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900/25 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Tills Summary</h3>
            </div>
            <button
              onClick={() => setActiveTab('tills')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              View All ({openTills}) →
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {activeTillsList.slice(0, 3).map((till) => (
              <div key={till.sessionId} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800/40">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{till.terminalName}</span>
                  <span className="ml-2 text-slate-400">({till.openedBy || 'Cashier'})</span>
                </div>
                <span className="font-black text-emerald-600" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  {formatCurrency(till.currentSale)}
                </span>
              </div>
            ))}
            {openTills === 0 && (
              <p className="py-4 text-center text-xs text-slate-400">No open tills currently active.</p>
            )}
          </div>
        </div>

        {/* Kitchen Quick Summary */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-900/25 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Kitchen Pipeline Summary</h3>
            </div>
            <button
              onClick={() => setActiveTab('kitchen')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              Live Board ({totalKitchenOrders}) →
            </button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {KITCHEN_STATES.map((s) => {
              const count = (kitchenByState.get(s.key) ?? []).length;
              return (
                <div key={s.key} className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{s.label}</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
