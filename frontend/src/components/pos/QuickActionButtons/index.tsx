import React from 'react';
import { Search, Plus, MoreVertical, Lock, Tag, Trash2 } from 'lucide-react';

interface QuickActionButtonsProps {
  cartItemCount: number;
  onNewOrder: () => void;
  onSearch: () => void;
  onDiscount: () => void;
  onHold: () => void;
  onClearCart: () => void;
  onMoreActions: () => void;
}

export function QuickActionButtons({
  cartItemCount,
  onNewOrder,
  onSearch,
  onDiscount,
  onHold,
  onClearCart,
  onMoreActions,
}: QuickActionButtonsProps) {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 px-3 py-3 shrink-0 no-print">
      <div className="space-y-2.5">
        {/* Primary Actions Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onNewOrder}
            className="flex items-center justify-center gap-2 h-11 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 active:scale-[0.97] transition-all"
            title="Start a new order (Clear cart)"
          >
            <Plus className="w-4 h-4 shrink-0 text-white stroke-[2.5]" />
            <span>New Order</span>
          </button>

          <button
            onClick={onSearch}
            className="flex items-center justify-center gap-2 h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all"
            title="Search products (F1)"
          >
            <Search className="w-4 h-4 shrink-0 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
            <span>Search</span>
            <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded text-slate-700 dark:text-slate-300">F1</span>
          </button>

          <button
            onClick={onDiscount}
            className="flex items-center justify-center gap-2 h-11 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-[0.97] transition-all"
            title="Apply discount to order (F2)"
          >
            <Tag className="w-4 h-4 shrink-0 text-slate-950 stroke-[2.5]" />
            <span>Discount</span>
            <span className="font-mono text-[9px] bg-amber-600/30 text-slate-950 px-1 py-0.2 rounded">F2</span>
          </button>

          <button
            onClick={onHold}
            disabled={cartItemCount === 0}
            className="flex items-center justify-center gap-2 h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
            title={cartItemCount === 0 ? 'Add items to cart first' : 'Hold this order (F3)'}
          >
            <Lock className="w-4 h-4 shrink-0 text-slate-700 dark:text-slate-300 stroke-[2.5]" />
            <span>Hold</span>
            <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded text-slate-700 dark:text-slate-300">F3</span>
          </button>
        </div>

        {/* Secondary Row: Clear Cart + More */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClearCart}
            disabled={cartItemCount === 0}
            className="flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
            title={cartItemCount === 0 ? 'Cart is empty' : 'Clear all items from cart'}
          >
            <Trash2 className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 stroke-[2.5]" />
            <span>Clear Cart</span>
          </button>

          <button
            onClick={onMoreActions}
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 shadow-sm active:scale-[0.97] transition-all"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
