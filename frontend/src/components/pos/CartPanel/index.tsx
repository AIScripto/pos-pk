import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useTill } from '@/context/TillContext';
import { formatCurrency } from '@/utils/pos';
import { calculateTax } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { useTranslation } from '@/i18n';
import { CartItemRow } from './CartItemRow';
import { CustomerProfileCard } from './CustomerProfileCard';
import { BillSummary } from './BillSummary';
import { CartActionButtons } from './CartActionButtons';
import { ManagerApprovalDialog } from './ManagerApprovalDialog';
import {
  ShoppingBag, Trash2, AlertTriangle, PauseCircle,
  StickyNote, ChevronDown, ChevronUp, Check,
  Banknote, CreditCard, Truck, Utensils,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PAYMENT_METHOD_LABEL } from '@/utils/order';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CartPanelProps {
  onCheckout: () => void;
  onDirectCashCheckout?: () => void;
  isConfirming?: boolean;
  onHold?: (label: string) => void;
}

const ORDER_TYPES = [
  { key: 'dine-in'  as const, label: 'Dine-in',  Icon: Utensils },
  { key: 'takeaway' as const, label: 'Takeaway', Icon: ShoppingBag },
  { key: 'delivery' as const, label: 'Delivery', Icon: Truck },
];

// Delivery orders need the cashier to choose upfront: pay now or COD.
// Non-delivery orders have no payment selector here — the PaymentModal
// (shown after Confirm) is the single place to choose cash/card/wallet.
const DELIVERY_PAYMENT_METHODS = [
  { key: 'cash'             as const, label: 'Pay Now',  sublabel: 'Cash',  Icon: Banknote,    variant: 'green'  as const },
  { key: 'card'             as const, label: 'Pay Now',  sublabel: 'Card',  Icon: CreditCard,  variant: 'blue'   as const },
  { key: 'cash-on-delivery' as const, label: 'On Delivery', sublabel: 'Cash', Icon: Truck,    variant: 'purple' as const },
  { key: 'card-on-delivery' as const, label: 'On Delivery', sublabel: 'Card', Icon: CreditCard, variant: 'purple' as const },
];

const CASHIER_DISCOUNT_LIMIT_PERCENT = 10;

