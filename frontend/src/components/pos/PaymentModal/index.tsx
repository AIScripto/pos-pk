import { useState, useEffect } from 'react';
import { PaymentAllocation } from '@/types/pos';
import { formatCurrency } from '@/utils/pos';
import { playPaymentChime } from '@/utils/audio';
import { X, CreditCard, Banknote, Check, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_URL } from '@/config/api';
import { getCurrencyConfig } from '@/config/currency';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  : null;

function StripeCheckoutForm({
  onSuccess, onError, onProcessing, onChange,
}: {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onProcessing: (v: boolean) => void;
  onChange: (complete: boolean) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    onProcessing(true);
    onError('');
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) { onError(error.message ?? 'Payment failed'); onProcessing(false); }
    else if (paymentIntent?.status === 'succeeded') onSuccess();
    else onProcessing(false);
  };

  return (
    <form id="stripe-payment-form" onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} onChange={(e) => onChange(e.complete)} />
    </form>
  );
}

interface PaymentModalProps {
  grandTotal: number;
  onConfirm:  (allocations: PaymentAllocation[]) => void;
  onCancel:   () => void;
}

const METHODS = [
  { key: 'cash'   as const, label: 'Cash',   Icon: Banknote,    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/25' },
  { key: 'card'   as const, label: 'Card',   Icon: CreditCard,  activeClass: 'bg-blue-600 text-white border-blue-600 shadow-blue-600/25' },
] as const;

export function PaymentModal({ grandTotal, onConfirm, onCancel }: PaymentModalProps) {
  const [activeMethod, setActiveMethod] = useState<PaymentAllocation['method']>('cash');

  // Round to nearest rupee to avoid floating-point display issues
  const roundedTotal = Math.round(grandTotal);

  // Cash
  const [cashTendered, setCashTendered]  = useState<string>(String(roundedTotal));
  const cashNum   = parseFloat(cashTendered) || 0;
  const change    = Math.max(0, cashNum - roundedTotal);
  const cashValid = cashNum >= roundedTotal - 0.005;

  // Card (Stripe)
  const [clientSecret,    setClientSecret]    = useState('');
  const [creatingIntent,  setCreatingIntent]  = useState(false);
  const [cardValid,       setCardValid]       = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const [stripeError,     setStripeError]     = useState('');

  // Create Stripe intent when card tab is opened
  useEffect(() => {
    if (activeMethod !== 'card' || clientSecret || creatingIntent) return;
    if (!stripePromise) { setStripeError('Card payments are not configured.'); return; }
    setCreatingIntent(true);
    fetch(`${API_URL}/payment/create-intent`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Math.round(grandTotal * 100) }),
    })
      .then((r) => r.json())
      .then((d) => {
        const secret = d.clientSecret ?? d.data?.clientSecret;
        if (secret) setClientSecret(secret);
        else setStripeError('Payment setup failed. Please contact your manager or check your payment gateway configurations.');
        setCreatingIntent(false);
      })
      .catch(() => {
        setStripeError('Payment server is temporarily offline. Please complete this checkout using cash payment.');
        setCreatingIntent(false);
      });
  }, [activeMethod, grandTotal, clientSecret, creatingIntent]);

  const isValid =
    (activeMethod === 'cash'   && cashValid)   ||
    (activeMethod === 'card'   && cardValid);

  const confirm = () => {
    if (!isValid || activeMethod === 'card') return;
    playPaymentChime();
    onConfirm([{ method: activeMethod, amount: roundedTotal }]);
  };

  const onStripeSuccess = () => {
    playPaymentChime();
    onConfirm([{ method: 'card', amount: roundedTotal }]);
    setStripeProcessing(false);
  };

  // Keyboard shortcut listener (Enter to confirm, Escape to cancel, 1 for Cash, 2 for Card)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter' && isValid && activeMethod !== 'card' && !stripeProcessing) {
        e.preventDefault();
        confirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isValid, activeMethod, stripeProcessing, onCancel]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Tender Checkout</p>
            <h2 className="text-lg font-black text-white leading-tight">Collect Payment</h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel checkout (Esc)"
            title="Cancel (Esc)"
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Amount Due Display ── */}
        <div className="bg-slate-950 py-5 text-center border-b border-slate-800/80">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Payable</p>
          <p className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight font-mono tabular-nums">
            {formatCurrency(roundedTotal)}
          </p>
        </div>

        {/* ── Method tabs ── */}
        <div className="flex gap-2 p-3 border-b border-slate-800 bg-slate-900/80">
          {METHODS.map(({ key, label, Icon, activeClass }) => {
            const isActive = activeMethod === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMethod(key)}
                className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? `${activeClass} shadow-md`
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {isActive && <Check className="w-3.5 h-3.5 opacity-90 ml-0.5" />}
              </button>
            );
          })}
        </div>

        {/* ── Payment area ── */}
        <div className="p-4 sm:p-5 min-h-[170px] space-y-4">

          {/* Cash Payment Mode */}
          {/* Cash Payment Mode */}
          {activeMethod === 'cash' && (
            <div className="space-y-3.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="cash-input" className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Cash Tendered
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCashTendered(String(roundedTotal))}
                      className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                    >
                      Exact Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashTendered('0')}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Direct PKR Banknote Preset Row */}
                <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                  {[
                    { label: 'Exact', val: roundedTotal },
                    { label: 'Rs 100', val: 100 },
                    { label: 'Rs 500', val: 500 },
                    { label: 'Rs 1k', val: 1000 },
                    { label: 'Rs 5k', val: 5000 },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      onClick={() => setCashTendered(String(btn.val))}
                      className="h-10 rounded-xl border border-slate-700 bg-slate-800/90 hover:bg-emerald-950/40 hover:border-emerald-500/60 active:scale-95 text-xs font-bold text-slate-200 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Fast Increment Row (+1 Rupee, +5, +10, +50, +100, +500) */}
                <div className="grid grid-cols-6 gap-1 pt-0.5">
                  {[
                    { label: '+1', add: 1 },
                    { label: '+5', add: 5 },
                    { label: '+10', add: 10 },
                    { label: '+50', add: 50 },
                    { label: '+100', add: 100 },
                    { label: '+500', add: 500 },
                  ].map((inc) => (
                    <button
                      key={inc.label}
                      type="button"
                      onClick={() => {
                        const current = parseFloat(cashTendered) || 0;
                        setCashTendered(String(current + inc.add));
                      }}
                      className="h-8 rounded-lg border border-slate-700/80 bg-slate-850 hover:bg-slate-750 active:scale-95 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center justify-center cursor-pointer font-mono"
                    >
                      {inc.label}
                    </button>
                  ))}
                </div>

                {/* Input Field */}
                <div className="relative pt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {getCurrencyConfig().currencySymbol}
                  </span>
                  <input
                    id="cash-input"
                    type="number"
                    min="0"
                    step="1"
                    autoFocus
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-950 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-right font-mono text-xl font-bold text-white transition-all tabular-nums"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Change Return Banner */}
              {change > 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-emerald-500/80 bg-emerald-950/40 p-3.5 text-center shadow-lg shadow-emerald-950/50">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Change Due to Customer</span>
                  <span className="font-mono text-3xl font-black text-emerald-300 tabular-nums">{formatCurrency(change)}</span>
                </div>
              )}

              {cashTendered && !cashValid && (
                <p className="text-center text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-500/20 py-2 rounded-lg">
                  Tendered amount is less than total payable
                </p>
              )}
            </div>
          )}

          {/* Card (Stripe / POS Terminal) */}
          {activeMethod === 'card' && (
            <div className="space-y-3">
              {!clientSecret ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  <p className="text-xs font-semibold">Initialising secure card terminal…</p>
                </div>
              ) : (
                <Elements stripe={stripePromise!} options={{ clientSecret }}>
                  <StripeCheckoutForm
                    onSuccess={onStripeSuccess}
                    onError={setStripeError}
                    onProcessing={setStripeProcessing}
                    onChange={setCardValid}
                  />
                </Elements>
              )}
              {stripeError && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-xs font-semibold text-rose-300">
                  {stripeError}
                </p>
              )}
            </div>
          )}

        </div>

        {/* ── Confirm / Submit Button (h-14 / 56px touch target) ── */}
        <div className="p-4 sm:p-5 pt-0 bg-slate-900">
          <button
            onClick={activeMethod === 'card' ? undefined : confirm}
            type={activeMethod === 'card' ? 'submit' : 'button'}
            form={activeMethod === 'card' ? 'stripe-payment-form' : undefined}
            disabled={!isValid || stripeProcessing}
            className={`w-full h-14 rounded-xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isValid && !stripeProcessing
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/60 active:scale-[0.99]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
            {stripeProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Authorizing Payment…
              </span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirm & Print Receipt (↵)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
