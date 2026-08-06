import { Banknote, CalendarDays, Clock3, Lock, Play, StopCircle } from 'lucide-react';
import { SectionHeader, formatDate } from './ManagerCommon';
import { OperationsCard } from './OperationsCard';
import { ClosingSummaryCard } from './ClosingSummaryCard';

interface OperationsControlTabProps {
  ops: any;
  isLoading: boolean;
  branchId: string;
  openDay: any;
  closeDay: any;
  openShift: any;
  closeShift: any;
  openTills: number;
  pendingTills: number;
  canCloseDay: boolean;
  canCloseShift: boolean;
  shiftSummary: any;
  daySummary: any;
  openModalPrompt: (params: any) => void;
}

export function OperationsControlTab({
  ops,
  isLoading,
  branchId,
  openDay,
  closeDay,
  openShift,
  closeShift,
  openTills,
  pendingTills,
  canCloseDay,
  canCloseShift,
  shiftSummary,
  daySummary,
  openModalPrompt,
}: OperationsControlTabProps) {
  return (
    <div className="space-y-6">

      {/* Section: Operations Control */}
      <div className="space-y-3">
        <SectionHeader icon={<CalendarDays className="h-4 w-4" />} label="Operations Control" theme="blue" />
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

      {/* Section: Closing Reviews */}
      <div className="space-y-3">
        <SectionHeader icon={<Banknote className="h-4 w-4" />} label="Closing Financial Reviews" theme="violet" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ClosingSummaryCard
            theme="violet"
            title="Shift Closing Review"
            subtitle={shiftSummary
              ? `${shiftSummary.shift.name} · ${shiftSummary.shift.startTime}–${shiftSummary.shift.endTime}`
              : 'Open a shift to start the review'}
            totals={shiftSummary?.totals}
            lines={shiftSummary?.tills ?? []}
            emptyText="No active shift summary is available."
          />
          <ClosingSummaryCard
            theme="purple"
            title="Business Day Review"
            subtitle={daySummary ? formatDate(daySummary.businessDay.businessDate) : 'Open the business day to start the review'}
            totals={daySummary?.totals}
            lines={daySummary?.shifts.map((shift: any) => ({
              sessionId:         shift.shift.id,
              terminalName:      shift.shift.name,
              terminalCode:      `${shift.shift.startTime}–${shift.shift.endTime}`,
              openedByName:      shift.shift.status,
              status:            shift.shift.status,
              openedAt:          shift.shift.openedAt,
              closeSubmittedAt:  null,
              approvedAt:        null,
              invoiceCount:      shift.totals.invoiceCount,
              grossSalesPaisa:   shift.totals.grossSalesPaisa,
              cashSalesPaisa:    shift.totals.cashSalesPaisa,
              openingCashPaisa:  shift.totals.openingCashPaisa,
              expectedCashPaisa: shift.totals.expectedCashPaisa,
              actualCashPaisa:   shift.totals.actualCashPaisa,
              variancePaisa:     shift.totals.variancePaisa,
            })) ?? []}
            emptyText="No business day summary is available."
          />
        </div>
      </div>

    </div>
  );
}
