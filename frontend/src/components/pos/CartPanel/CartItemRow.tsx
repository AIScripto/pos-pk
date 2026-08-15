import { CartItem } from '@/types/pos';
import { formatCurrency, calculateLineTotal } from '@/utils/pos';
import { Minus, Plus, Trash2, Percent, DollarSign, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateDiscountPercent: (id: string, percent: number) => void;
  onUpdateLumpDiscount: (id: string, amount: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onUpdateDiscountPercent,
  onUpdateLumpDiscount,
  onRemove,
}: CartItemRowProps) {
  const { t, language } = useTranslation();
  const [showDiscounts, setShowDiscounts] = useState(false);


  const name = getLocalizedItemName(item.product || item.deal, language);
  const code = item.product?.code || item.deal?.code || '';
  const unitPrice = item.product?.price || item.deal?.price || 0;
  const isDeal = !!item.deal;

  const lineTotal = calculateLineTotal(unitPrice, item.quantity, item.discountPercent, item.lumpSumDiscount);
  const hasDiscount = item.discountPercent > 0 || item.lumpSumDiscount > 0;

  return (
    <div className="px-3 py-2.5 border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors group/row">
      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Deal indicator */}
        {isDeal && (
          <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
        )}

        {/* Name + code */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-bold text-sm text-foreground truncate leading-tight">
            {name}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {code} · {formatCurrency(unitPrice)}
          </p>
        </div>

        {/* Qty stepper */}
        <div className="flex items-center gap-0.5 shrink-0 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-2xs">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            aria-label={`Decrease quantity of ${name}`}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4 shrink-0" />
          </button>
          <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-slate-100 tabular-nums px-2 min-w-[28px] text-center select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label={`Increase quantity of ${name}`}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Line total */}
        <span className={cn(
          'min-w-[54px] text-right font-display font-black text-sm tabular-nums',
          hasDiscount ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'
        )}>
          {formatCurrency(lineTotal)}
        </span>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${name}`}
          className="w-7 h-7 flex items-center justify-center text-slate-400 dark:text-slate-500 opacity-60 group-hover/row:opacity-100 hover:text-rose-600 dark:hover:text-rose-400 transition-all shrink-0 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Discount toggle */}
      <button
        onClick={() => setShowDiscounts(!showDiscounts)}
        className="flex items-center gap-1 text-[10px] font-display font-semibold text-muted-foreground hover:text-primary mt-1.5 transition-colors uppercase tracking-wide cursor-pointer"
      >
        {showDiscounts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {hasDiscount
          ? <span className="text-accent">{t.cart.appliedDiscount} · {t.common.edit}</span>
          : t.common.addDiscount}
      </button>

      {/* Discount inputs */}
      {showDiscounts && (
        <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5 animate-slide-up">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0">
              <Percent className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground flex-1">{t.discount.typePercentage}</span>
            <input
              type="number" min="0" max="100"
              value={item.discountPercent || ''}
              onChange={(e) => onUpdateDiscountPercent(item.id, Number(e.target.value))}
              placeholder="0"
              className="w-20 px-2 py-1 text-sm bg-secondary border border-border rounded-lg text-right font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-secondary flex items-center justify-center shrink-0">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground flex-1">{t.discount.typeFixed}</span>
            <input
              type="number" min="0" step="0.01"
              value={item.lumpSumDiscount || ''}
              onChange={(e) => onUpdateLumpDiscount(item.id, Number(e.target.value))}
              placeholder="0.00"
              className="w-20 px-2 py-1 text-sm bg-secondary border border-border rounded-lg text-right font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}

