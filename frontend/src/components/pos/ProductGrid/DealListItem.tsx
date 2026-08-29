import { Deal } from '@/types/pos';
import { formatCurrency, getSavingsPercent } from '@/utils/pos';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface DealListItemProps {
  deal: Deal;
  onAdd: (deal: Deal) => void;
}

export function DealListItem({ deal, onAdd }: DealListItemProps) {
  const { language } = useTranslation();
  const localizedName = getLocalizedItemName(deal, language);
  const savingsPercent = getSavingsPercent(deal.originalPrice, deal.price);

  return (
    <div
      onClick={() => onAdd(deal)}
      className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-warning/30 bg-warning/5 dark:bg-warning/20 hover:border-warning hover:bg-warning/10 transition-all duration-150 cursor-pointer touch-manipulation shadow-xs active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={deal.image} alt={localizedName} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-warning/40" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-body font-extrabold text-xs text-foreground truncate group-hover:text-warning">
              {localizedName}
            </h4>
            <span className="font-mono font-black text-2xs text-warning-text bg-warning/80 dark:bg-warning/30 px-1 py-0.5 rounded border border-warning-border dark:border-warning/50">
              Combo
            </span>
            <span className="text-2xs font-black uppercase tracking-wide bg-warning text-foreground px-1 py-0.5 rounded">
              Save {savingsPercent}%
            </span>
          </div>
          <span className="text-2xs text-warning-text font-semibold">
            {deal.products.length} Items included
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-baseline gap-1 text-right">
          <span className="font-display font-black text-xs text-warning-text">
            {formatCurrency(deal.price)}
          </span>
          <span className="font-display font-bold text-2xs line-through text-muted-foreground/70">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>

        <button className="flex h-6 px-2 items-center justify-center gap-1 rounded-lg bg-warning hover:bg-warning text-foreground font-black text-xs shadow-xs transition-all">
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
