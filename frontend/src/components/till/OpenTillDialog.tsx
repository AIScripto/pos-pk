import { useState, useEffect, useCallback } from 'react';
import { useTill } from '@/context/TillContext';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth.api';
import { tillApi, OpsStatus } from '@/lib/api/till.api';
import { tillConfigApi, CurrentShift } from '@/lib/api/till-config.api';
import { blankDenominations, sumDenominations } from '@/types/till';
import { DenominationTable } from './DenominationTable';
import { formatCurrency } from '@/utils/pos';
import { useToast } from '@/hooks/use-toast';
import { useAppConfig } from '@/context/AppConfigContext';
import { getRememberedPosSelection, rememberPosSelection } from '@/lib/pos-terminal-selection';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertTriangle, Banknote, CalendarDays, CheckCircle2, Clock3,
  Loader2, Monitor, RefreshCw, Store, Unlock,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OpenTillDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
}

interface TerminalOption {
  id: string; name: string; code?: string | null;
  description: string; hasOpenSession: boolean; openedBy: string | null;
}
interface BranchOption { id: string; name: string; label: string; addrCity: string; }

function normalizeId(value: unknown): string {
  return value == null ? '' : String(value).trim();
}

// ─── Waiting-for-Manager screen ───────────────────────────────────────────────
function WaitingForManager({
  ops, branchId, onRefresh, refreshing,
}: {
  ops: OpsStatus;
  branchId: string;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const items = [
    {
      label:  'Business Day',
      open:   ops.businessDayOpen,
      detail: ops.businessDayOpen
        ? `Open · ${ops.businessDate}`
        : `Not open · expected ${ops.businessDate}`,
    },
    {
      label:  'Shift',
      open:   ops.shiftOpen,
      detail: ops.shiftOpen
        ? `${ops.shiftName} · ${ops.shiftStartTime}–${ops.shiftEndTime}`
        : ops.suggestedShift
          ? `Waiting for ${ops.suggestedShift.name} (${ops.suggestedShift.startTime}–${ops.suggestedShift.endTime})`
          : 'No shift scheduled',
    },
  ];

  const allGood = ops.businessDayOpen && ops.shiftOpen;

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-8 text-center">
      {allGood ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
        </div>
      )}

      <div>
        <p className="font-display text-lg font-extrabold text-foreground">
          {allGood ? 'Ready to open till!' : 'Waiting for manager…'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {allGood
            ? 'Business day and shift are open. You can now open your till.'
            : 'The manager needs to open the business day and shift before you can start.'}
        </p>
      </div>

      <div className="w-full space-y-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left ${
              item.open
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              item.open ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {item.label === 'Business Day'
                ? <CalendarDays className="h-4 w-4" />
                : <Clock3 className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-black uppercase tracking-wide ${
                item.open ? 'text-emerald-700' : 'text-amber-700'
              }`}>{item.label}</p>
              <p className={`truncate text-sm font-semibold ${
                item.open ? 'text-emerald-900' : 'text-amber-900'
              }`}>{item.detail}</p>
            </div>
            {item.open
              ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              : <div className="h-5 w-5 shrink-0 rounded-full border-2 border-amber-300" />}
          </div>
        ))}
      </div>

      {!allGood && (
        <p className="text-xs text-muted-foreground">
          Auto-refreshing every 15 seconds. Ask your manager to open the{' '}
          {!ops.businessDayOpen ? 'business day' : 'shift'} in the Manager Panel.
        </p>
      )}

      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Checking…' : 'Refresh now'}
      </button>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────
export function OpenTillDialog({ open, onOpenChange }: OpenTillDialogProps) {
  const { openTill }  = useTill();
  const { user }      = useAuth();
  const { toast }     = useToast();
  const { currencyConfig } = useAppConfig();

  const [denominations, setDenominations] = useState(() => blankDenominations(currencyConfig.currencyCode));
  const [cashierName, setCashierName]     = useState('');
  const [cashReviewed, setCashReviewed]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [openError, setOpenError]         = useState('');

  useEffect(() => {
    setDenominations(blankDenominations(currencyConfig.currencyCode));
  }, [currencyConfig.currencyCode]);
  const rememberedSelection               = getRememberedPosSelection();

  // Branch + terminal selection (admin email-login users without a terminalId)
  const needsTerminalSelect = !user?.terminalId && !rememberedSelection.terminal?.id;
  const [branches, setBranches]           = useState<BranchOption[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [terminals, setTerminals]         = useState<TerminalOption[]>([]);
  const [selectedBranch, setSelectedBranch]     = useState<BranchOption | null>(null);
  const [selectedTerminal, setSelectedTerminal] = useState<TerminalOption | null>(null);
  const [terminalLoading, setTerminalLoading]   = useState(false);
  const [currentShift, setCurrentShift]         = useState<CurrentShift | null>(null);

  // ── Ops status (day + shift open check) ──────────────────────────────────
  const [ops, setOps]               = useState<OpsStatus | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError]     = useState(false);

  const branchIdForOps = selectedBranch?.id ?? user?.branchId ?? rememberedSelection.branchId ?? '';

  const checkOps = useCallback(async () => {
    if (!branchIdForOps || !open) return;
    setOpsLoading(true);
    setOpsError(false);
    try {
      const status = await tillApi.opsStatus(branchIdForOps);
      setOps(status);
    } catch {
      setOpsError(true);
    } finally {
      setOpsLoading(false);
    }
  }, [branchIdForOps, open]);

  // Check on open + auto-refresh every 15 s while waiting
  useEffect(() => {
    if (!open) return;
    checkOps();
    const id = window.setInterval(checkOps, 15_000);
    return () => window.clearInterval(id);
  }, [open, checkOps]);

  // Fetch branches for admin users
  useEffect(() => {
    if (!open || !needsTerminalSelect) return;
    setBranchesLoading(true);
    authApi.branches()
      .then(setBranches)
      .catch(() => toast({ title: 'Could not load branches', variant: 'destructive' }))
      .finally(() => setBranchesLoading(false));
  }, [open, needsTerminalSelect]);

  // Fetch shift info
  useEffect(() => {
    if (!open) return;
    const bid = selectedBranch?.id ?? user?.branchId ?? rememberedSelection.branchId;
    if (!bid) return;
    tillConfigApi.currentShift(bid)
      .then(setCurrentShift)
      .catch(() => setCurrentShift(null));
  }, [open, selectedBranch?.id, user?.branchId]);

  const handleSelectBranch = async (branch: BranchOption) => {
    setSelectedBranch(branch);
    setSelectedTerminal(null);
    setTerminals([]);
    setTerminalLoading(true);
    try {
      const list = await authApi.terminals(branch.id);
      setTerminals(list);
    } catch {
      toast({ title: 'Could not load terminals', variant: 'destructive' });
    } finally {
      setTerminalLoading(false);
    }
  };

  const totalCash        = sumDenominations(denominations);
  const selectedTerminalId = normalizeId(selectedTerminal?.id ?? user?.terminalId ?? rememberedSelection.terminal?.id);
  const selectedBranchId   = normalizeId(selectedBranch?.id  ?? user?.branchId   ?? rememberedSelection.branchId);
  const selectedTerminalLabel =
    selectedTerminal?.code
      ? `${selectedTerminal.code} - ${selectedTerminal.name}`
      : selectedTerminal?.name
        ?? user?.terminalName
        ?? (rememberedSelection.terminal?.code
          ? `${rememberedSelection.terminal.code} - ${rememberedSelection.terminal.name}`
          : rememberedSelection.terminal?.name)
        ?? (selectedTerminalId ? `Till #${selectedTerminalId}` : '');

  const handleOpen = async () => {
    setOpenError('');
    if (!selectedTerminalId) {
      toast({ title: 'Select a terminal first', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      if (selectedTerminal) rememberPosSelection(selectedBranchId, selectedTerminal);
      const openedSession = await openTill(denominations, cashierName.trim() || user?.name || 'Cashier', selectedTerminalId);
      const openedStatus = String(openedSession.status ?? '').trim().toLowerCase();
      if (openedStatus !== 'open') {
        throw new Error(`Unexpected session status: ${openedStatus}`);
      }
      setDenominations(blankDenominations(currencyConfig.currencyCode));
      setCashierName('');
      setCashReviewed(false);
      setSelectedBranch(null);
      setSelectedTerminal(null);
      onOpenChange(false);
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Server error';
      setOpenError(message);
      toast({ title: 'Failed to open till', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDenominations(blankDenominations(currencyConfig.currencyCode));
    setCashierName('');
    setCashReviewed(false);
    setOpenError('');
    setSelectedBranch(null);
    setSelectedTerminal(null);
    onOpenChange(false);
  };

  // Decide what to render inside the dialog
  const opsReady  = ops?.businessDayOpen && ops?.shiftOpen;
  const showFloat = opsReady && (!needsTerminalSelect || selectedTerminalId);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[calc(100dvh-1.5rem)] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              opsReady
                ? 'bg-pos-success/15 border-pos-success/25'
                : 'bg-amber-50 border-amber-200'
            }`}>
              {opsReady
                ? <Unlock className="w-5 h-5 text-pos-success" />
                : <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>
            <div>
              <DialogTitle className="font-display font-extrabold text-[17px] text-foreground leading-tight">
                Open Till
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {opsReady
                  ? 'Count and enter the opening float before starting sales'
                  : 'Waiting for manager to prepare the store'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Body ── */}
        {opsLoading && !ops ? (
          // Initial loading
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Checking store status…</p>
          </div>
        ) : opsError ? (
          // Can't reach server
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <p className="font-semibold text-foreground">Could not check store status</p>
            <p className="text-sm text-muted-foreground">The store server is currently unreachable. Please check your network connection or try again.</p>
            <button onClick={checkOps} className="text-sm text-primary underline">Try again</button>
          </div>
        ) : !opsReady && ops !== null ? (
          // Waiting for manager — ops is confirmed non-null here
          <WaitingForManager
            ops={ops}
            branchId={branchIdForOps}
            onRefresh={checkOps}
            refreshing={opsLoading}
          />
        ) : !opsReady ? (
          // ops still null (first fetch in progress) — show spinner
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Checking store status…</p>
          </div>
        ) : (
          // ── Normal float entry ────────────────────────────────────────────
          <form
            onSubmit={(e) => { e.preventDefault(); void handleOpen(); }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto px-5 py-2.5 space-y-2.5">

              {/* Branch + Terminal selector (admin / email-login users only) */}
              {needsTerminalSelect && (
                <div className="space-y-3">
                  <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                    <Store className="w-3 h-3" />
                    Select Branch
                  </label>
                  {branchesLoading ? (
                    <div className="grid grid-cols-1 gap-2">
                      <Skeleton className="h-[58px] w-full rounded-xl" />
                      <Skeleton className="h-[58px] w-full rounded-xl" />
                      <Skeleton className="h-[58px] w-full rounded-xl" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {branches.map((b) => (
                        <button
                          key={b.id} type="button" onClick={() => handleSelectBranch(b)}
                          className={`flex items-center gap-3 w-full rounded-xl border px-4 py-2.5 text-left transition-all text-sm ${
                            selectedBranch?.id === b.id
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                          }`}
                        >
                          <Store className="h-4 w-4 shrink-0 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">{b.name}</p>
                            <p className="text-xs text-muted-foreground">{b.addrCity}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedBranch && (
                    <>
                      <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                        <Monitor className="w-3 h-3" />
                        Select Terminal
                      </label>
                      {terminalLoading ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-[54px] w-full rounded-xl" />
                          <Skeleton className="h-[54px] w-full rounded-xl" />
                          <Skeleton className="h-[54px] w-full rounded-xl" />
                          <Skeleton className="h-[54px] w-full rounded-xl" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {terminals.map((t) => (
                            <button
                              key={t.id} type="button" onClick={() => setSelectedTerminal(t)}
                              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all text-sm ${
                                selectedTerminal?.id === t.id
                                  ? 'border-primary bg-primary/10'
                                  : t.hasOpenSession
                                    ? 'border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20'
                                    : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              <Monitor className={`h-4 w-4 shrink-0 ${t.hasOpenSession ? 'text-amber-500' : 'text-primary'}`} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-foreground">{t.name}</span>
                                {t.code && <span className="block truncate text-[10px] text-muted-foreground">{t.code}</span>}
                                {t.hasOpenSession && (
                                  <span className="block text-[10px] font-black text-amber-600">
                                    In use{t.openedBy ? ` · ${t.openedBy}` : ''}
                                  </span>
                                )}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Current shift info */}
              {(!needsTerminalSelect || selectedTerminalId) && currentShift && (
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-primary/20 bg-secondary/70 px-3 py-2">
                  {!needsTerminalSelect && (
                    <div className="min-w-0">
                      <p className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Selected Till</p>
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <p className="truncate font-display text-sm font-extrabold text-foreground leading-tight">
                          {selectedTerminalLabel}
                        </p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Business Date</p>
                    <p className="mt-0.5 font-display text-sm font-extrabold text-foreground">{currentShift.businessDate ?? '-'}</p>
                  </div>
                  <div>
                    <p className="font-display text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Shift</p>
                    <p className="mt-0.5 truncate font-display text-sm font-extrabold text-foreground">
                      {currentShift.shift
                        ? `${currentShift.shift.name} (${currentShift.shift.startTime}-${currentShift.shift.endTime})`
                        : 'Unassigned'}
                    </p>
                  </div>
                </div>
              )}

              {/* Cashier name */}
              <div>
                <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 flex items-center gap-1.5">
                  Cashier / Shift
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed — Morning Shift"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              {/* Denomination entry */}
              <div>
                <label className="font-display font-bold text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Banknote className="w-3 h-3" />
                  Opening Float — Count Each Denomination
                </label>
                <DenominationTable
                  entries={denominations}
                  onChange={setDenominations}
                  showTotal
                  highlightFilled
                  layout="compact"
                />
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-pos-success/30 bg-pos-success/8 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-xs text-foreground">Opening Balance</span>
                  <span className="font-display font-black text-[18px] text-pos-success tabular-nums">
                    {formatCurrency(totalCash)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  This amount will be recorded as the opening float for this shift.
                </p>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={cashReviewed}
                  onChange={(e) => setCashReviewed(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span>
                  Cash reviewed and opening balance confirmed: <strong className="text-foreground">{formatCurrency(totalCash)}</strong>
                </span>
              </label>
            </div>

            {openError && (
              <div className="mx-5 mb-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
                {openError}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 px-5 py-3 border-t border-border shrink-0">
              <button
                type="button" onClick={handleClose}
                className="flex-1 rounded-xl border border-border bg-secondary py-2.5 font-display font-bold text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTerminalId || !cashReviewed || loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 font-display font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, hsl(142 70% 40%), hsl(142 70% 30%))' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? 'Opening…' : `Open Till — ${formatCurrency(totalCash)}`}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
