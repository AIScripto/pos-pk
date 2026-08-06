import React from 'react';
import { LockKeyhole } from 'lucide-react';

interface TillClosedGateProps {
  onOpenTill: () => void;
}

/**
 * TillClosedGate Component
 * 
 * Rendered when the current register/till is closed.
 * Prompts the cashier with an action card to open shift and start taking orders.
 * 
 * @component
 */
export const TillClosedGate: React.FC<TillClosedGateProps> = ({ onOpenTill }) => {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-xl flex-col items-center gap-5 rounded-2xl border border-destructive/30 bg-card px-8 py-10 text-center shadow-2xl">
        {/* Lock Shield Badge */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10">
          <LockKeyhole className="h-8 w-8 text-destructive" />
        </div>

        {/* Messaging */}
        <div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">Till is Closed</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Open the selected till to start accepting sales for this shift.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onOpenTill}
          className="flex items-center gap-2 rounded-xl px-6 py-3 font-display text-sm font-bold text-white transition-all active:scale-[0.97] hover:opacity-95 shadow-md"
          style={{ background: 'linear-gradient(135deg, hsl(142 70% 40%), hsl(142 70% 30%))' }}
        >
          <LockKeyhole className="h-4 w-4" />
          Open Till Now
        </button>
      </section>
    </main>
  );
};

export default TillClosedGate;
