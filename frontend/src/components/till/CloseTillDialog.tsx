import { useState, useEffect } from 'react';
import { useTill } from '@/context/TillContext';
import { useToast } from '@/hooks/use-toast';
import { blankDenominations, sumDenominations } from '@/types/till';
import { DenominationTable } from './DenominationTable';
import { formatCurrency } from '@/utils/pos';
import { useAppConfig } from '@/context/AppConfigContext';
import { tillApi, ApiTillSummary } from '@/lib/api/till.api';
import { Invoice } from '@/types/pos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Lock, Banknote, StickyNote, CheckCircle2, AlertTriangle,
  TrendingUp, CreditCard, Wallet, ChevronDown, ChevronUp,
  Printer, Loader2,
} from 'lucide-react';

interface CloseTillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoices: Invoice[];
}

type Step = 'count' | 'summary';

export function CloseTillDialog({ open, onOpenChange, invoices }: CloseTillDialogProps) {
  const { currencyConfig, orgConfig } = useAppConfig();
  const { session, closeTill } = useTill();
  const { toast } = useToast();
  const [step,          setStep]          = useState<Step>('count');
  const [denominations, setDenominations] = useState(() => blankDenominations(currencyConfig.currencyCode));
  const [notes,         setNotes]         = useState('');

  useEffect(() => {
    setDenominations(blankDenominations(currencyConfig.currencyCode));
  }, [currencyConfig.currencyCode]);
  const [confirmed,     setConfirmed]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [showCatDetail,  setShowCatDetail]  = useState(false);
  const [showDenomDetail, setShowDenomDetail] = useState(false);

  // Server-side summary — fetched when the cashier moves to the summary step.
  // This is the source of truth; local CartContext invoices are NOT used for
  // the summary because they may be incomplete after hydration filtering.
  const [serverSummary, setServerSummary]   = useState<ApiTillSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!open || !session?.id || serverSummary) return;
    setSummaryLoading(true);
    tillApi.summary(session.id)
      .then(setServerSummary)
      .catch(() => toast({ title: 'Could not load summary from server', variant: 'destructive' }))
      .finally(() => setSummaryLoading(false));
  }, [open, session?.id, serverSummary, toast]);

  // Derive display values from server summary (in paisa → rupees ÷100)
  const p = (paisa: number | undefined) => (paisa ?? 0) / 100;
  const grossSales      = p(serverSummary?.grossSalesPaisa);
  const totalDiscount   = p(serverSummary?.totalDiscountPaisa);
  const netSales        = p(serverSummary?.netSalesPaisa);
  const totalTax        = p(serverSummary?.totalTaxPaisa);
  const cashSales       = p(serverSummary?.cashSalesPaisa);
  const cardSales       = p(serverSummary?.cardSalesPaisa);
  const codPending      = p(serverSummary?.codPendingPaisa);
  const openingCash     = p(serverSummary?.openingCashPaisa ?? serverSummary?.session?.openingCashPaisa);
  const expectedCash    = openingCash + cashSales;
  const totalTx         = serverSummary?.totalTransactions ?? 0;

  const closingTotal = sumDenominations(denominations);
  const variance     = closingTotal - expectedCash;
  const isShort      = variance < 0;
  const isOver       = variance > 0;
  const isBalanced   = Math.abs(variance) < 0.005;

  const sessionStart = session ? new Date(session.openedAt) : null;
  const sessionDuration = sessionStart
    ? formatDuration(Date.now() - sessionStart.getTime())
    : '—';

  const TILL_CLOSE_ERROR_MESSAGES: Record<string, string> = {
    ACTIVE_ORDERS_IN_QUEUE: 'Cannot submit till close: There are active or pending orders in the kitchen. Please serve or process kitchen orders first.',
    TILL_NOT_OPEN: 'This till session is no longer open.',
    SESSION_NOT_FOUND: 'Till session not found. Please refresh and try again.',
    BUSINESS_DAY_NOT_OPEN: 'The business day is currently closed.',
    SHIFT_NOT_OPEN: 'The shift session is currently closed.',
  };

  const handleConfirmClose = async () => {
    setLoading(true);
    try {
      await closeTill(denominations, notes);
      toast({ title: 'Till submitted', description: 'Manager approval is required to finalize this till closing.' });
      reset();
      onOpenChange(false);
    } catch (err: Error | unknown) {
      const rawMsg = err instanceof Error ? err.message : 'Server error';
      const friendlyMsg = TILL_CLOSE_ERROR_MESSAGES[rawMsg] ?? rawMsg;
      toast({ title: 'Failed to close till', description: friendlyMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('count');
    setDenominations(blankDenominations(currencyConfig.currencyCode));
    setNotes('');
    setConfirmed(false);
    setShowCatDetail(false);
    setServerSummary(null);  // clear so next open re-fetches fresh data
  };

  if (!session) return null;

  // ── STEP 1: Count Cash ──────────────────────────────────────────────────────
  const CountStep = (
    <>
      <div className="flex-1 overflow-y-auto pos-scrollbar px-6 py-4 space-y-5">
        {/* Session info banner */}
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display font-bold text-xs text-muted-foreground uppercase tracking-wide">Session</span>
            <span className="font-display font-semibold text-xs text-muted-foreground">{sessionDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-foreground">{session.openedBy}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {sessionStart?.toLocaleTimeString(currencyConfig.locale, { hour: '2-digit', minute: '2-digit', hour12: false })} — Now
            </span>
          </div>
        </div>

        {/* Live Sales & Expected Cash Summary */}
        {summaryLoading ? (
          <div className="flex items-center justify-center gap-2 py-4 rounded-xl border border-border bg-secondary/20">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-semibold">Loading till session data...</span>
          </div>
        ) : serverSummary ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
              <span className="font-display font-extrabold text-[11px] uppercase tracking-wider text-amber-500">
                Expected Cash in Drawer
              </span>
              <span className="font-mono font-black text-sm text-amber-400">
                {formatCurrency(expectedCash)}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sales</p>
                <p className="font-mono text-xs font-semibold text-foreground mt-0.5">{formatCurrency(netSales + totalTax)}</p>
              </div>
              <div className="border-x border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cash Sales</p>
                <p className="font-mono text-xs font-semibold text-foreground mt-0.5">{formatCurrency(cashSales)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Sales</p>
                <p className="font-mono text-xs font-semibold text-foreground mt-0.5">{formatCurrency(cardSales)}</p>
              </div>
            </div>
          </div>
        ) : null}
        {/* Denomination count */}
        <div>
          <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Banknote className="w-3 h-3" />
            Count Closing Cash — Enter Each Denomination
          </label>
          <DenominationTable
            entries={denominations}
            onChange={setDenominations}
            showTotal
            highlightFilled
          />
        </div>

        {/* Notes */}
        <div>
          <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <StickyNote className="w-3 h-3" />
            Shift Notes (optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any incidents, discrepancies or handover notes…"
            className="pos-notes-input"
          />
        </div>
      </div>

      <div className="flex gap-2 px-6 py-4 border-t border-border shrink-0">
        <button
          onClick={() => { reset(); onOpenChange(false); }}
          className="flex-1 rounded-xl border border-border bg-secondary py-3 font-display font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => setStep('summary')}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold text-sm text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, hsl(24 100% 50%), hsl(38 92% 50%))' }}
        >
          Review Summary →
        </button>
      </div>
    </>
  );

  // ── STEP 2: Summary ─────────────────────────────────────────────────────────
  const varianceColor = isShort
    ? 'text-destructive'
    : isOver
      ? 'text-amber-400'
      : 'text-pos-success';

  const SummaryStep = (
    <>
      <div className="flex-1 overflow-y-auto pos-scrollbar px-6 py-4 space-y-4">

        {/* ── Session header ── */}
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
          <p className="font-display font-extrabold text-[13px] text-foreground uppercase tracking-wide">
            {(orgConfig?.businessName || 'Crisp&Crumbs')} POS — Terminal 1
          </p>
          <p className="font-body text-xs text-muted-foreground mt-0.5">
            {session.openedBy} · {sessionStart?.toLocaleDateString(currencyConfig.locale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {sessionStart?.toLocaleTimeString(currencyConfig.locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
            {' '}— {new Date().toLocaleTimeString(currencyConfig.locale, { hour: '2-digit', minute: '2-digit', hour12: false })}
            {'  ·  '}{sessionDuration}
          </p>
        </div>

        {/* Loading state while fetching server summary */}
        {summaryLoading && (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-semibold">Loading summary from server…</span>
          </div>
        )}

        {!summaryLoading && (
        <>
        {/* ── Sales breakdown ── */}
        <SummarySection title="Sales Breakdown" icon={<TrendingUp className="w-3.5 h-3.5" />}>
          <SummaryRow label="Total Transactions" value={String(totalTx)} mono={false} />
          <SummaryRow label="Gross Sales"        value={formatCurrency(grossSales)} />
          <SummaryRow label="Less: Discounts"    value={`(${formatCurrency(totalDiscount)})`} accent="destructive" />
          <SummaryDivider />
          <SummaryRow label="Net Sales"          value={formatCurrency(netSales)} bold />
          <SummaryRow label="Tax (GST)"          value={`+ ${formatCurrency(totalTax)}`} accent="muted" />
          <SummaryDivider />
          <SummaryRow label="Total Revenue"      value={formatCurrency(grossSales)} bold accent="primary" large />
        </SummarySection>

        {/* ── Payment methods ── */}
        <SummarySection title="Payment Methods" icon={<CreditCard className="w-3.5 h-3.5" />}>
          <SummaryRow label="Cash Sales"    value={formatCurrency(cashSales)} />
          <SummaryRow label="Card Sales"    value={formatCurrency(cardSales)} />
          {codPending > 0 && (
            <SummaryRow label="COD (Pending)" value={formatCurrency(codPending)} accent="muted" />
          )}
        </SummarySection>

        {/* ── Category sales ── */}
        {(serverSummary?.categorySales ?? []).length > 0 && (
          <SummarySection
            title="Category Sales"
            icon={<Wallet className="w-3.5 h-3.5" />}
            toggle={{ show: showCatDetail, onToggle: () => setShowCatDetail(!showCatDetail) }}
          >
            {showCatDetail && (serverSummary?.categorySales ?? []).map((cat) => (
              <SummaryRow
                key={cat.category}
                label={`${cat.category} (${cat.transactionCount} items)`}
                value={formatCurrency((cat.totalSalesPaisa ?? 0) / 100)}
              />
            ))}
            {!showCatDetail && (
              <p className="text-xs text-muted-foreground italic">Tap to expand category breakdown…</p>
            )}
          </SummarySection>
        )}

        {/* ── Cash reconciliation ── */}
        <SummarySection title="Cash Reconciliation" icon={<Banknote className="w-3.5 h-3.5" />}>
          <SummaryRow label="Opening Balance"  value={formatCurrency(openingCash)} />
          <SummaryRow label="+ Cash Sales"     value={formatCurrency(cashSales)} />
          <SummaryDivider />
          <SummaryRow label="Expected in Till" value={formatCurrency(expectedCash)} bold />
          <SummaryRow label="Actual (Counted)" value={formatCurrency(closingTotal)} bold />
          <SummaryDivider />
          <div className="flex items-center justify-between py-1">
            <span className="font-display font-extrabold text-sm text-foreground">Variance</span>
            <div className="flex items-center gap-1.5">
              {!isBalanced && (
                isShort
                  ? <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                  : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              {isBalanced && <CheckCircle2 className="w-3.5 h-3.5 text-pos-success" />}
              <span className={cn('font-mono font-bold text-sm tabular-nums', varianceColor)}>
                {isBalanced
                  ? `${currencyConfig.currencySymbol} 0  BALANCED`
                  : `${variance > 0 ? '+' : ''}${formatCurrency(variance)}  ${isShort ? 'SHORT' : 'OVER'}`}
              </span>
            </div>
          </div>
        </SummarySection>

        {/* ── Denomination detail ── */}
        <SummarySection
          title="Closing Denomination Count"
          icon={<Banknote className="w-3.5 h-3.5" />}
          toggle={{ show: showDenomDetail, onToggle: () => setShowDenomDetail(!showDenomDetail) }}
        >
          {showDenomDetail ? (
            <div className="space-y-0.5 py-1">
              {denominations.filter(d => d.count > 0).map((d) => (
                <div key={d.value} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-muted-foreground">
                    {currencyConfig.currencySymbol} {d.label} × {d.count}
                  </span>
                  <span className="font-mono font-semibold text-foreground tabular-nums">
                    = {formatCurrency(d.total)}
                  </span>
                </div>
              ))}
              {denominations.every(d => d.count === 0) && (
                <p className="text-xs text-muted-foreground italic">No denominations entered.</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">Tap to show note/coin breakdown…</p>
          )}
        </SummarySection>

        </>
        )}

        {/* Confirmation */}
        <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-border p-4">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer"
          />
          <span className="text-sm text-muted-foreground leading-relaxed">
            I confirm the closing count of{' '}
            <strong className="text-foreground">{formatCurrency(closingTotal)}</strong>{' '}
            and submit this till session for manager approval.
          </span>
        </label>
      </div>

      <div className="flex gap-2 px-6 py-4 border-t border-border shrink-0">
        <button
          onClick={() => setStep('count')}
          className="flex items-center gap-1 rounded-xl border border-border bg-secondary px-4 py-3 font-display font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          ← Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-4 py-3 font-display font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={handleConfirmClose}
          disabled={!confirmed || loading}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-display font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          style={{ background: (confirmed && !loading) ? 'linear-gradient(135deg, hsl(0 70% 45%), hsl(0 70% 35%))' : undefined, backgroundColor: (confirmed && !loading) ? undefined : 'hsl(var(--secondary))' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Submitting…' : 'Submit for Approval'}
        </button>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onOpenChange(false); } }}>
      <DialogContent className="max-w-lg max-h-[92vh] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/25">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-display font-extrabold text-[18px] text-foreground leading-tight">
                {step === 'count' ? 'Count Closing Cash' : 'Till Closing Summary'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {step === 'count'
                  ? 'Enter the closing denomination count before manager approval'
                  : 'Review the shift summary — submit for manager approval'}
              </DialogDescription>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {(['count', 'summary'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-display font-bold',
                  step === s
                    ? 'bg-primary text-white'
                    : i < (['count', 'summary'] as Step[]).indexOf(step)
                      ? 'bg-pos-success text-white'
                      : 'bg-secondary text-muted-foreground',
                )}>
                  {i + 1}
                </div>
                <span className={cn(
                  'font-display font-bold text-[10px] uppercase tracking-wide',
                  step === s ? 'text-foreground' : 'text-muted-foreground',
                )}>
                  {s === 'count' ? 'Cash Count' : 'Summary'}
                </span>
                {i < 1 && <span className="text-muted-foreground/40 text-xs">›</span>}
              </div>
            ))}
          </div>
        </DialogHeader>

        {step === 'count' ? CountStep : SummaryStep}
      </DialogContent>
    </Dialog>
  );
}

// ── Helper sub-components ──────────────────────────────────────────────────────

function SummarySection({
  title, icon, children, toggle,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  toggle?: { show: boolean; onToggle: () => void };
}) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={toggle?.onToggle}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-2.5 bg-secondary/70',
          toggle ? 'cursor-pointer hover:bg-secondary' : 'cursor-default',
        )}
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="font-display font-bold text-[11px] uppercase tracking-[0.15em] text-foreground flex-1 text-left">
          {title}
        </span>
        {toggle && (
          toggle.show
            ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
      <div className="px-4 py-2 space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({
  label, value, bold = false, accent, mono = true, large = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: 'primary' | 'destructive' | 'muted';
  mono?: boolean;
  large?: boolean;
}) {
  const valClass = cn(
    'tabular-nums',
    mono ? 'font-mono' : 'font-display',
    bold ? 'font-bold' : 'font-normal',
    large ? 'text-[18px]' : 'text-sm',
    accent === 'primary'     ? 'text-primary'
    : accent === 'destructive' ? 'text-destructive'
    : accent === 'muted'       ? 'text-muted-foreground'
    : 'text-foreground',
  );
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className={cn('text-sm', bold ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
      <span className={valClass}>{value}</span>
    </div>
  );
}

function SummaryDivider() {
  return <div className="border-t border-border/60 my-1" />;
}

function formatDuration(ms: number): string {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
