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
      className="group relative flex flex-col justify-between p-2 h-18 rounded-xl border border-warning/30 bg-warning/5 dark:bg-warning/20 hover:border-warning hover:bg-warning/10 transition-all duration-150 text-left touch-manipulation shadow-xs active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="font-extrabold text-2xs uppercase tracking-wider text-warning-text bg-warning/80 dark:bg-warning/30 px-1 py-0.5 rounded border border-warning-border dark:border-warning/50">
          Combo
        </span>
        <span className="font-black text-2xs uppercase tracking-wide bg-warning text-foreground px-1 py-0.5 rounded shadow-xs">
          Save {savingsPercent}%
        </span>
      </div>

      <h4 className="font-body font-black text-xs text-foreground line-clamp-1 leading-tight group-hover:text-warning transition-colors">
        {localizedName}
      </h4>

      <div className="flex items-baseline justify-between gap-1 w-full pt-0.5">
        <div className="flex items-baseline gap-1 font-display font-black text-xs text-warning-text leading-none">
          <span>{formatCurrency(deal.price)}</span>
          <span className="text-2xs font-extrabold line-through text-muted-foreground/70 leading-none">
            {formatCurrency(deal.originalPrice)}
          </span>
        </div>
        <span className="flex h-4 w-4 items-center justify-center rounded bg-warning text-foreground text-xs font-black shadow-xs group-hover:bg-warning shrink-0">
          +
        </span>
      </div>
    </button>
  );
}
