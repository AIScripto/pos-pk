import React from 'react';
import { Plus, Tag, PauseCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation();

  return (
    <div className="border-b border-border bg-muted/80 px-2.5 py-2 shrink-0 no-print">
      <div className="grid grid-cols-3 gap-1.5">
        {/* 1. New Order */}
        <button
          onClick={onNewOrder}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all cursor-pointer"
          title={t.common.newOrder}
        >
          <Plus className="w-3.5 h-3.5 shrink-0 text-white stroke-[2.5]" />
          <span>{t.common.newOrder}</span>
        </button>

        {/* 2. Discount */}
        <button
          onClick={onDiscount}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-warning hover:from-warning hover:to-warning text-foreground font-black text-[11px] uppercase tracking-wider shadow-sm active:scale-[0.97] transition-all cursor-pointer"
          title={t.common.discount}
        >
          <Tag className="w-3.5 h-3.5 shrink-0 text-foreground stroke-[2.5]" />
          <span>{t.common.discount}</span>
        </button>

        {/* 3. Park / Hold */}
        <button
          onClick={onHold}
          disabled={cartItemCount === 0}
          className="flex items-center justify-center gap-1.5 h-9 px-2 rounded-lg bg-warning-subtle border border-warning-border dark:border-warning/60 hover:bg-warning-subtle text-warning-text font-extrabold text-[11px] uppercase tracking-wider shadow-xs active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer"
          title={t.common.park}
        >
          <PauseCircle className="w-3.5 h-3.5 shrink-0 text-warning-text stroke-[2.5]" />
          <span>{t.common.park}</span>
        </button>
      </div>
    </div>
  );
}