export function CartPanel({ onCheckout, onDirectCashCheckout, isConfirming, onHold }: CartPanelProps) {
  const { t } = useTranslation();
  const {
    state,
    updateQuantity,
    updateDiscountPercent,
    updateLumpDiscount,
    removeItem,
    clearCart,
    getCartTotals,
    holdOrder,
    orderType,
    setOrderType,
    paymentMethod,
    setPaymentMethod,
    setManagerApprovalToken,
  } = useCart();
  const { can, user } = useAuth();
  const { session } = useTill();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [itemToRemove,    setItemToRemove]    = useState<string | null>(null);
  const [orderNotes,      setOrderNotes]      = useState('');
  const [showNotes,       setShowNotes]       = useState(false);
  const [approvalOpen,    setApprovalOpen]    = useState(false);
  const [pendingApproval, setPendingApproval] = useState<{
    label: string;
    reason: string;
    apply: () => void;
  } | null>(null);

  const isCod = paymentMethod === 'cash-on-delivery' || paymentMethod === 'card-on-delivery';

  const { subtotal, totalDiscount, grandTotal: preTaxTotal } = getCartTotals();
  const { taxRate, taxLabel, taxAmount, grandTotal } = calculateTax(preTaxTotal, paymentMethod);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemove  = (id: string) => setItemToRemove(id);
  const confirmRemove = () => { if (itemToRemove) { removeItem(itemToRemove); setItemToRemove(null); } };
  const confirmClear  = () => { clearCart(); setShowClearDialog(false); };

  const requestManagerApproval = (label: string, reason: string, apply: () => void) => {
    setPendingApproval({ label, reason, apply });
    setApprovalOpen(true);
  };

  const handleDiscountPercent = (id: string, percent: number) => {
    if (percent <= CASHIER_DISCOUNT_LIMIT_PERCENT || can('discount.override')) {
      updateDiscountPercent(id, percent);
      return;
    }
    requestManagerApproval(
      'Discount override',
      `Requested discount ${percent}% is above cashier limit ${CASHIER_DISCOUNT_LIMIT_PERCENT}%.`,
      () => updateDiscountPercent(id, percent),
    );
  };

  const handleLumpDiscount = (id: string, amount: number) => {
    const item = state.items.find((entry) => entry.id === id);
    const unitPrice = item?.product?.price || item?.deal?.price || 0;
    const gross = unitPrice * (item?.quantity ?? 1);
    const percent = gross > 0 ? (amount / gross) * 100 : 0;

    if (percent <= CASHIER_DISCOUNT_LIMIT_PERCENT || can('discount.override')) {
      updateLumpDiscount(id, amount);
      return;
    }
    requestManagerApproval(
      'Fixed discount override',
      `Requested fixed discount ${formatCurrency(amount)} is ${percent.toFixed(1)}% of the line, above cashier limit ${CASHIER_DISCOUNT_LIMIT_PERCENT}%.`,
      () => updateLumpDiscount(id, amount),
    );
  };

  // Order-type tab (Dine-in / Takeaway / Delivery)
  const tabClass = (active: boolean) =>
    cn(
      'flex-1 rounded-xl py-2 font-display font-extrabold text-[11px] uppercase tracking-wider border transition-all duration-200',
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-sm shadow-blue-500/30 scale-[1.01]'
        : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:border-slate-400 hover:text-slate-950 shadow-sm'
    );

  const orderTypes = [
    { key: 'dine-in'  as const, label: t.pos.dineIn,   Icon: Utensils },
    { key: 'takeaway' as const, label: t.pos.takeaway, Icon: ShoppingBag },
    { key: 'delivery' as const, label: t.pos.delivery, Icon: Truck },
  ];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 overflow-hidden shadow-xl shadow-slate-900/5 border-l border-slate-200/80 dark:border-slate-800">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 shrink-0 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <h2 className="font-display font-extrabold text-[17px] tracking-wide text-slate-900 dark:text-slate-100 leading-none">
            {t.common.currentOrder}
          </h2>
          {itemCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 font-display font-extrabold text-[10px] text-white shadow-sm">
              {itemCount}
            </span>
          )}
        </div>
        {state.items.length > 0 && (
          <button
            onClick={() => setShowClearDialog(true)}
            aria-label="Clear all items from cart"
            className="flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 font-display font-bold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all shadow-sm cursor-pointer"
          >
            <Trash2 className="w-3 h-3 inline" />
            {t.common.clear}
          </button>
        )}
      </div>

      {/* ── Order type ── */}
      <div className="flex gap-1.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 px-3 py-2 shrink-0">
        {orderTypes.map((typeOption) => {
          const Icon = typeOption.Icon;
          return (
            <button
              key={typeOption.key}
              onClick={() => {
                setOrderType(typeOption.key);
                if (typeOption.key !== 'delivery') setPaymentMethod('cash');
              }}
              className={cn(
                tabClass(orderType === typeOption.key),
                'flex items-center justify-center gap-1.5 cursor-pointer'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{typeOption.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Payment method — delivery only ── */}
      {orderType === 'delivery' && (
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 px-3 py-2.5 shrink-0">
          <p className="font-display font-bold text-[9px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-2">
            How will the customer pay?
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {DELIVERY_PAYMENT_METHODS.map((m) => {
              const isActive = paymentMethod === m.key;
              const colorMap = {
                green:  { active: 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/30', inactive: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-700' },
                blue:   { active: 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/30',          inactive: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:bg-blue-50/40 hover:text-blue-700' },
                purple: { active: 'bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-600/30',    inactive: 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:bg-purple-50/40 hover:text-purple-700' },
              };
              const colors = colorMap[m.variant];
              return (
                <button
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-center transition-all',
                    isActive ? colors.active : colors.inactive
                  )}
                >
                  {isActive && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/25">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <m.Icon className="h-4 w-4" />
                  <span className="font-display font-black text-[9px] uppercase tracking-wider leading-none">{m.label}</span>
                  <span className="font-display font-semibold text-[8px] uppercase tracking-wide opacity-80">{m.sublabel}</span>
                </button>
              );
            })}
          </div>
          {isCod && (
            <p className="mt-2 flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/8 px-2 py-1.5 font-display font-semibold text-[9px] text-purple-500 uppercase tracking-wide">
              <Truck className="h-3 w-3 shrink-0" />
              Payment collected at door — order goes to kitchen now
            </p>
          )}
        </div>
      )}

      {/* ── Cart Items (Maximized View Area) ── */}
      <div className="flex-1 overflow-y-auto pos-scrollbar bg-white dark:bg-slate-900">
        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 shadow-inner">
              <ShoppingBag className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-body font-bold text-base text-slate-800 dark:text-slate-200">{t.pos.noItems}</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{t.pos.tapToAdd}</p>
          </div>
        ) : (
          <div>
            {state.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onUpdateDiscountPercent={handleDiscountPercent}
                onUpdateLumpDiscount={handleLumpDiscount}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Order Notes ── */}
      {state.items.length > 0 && (
        <div className="border-t border-border/60 px-3 py-2 shrink-0">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 font-display font-semibold text-[10px] uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors w-full"
          >
            <StickyNote className="w-3 h-3" />
            {orderNotes ? 'Edit notes' : 'Add order notes'}
            {showNotes ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
            {orderNotes && !showNotes && (
              <span className="ml-auto rounded-full bg-primary/15 border border-primary/25 px-1.5 text-[9px] text-primary">saved</span>
            )}
          </button>
          {showNotes && (
            <textarea
              rows={2}
              placeholder="Special instructions, allergies, preferences…"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="pos-notes-input mt-2 animate-slide-up"
            />
          )}
        </div>
      )}

      {/* ── Totals + Actions ── */}
      {state.items.length > 0 && (
        <div className="border-t border-border bg-card shrink-0">
          {/* Bill Summary Component */}
          <BillSummary
            subtotal={subtotal}
            totalDiscount={totalDiscount}
            taxAmount={taxAmount}
            taxRate={taxRate}
            taxLabel={taxLabel}
            grandTotal={grandTotal}
          />

          {/* Action Buttons Component */}
          <CartActionButtons
            onCheckout={onCheckout}
            onDirectCashCheckout={onDirectCashCheckout}
            isConfirming={isConfirming}
            onHold={() => { const held = holdOrder(); if (held) onHold?.(held.label); }}
          />
        </div>
      )}

      {/* ── Clear dialog ── */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Clear Cart
            </AlertDialogTitle>
            <AlertDialogDescription>
              Remove all items from the current order? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Remove item dialog ── */}
      <AlertDialog open={!!itemToRemove} onOpenChange={() => setItemToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>Remove this item from the order?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ManagerApprovalDialog
        open={approvalOpen}
        branchId={session?.branchId || user?.branchId}
        actionLabel={pendingApproval?.label ?? 'Manager approval'}
        reason={pendingApproval?.reason ?? ''}
        onOpenChange={setApprovalOpen}
        onApproved={(token) => {
          setManagerApprovalToken(token);
          pendingApproval?.apply();
          setPendingApproval(null);
        }}
      />
    </div>
  );
}
