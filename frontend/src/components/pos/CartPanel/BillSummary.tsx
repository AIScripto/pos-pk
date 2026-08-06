import React from 'react';
import { formatCurrency } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';

interface BillSummaryProps {
  subtotal: number;
  totalDiscount: number;
  taxAmount: number;
  taxRate: number;
  taxLabel: string;
  grandTotal: number;
}

export function BillSummary({
  subtotal,
  totalDiscount,
  taxAmount,
  taxRate,
  taxLabel,
  grandTotal,
}: BillSummaryProps) {
  return (
    <div className="px-4 py-4 space-y-2">
      {/* Subtotal */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">Subtotal</span>
        <span className="font-mono text-foreground font-semibold tabular-nums">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* Discount (if any) */}
      {totalDiscount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-accent font-medium">Discount</span>
          <span className="font-mono text-accent font-semibold tabular-nums">
            -{formatCurrency(totalDiscount)}
          </span>
        </div>
      )}

      {/* Tax (if enabled) */}
      {TAX_CONFIG.enabled && taxAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-medium">
            {taxLabel}
            <span className="ml-1 text-xs opacity-60">({taxRate}%)</span>
          </span>
          <span className="font-mono text-muted-foreground font-semibold tabular-nums">
            +{formatCurrency(taxAmount)}
          </span>
        </div>
      )}

      {/* Grand Total — PROMINENT */}
      <div className="flex justify-between items-center pt-3.5 border-t-2 border-border/60 mt-3">
        <span className="font-display font-bold text-sm uppercase tracking-widest text-foreground">
          Grand Total
        </span>
        <span className="font-display font-black text-4xl text-primary tabular-nums leading-none tracking-tight">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
