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
      className="group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-150 cursor-pointer touch-manipulation shadow-xs active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={deal.image} alt={localizedName} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-amber-400/40" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-body font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-amber-500">
              {localizedName}
            </h4>
            <span className="font-mono font-black text-[8px] text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-500/30 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-700/50">
              Combo
            </span>
            <span className="text-[8px] font-black uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-1 py-0.2 rounded">
              Save {savingsPercent}%
            </span>
          </div>
          <span className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold">
            {deal.products.length} Items included
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-baseline gap-1 text-right">
          <span className="font-display font-black text-xs text-amber-600 dark:text-amber-400">
            {formatCurrency(deal.price)}
          </span>
          <span className="font-display font-bold text-[9px] line-through text-slate-400 dark:text-slate-500">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>

        <button className="flex h-6 px-2 items-center justify-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-xs transition-all">
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
