import { Deal } from '@/types/pos';
import { formatCurrency, getSavingsPercent } from '@/utils/pos';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface DealButtonTileProps {
  deal: Deal;
  onAdd: (deal: Deal) => void;
}

export function DealButtonTile({ deal, onAdd }: DealButtonTileProps) {
  const { language } = useTranslation();
  const localizedName = getLocalizedItemName(deal, language);
  const savingsPercent = getSavingsPercent(deal.originalPrice, deal.price);

  return (
    <button
      onClick={() => onAdd(deal)}
      className="group relative flex flex-col justify-between p-2 h-18 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-150 text-left touch-manipulation shadow-xs active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="font-extrabold text-[8px] uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-500/30 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-700/50">
          Combo
        </span>
        <span className="font-black text-[8px] uppercase tracking-wide bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-1 py-0.2 rounded shadow-xs">
          Save {savingsPercent}%
        </span>
      </div>

      <h4 className="font-body font-black text-xs text-slate-900 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-amber-500 transition-colors">
        {localizedName}
      </h4>

      <div className="flex items-baseline justify-between gap-1 w-full pt-0.5">
        <div className="flex items-baseline gap-1 font-display font-black text-xs text-amber-600 dark:text-amber-400 leading-none">
          <span>{formatCurrency(deal.price)}</span>
          <span className="text-[9px] font-extrabold line-through text-slate-400 dark:text-slate-500 leading-none">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>
        <span className="flex h-4 w-4 items-center justify-center rounded bg-amber-500 text-slate-950 text-xs font-black shadow-xs group-hover:bg-amber-600 shrink-0">
          +
        </span>
      </div>
    </button>
  );
}
