import React from 'react';
import { PauseCircle, Receipt } from 'lucide-react';

interface CartActionButtonsProps {
  onHold: () => void;
  onCheckout: () => void;
}

export function CartActionButtons({ onHold, onCheckout }: CartActionButtonsProps) {
  return (
    <div className="flex gap-3 px-4 pb-3">
      <button
        onClick={onHold}
        title="Park current cart to serve next customer"
        aria-label="Park order"
        className="pos-btn-secondary h-14 flex items-center justify-center gap-1.5 px-4 sm:px-5 rounded-xl shrink-0 cursor-pointer shadow-sm hover:shadow transition-all active:scale-[0.98]"
      >
        <PauseCircle className="w-5 h-5 text-amber-500" />
        <span className="hidden xl:inline font-display font-extrabold text-sm uppercase tracking-wide">Park Order</span>
      </button>
      <button
        onClick={onCheckout}
        aria-label="Proceed to checkout"
        className="flex-1 pos-btn-success h-14 flex items-center justify-center gap-2 font-display font-black text-[17px] uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
      >
        <Receipt className="w-5 h-5" />
        <span>Checkout</span>
        <span className="ml-1 font-mono text-[10px] font-black bg-white/25 text-white px-1.5 py-0.5 rounded-md leading-none border border-white/30 shadow-2xs">
          Enter ↵
        </span>
      </button>
    </div>
  );
}
