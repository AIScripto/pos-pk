import { useState } from 'react';
import { useTill } from '@/context/TillContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/utils/pos';
import {
  DenominationEntry,
  blankDenominations,
  sumDenominations,
} from '@/types/till';
import { X, Lock, CheckCircle2, AlertCircle, Calculator, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCurrencyConfig } from '@/config/currency';

interface TillCloseoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TillCloseoutModal({ isOpen, onClose }: TillCloseoutModalProps) {
  const { session, closeTill, getTillSummary } = useTill();
  const { state } = useCart();

  const [denominations, setDenominations] = useState<DenominationEntry[]>(() =>
    blankDenominations('PKR')
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !session) return null;

  const summary = getTillSummary(state.invoices, denominations);
  const actualCash = sumDenominations(denominations);
  const variance = actualCash - summary.expectedCash;

  const handleCountChange = (value: number, countStr: string) => {
    const count = Math.max(0, parseInt(countStr, 10) || 0);
    setDenominations((prev) =>
      prev.map((item) =>
        item.value === value
          ? { ...item, count, total: item.value * count }
          : item
      )
    );
  };

  const handleCloseTill = async () => {
    setSubmitting(true);
    setError('');
    try {
      await closeTill(denominations, notes);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSubmitting(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to close till session');
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-foreground/70 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex flex-col max-h-[90vh] w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base text-foreground">
                  End-of-Day Till Shift Reconciliation
                </h2>
                <p className="text-xs text-muted-foreground">
                  Count cash drawer denominations & verify expected sales variance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-muted-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 pos-scrollbar space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger-subtle border border-danger-border p-3 text-xs text-danger-text">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Summary Cards Row */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-muted/80 p-3">
                <p className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/70">Opening Cash</p>
                <p className="font-black text-base text-foreground mt-0.5">
                  {formatCurrency(session.openingCash)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/80 p-3">
                <p className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/70">Expected Cash</p>
                <p className="font-black text-base text-primary mt-0.5">
                  {formatCurrency(summary.expectedCash)}
                </p>
              </div>
              <div className={cn(
                'rounded-xl border p-3',
                variance === 0
                  ? 'border-success-border bg-success/50 dark:bg-success/30 text-success-text dark:text-success'
                  : variance > 0
                  ? 'border-info-border bg-primary/50 dark:bg-primary/30 text-primary dark:text-primary'
                  : 'border-danger-border bg-danger/50 dark:bg-danger/30 text-danger-text dark:text-danger'
              )}>
                <p className="text-2xs font-extrabold uppercase tracking-wider opacity-75">Cash Variance</p>
                <p className="font-black text-base mt-0.5">
                  {variance > 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
                </p>
              </div>
            </div>

            {/* Denomination Counter Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-primary" />
                  Physical Cash Count Sheet (PKR)
                </h3>
                <span className="font-black text-xs text-foreground">
                  Total Counted: <span className="text-success-text">{formatCurrency(actualCash)}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pos-scrollbar p-1 border border-border rounded-xl bg-muted/50">
                {denominations.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-foreground min-w-[50px]">
                        {getCurrencyConfig().currencySymbol} {item.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.count || ''}
                        onChange={(e) => handleCountChange(item.value, e.target.value)}
                        className="w-16 rounded-md border border-border bg-muted/40 px-2 py-1 text-center font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                      />
                      <span className="font-extrabold text-muted-foreground min-w-[60px] text-right">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Notes */}
            <div>
              <label className="font-display font-extrabold text-xs uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Shift Notes / Variance Explanation
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter shift notes or explain cash over/short variance..."
                rows={2}
                className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3.5 bg-muted/40">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary transition-all shadow-xs"
            >
              Cancel
            </button>

            <button
              onClick={handleCloseTill}
              disabled={submitting || success}
              className="flex items-center gap-2 rounded-xl bg-danger hover:bg-danger/90 px-5 py-2 text-xs font-black text-foreground shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Session Closed!</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>{submitting ? 'Closing Till...' : 'Confirm & Close Shift'}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
