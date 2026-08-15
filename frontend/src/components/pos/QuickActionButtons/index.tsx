import React from 'react';
import { Plus, Tag, PauseCircle } from 'lucide-react';

interface QuickActionButtonsProps {
  cartItemCount: number;
  onNewOrder: () => void;
  onSearch?: () => void;
  onDiscount: () => void;
  onHold: () => void;
  onClearCart?: () => void;
  onMoreActions?: () => void;
}

export function QuickActionButtons({
  cartItemCount,
  onNewOrder,
  onDiscount,
  onHold,
}: QuickActionButtonsProps) {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-2.5 py-2 shrink-0 no-print">
      <div className="grid grid-cols-3 gap-1.5">
        {/* 1. New Order */}
        <button
          onClick={onNewOrder}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all cursor-pointer"
          title="Start a new order (Clear cart)"
        >
          <Plus className="w-3.5 h-3.5 shrink-0 text-white stroke-[2.5]" />
          <span>New Order</span>
        </button>

        {/* 2. Discount */}
        <button
          onClick={onDiscount}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all cursor-pointer"
          title="Apply discount to order (F2)"
        >
          <Tag className="w-3.5 h-3.5 shrink-0 text-slate-950 stroke-[2.5]" />
          <span>Discount</span>
          <span className="font-mono text-[9px] bg-amber-600/30 text-slate-950 px-1 rounded">F2</span>
        </button>

        {/* 3. Park / Hold */}
        <button
          onClick={onHold}
          disabled={cartItemCount === 0}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer"
          title={cartItemCount === 0 ? 'Add items to cart first' : 'Park this order (F3)'}
        >
          <PauseCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400 stroke-[2.5]" />
          <span>Park</span>
          <span className="font-mono text-[9px] bg-amber-200/80 dark:bg-amber-800/60 px-1 rounded">F3</span>
        </button>
      </div>
    </div>
  );
}
