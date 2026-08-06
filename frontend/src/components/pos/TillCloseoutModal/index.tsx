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
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative flex flex-col max-h-[90vh] w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-base text-slate-900 dark:text-slate-100">
                  End-of-Day Till Shift Reconciliation
                </h2>
                <p className="text-xs text-slate-500">
                  Count cash drawer denominations & verify expected sales variance
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 pos-scrollbar space-y-5">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Summary Cards Row */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Opening Cash</p>
                <p className="font-black text-base text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatCurrency(session.openingCash)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Expected Cash</p>
                <p className="font-black text-base text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatCurrency(summary.expectedCash)}
                </p>
              </div>
              <div className={cn(
                'rounded-xl border p-3',
                variance === 0
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300'
                  : variance > 0
                  ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300'
                  : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300'
              )}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-75">Cash Variance</p>
                <p className="font-black text-base mt-0.5">
                  {variance > 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
                </p>
              </div>
            </div>

            {/* Denomination Counter Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calculator className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  Physical Cash Count Sheet (PKR)
                </h3>
                <span className="font-black text-xs text-slate-900 dark:text-slate-100">
                  Total Counted: <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(actualCash)}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pos-scrollbar p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                {denominations.map((item) => (
                  <div
                    key={item.value}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-800 dark:text-slate-200 min-w-[50px]">
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
                        className="w-16 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-center font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                      />
                      <span className="font-extrabold text-slate-500 min-w-[60px] text-right">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Notes */}
            <div>
              <label className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Shift Notes / Variance Explanation
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter shift notes or explain cash over/short variance..."
                rows={2}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50 dark:bg-slate-950">
            <button
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs"
            >
              Cancel
            </button>

            <button
              onClick={handleCloseTill}
              disabled={submitting || success}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 px-5 py-2 text-xs font-black text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
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
