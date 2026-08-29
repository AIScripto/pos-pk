import React from 'react';
import { PauseCircle, Receipt, CreditCard, Zap, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface CartActionButtonsProps {
  onHold: () => void;
  onCheckout: () => void;
  onDirectCashCheckout?: () => void;
  isConfirming?: boolean;
}

export function CartActionButtons({
  onCheckout,
  onDirectCashCheckout,
  isConfirming = false,
}: CartActionButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="px-3 pb-3 pt-1">
      {/* ── Primary 1-Tap Direct Invoice & Print Button ── */}
      <button
        onClick={onDirectCashCheckout || onCheckout}
        disabled={isConfirming}
        aria-label="Direct Cash Invoice & Print"
        className="w-full h-14 flex items-center justify-between px-4 rounded-xl font-display font-black text-[16px] uppercase tracking-wider text-white transition-all bg-success hover:bg-success active:scale-[0.99] shadow-lg shadow-success/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {isConfirming ? (
            <Loader2 className="w-5 h-5 animate-spin text-success" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/80 text-white shadow-xs">
              <Zap className="w-4 h-4 text-success fill-success" />
            </div>
          )}
          <span>{isConfirming ? 'Invoicing & Printing…' : t.common.cashAndPrint}</span>
        </div>
        <span className="font-mono text-xs font-black bg-success/60 text-success px-2.5 py-1 rounded-md border border-success/30">
          Enter ↵
        </span>
      </button>
    </div>
  );
}
