import { useState, useEffect } from 'react';
import { PaymentAllocation } from '@/types/pos';
import { formatCurrency } from '@/utils/pos';
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
    onConfirm([{ method: activeMethod, amount: roundedTotal }]);
  };

  const onStripeSuccess = () => {
    onConfirm([{ method: 'card', amount: roundedTotal }]);
    setStripeProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Collect Payment</p>
            <h2 className="text-xl font-black text-card-foreground leading-tight">Payment</h2>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Amount ── */}
        <div className="bg-slate-950 dark:bg-slate-900 py-5 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Amount Due</p>
          <p className="text-5xl font-black text-white tracking-tight">{formatCurrency(roundedTotal)}</p>
        </div>

        {/* ── Method tabs ── */}
        <div className="flex gap-2 p-3 border-b border-border bg-muted/20">
          {METHODS.map(({ key, label, Icon, activeClass }) => {
            const isActive = activeMethod === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMethod(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-wider transition-all shadow-sm ${
                  isActive
                    ? `${activeClass} shadow-md`
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
                {isActive && <Check className="w-3 h-3 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* ── Payment area ── */}
        <div className="p-4 min-h-[160px]">

          {/* Cash */}
          {activeMethod === 'cash' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tendered Amount</label>
                  <button
                    onClick={() => setCashTendered(String(roundedTotal))}
                    className="rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-primary hover:bg-primary/20 transition-colors"
                  >
                    Exact
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">{getCurrencyConfig().currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    autoFocus
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 bg-secondary border-2 border-border rounded-xl focus:outline-none focus:border-primary text-right font-mono text-xl font-bold transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              {change > 0 && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                  <span className="text-sm font-bold text-emerald-600">Change Due</span>
                  <span className="font-mono text-lg font-black text-emerald-600">{formatCurrency(change)}</span>
                </div>
              )}

              {cashTendered && !cashValid && (
                <p className="text-center text-xs font-semibold text-destructive">
                  Amount entered is less than the total due
                </p>
              )}
            </div>
          )}

          {/* Card */}
          {activeMethod === 'card' && (
            <div className="space-y-3">
              {!clientSecret ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Initialising secure connection…</p>
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
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                  {stripeError}
                </p>
              )}
            </div>
          )}

        </div>

        {/* ── Confirm button ── */}
        <div className="px-4 pb-4">
          <button
            onClick={activeMethod === 'card' ? undefined : confirm}
            type={activeMethod === 'card' ? 'submit' : 'button'}
            form={activeMethod === 'card' ? 'stripe-payment-form' : undefined}
            disabled={!isValid || stripeProcessing}
            className={`w-full py-4 rounded-xl font-black text-base tracking-wide transition-all ${
              isValid && !stripeProcessing
                ? 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/30 active:scale-[0.98]'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {stripeProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing…
              </span>
            ) : (
              `Confirm Payment — ${formatCurrency(roundedTotal)}`
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
