import { DenominationEntry } from '@/types/till';
import { DenominationTable } from './DenominationTable';
import { formatCurrency } from '@/utils/pos';
import { Banknote } from 'lucide-react';

interface DenominationGridProps {
  denominations: DenominationEntry[];
  onChange: (denominations: DenominationEntry[]) => void;
  totalCash: number;
}

export function DenominationGrid({
  denominations,
  onChange,
  totalCash,
}: DenominationGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3.5">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-success" />
          <span className="font-display text-sm font-bold text-foreground">Cash Total</span>
        </div>
        <span className="font-mono text-xl font-black text-success-text">
          {formatCurrency(totalCash)}
        </span>
      </div>

      <DenominationTable
        entries={denominations}
        onChange={onChange}
      />
    </div>
  );
}
