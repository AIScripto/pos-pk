import { useState, useEffect, useCallback } from 'react';
import { useTill } from '@/context/TillContext';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api/auth.api';
import { tillApi, OpsStatus } from '@/lib/api/till.api';
import { tillConfigApi, CurrentShift } from '@/lib/api/till-config.api';
import { blankDenominations, sumDenominations, DenominationEntry } from '@/types/till';
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
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-subtle border border-success-border">
          <CheckCircle2 className="h-8 w-8 text-success-text" />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning-subtle border border-warning-border">
          <AlertTriangle className="h-8 w-8 text-warning" />
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
                ? 'border-success-border bg-success-subtle'
                : 'border-warning-border bg-warning-subtle'
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              item.open ? 'bg-success-subtle text-success-text' : 'bg-warning-subtle text-warning-text'
            }`}>
              {item.label === 'Business Day'
                ? <CalendarDays className="h-4 w-4" />
                : <Clock3 className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-black uppercase tracking-wide ${
                item.open ? 'text-success-text' : 'text-warning-text'
              }`}>{item.label}</p>
              <p className={`truncate text-sm font-semibold ${
                item.open ? 'text-success-text' : 'text-warning-text'
              }`}>{item.detail}</p>
            </div>
            {item.open
              ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              : <div className="h-5 w-5 shrink-0 rounded-full border-2 border-warning-border" />}
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
  const [floatAmount, setFloatAmount]     = useState<number>(0);
  const [cashierName, setCashierName]     = useState('');
  const [cashReviewed, setCashReviewed]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [openError, setOpenError]         = useState('');

  useEffect(() => {
    setDenominations(blankDenominations(currencyConfig.currencyCode));
    setFloatAmount(0);
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
  }, [open, needsTerminalSelect, toast]);

  // Fetch shift info
  useEffect(() => {
    if (!open) return;
    const bid = selectedBranch?.id ?? user?.branchId ?? rememberedSelection.branchId;
    if (!bid) return;
    tillConfigApi.currentShift(bid)
      .then(setCurrentShift)
      .catch(() => setCurrentShift(null));
  }, [open, selectedBranch?.id, user?.branchId, rememberedSelection.branchId]);

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

  const totalCash        = floatAmount || sumDenominations(denominations);
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
      setFloatAmount(0);
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
    setFloatAmount(0);
    setCashierName('');
    setCashReviewed(false);
    setOpenError('');
    setSelectedBranch(null);
    setSelectedTerminal(null);
    onOpenChange(false);
  };

  // Decide what to render inside the dialog — auto-provisioning enabled so float entry is always ready
  const opsReady  = true; // Backend auto-opens BusinessDay & Shift if needed
  const showFloat = true;

  const setDirectFloat = (amount: number) => {
    const validAmount = isNaN(amount) ? 0 : Math.max(0, amount);
    setFloatAmount(validAmount);
    let remaining = validAmount;
    const updated = blankDenominations(currencyConfig.currencyCode).map((d) => {
      if (remaining <= 0) return { ...d, count: 0, total: 0 };
      const count = Math.floor(remaining / d.value);
      remaining = Math.round((remaining - count * d.value) * 100) / 100;
      return { ...d, count, total: d.value * count };
    });
    setDenominations(updated);
  };

  const handleDenominationChange = (updated: DenominationEntry[]) => {
    setDenominations(updated);
    setFloatAmount(sumDenominations(updated));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[calc(100dvh-1.5rem)] flex flex-col gap-0 p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              opsReady
                ? 'bg-pos-success/15 border-pos-success/25'
                : 'bg-warning-subtle border-warning-border'
            }`}>
              {opsReady
                ? <Unlock className="w-5 h-5 text-pos-success" />
                : <AlertTriangle className="w-5 h-5 text-warning" />}
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
            <p className="text-sm font-semibold text-muted-foreground">Preparing register…</p>
          </div>
        ) : (
          // ── Normal float entry ────────────────────────────────────────────
          <form
            onSubmit={(e) => { e.preventDefault(); void handleOpen(); }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

              {/* Branch + Terminal selector (admin / email-login users only) */}
              {needsTerminalSelect && (
                <div className="space-y-3">
                  <label className="font-display font-bold text-2xs uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
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
                      <label className="font-display font-bold text-2xs uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
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
                                    ? 'border-warning-border bg-warning/60 dark:bg-warning/20'
                                    : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
                              }`}
                            >
                              <Monitor className={`h-4 w-4 shrink-0 ${t.hasOpenSession ? 'text-warning' : 'text-primary'}`} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold text-foreground">{t.name}</span>
                                {t.code && <span className="block truncate text-2xs text-muted-foreground">{t.code}</span>}
                                {t.hasOpenSession && (
                                  <span className="block text-2xs font-black text-warning-text">
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

              {/* Quick Starting Float Selection (Layman Presets) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-success" />
                    <span>Starting Cash in Drawer (Float)</span>
                  </label>
                  <span className="text-[11px] font-semibold text-success bg-success/60 border border-success/20 px-2 py-0.5 rounded">
                    PKR Float
                  </span>
                </div>

                {/* Quick Presets Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Rs 0 (No Float)', val: 0 },
                    { label: 'Rs 1,000', val: 1000 },
                    { label: 'Rs 2,000', val: 2000 },
                    { label: 'Rs 5,000', val: 5000 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setDirectFloat(preset.val)}
                      className={`h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        floatAmount === preset.val
                          ? 'border-success bg-success/80 text-success ring-2 ring-success/30'
                          : 'border-border bg-muted/80 text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Direct Float Input Field */}
                <div className="relative pt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/70">
                    Rs
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={floatAmount === 0 ? '' : floatAmount}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setDirectFloat(val);
                    }}
                    className="w-full h-12 pl-12 pr-4 bg-background border-2 border-border rounded-xl focus:outline-none focus:border-success focus:ring-2 focus:ring-success/20 text-right font-mono text-xl font-bold text-foreground transition-all tabular-nums"
                  />
                </div>
              </div>

              {/* Optional Denomination Breakdown Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setCashReviewed(!cashReviewed)}
                  className="text-xs font-medium text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{cashReviewed ? '− Hide physical note breakdown' : '+ Count physical note denominations (Optional)'}</span>
                </button>

                {cashReviewed && (
                  <div className="mt-2.5 p-3 rounded-xl border border-border bg-muted/60">
                    <DenominationTable
                      entries={denominations}
                      onChange={handleDenominationChange}
                      showTotal
                      highlightFilled
                      layout="compact"
                    />
                  </div>
                )}
              </div>

              {/* Summary Banner */}
              <div className="rounded-xl border border-success/40 bg-success/30 p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-success">Opening Register Balance</span>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">Recorded as starting float for this trading session</p>
                </div>
                <span className="font-mono font-black text-2xl text-success tabular-nums">
                  {formatCurrency(totalCash)}
                </span>
              </div>
            </div>

            {openError && (
              <div className="mx-5 mb-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
                {openError}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2.5 px-5 py-3 border-t border-border shrink-0 bg-muted/60">
              <button
                type="button" onClick={handleClose}
                className="h-12 flex-1 rounded-xl border border-border bg-muted py-2.5 font-bold text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedTerminalId || loading}
                className="h-12 flex-[2] flex items-center justify-center gap-2 rounded-xl py-2.5 font-black text-sm uppercase tracking-wider text-foreground transition-all bg-success hover:bg-success active:scale-[0.99] shadow-lg shadow-success/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? 'Opening Register…' : `Start Selling — ${formatCurrency(totalCash)} (↵)`}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
