import { Deal } from '@/types/pos';
import { formatCurrency, getSavingsPercent } from '@/utils/pos';
import { Plus, Sparkles, Layers2 } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName, getLocalizedCategoryName } from '@/i18n/catalog';
import { toLocalizedDigits } from '@/i18n/digits';

interface DealCardProps {
  deal: Deal;
  onAdd: (deal: Deal) => void;
}

export function DealCard({ deal, onAdd }: DealCardProps) {
  const { t, language } = useTranslation();
  const localizedName = getLocalizedItemName(deal, language);
  const savingsPercent = getSavingsPercent(deal.originalPrice, deal.price);

  const categoryLabel = deal.category
    ? `${getLocalizedCategoryName(deal.category, language)}`
    : t.common.combo;

  return (
    <div
      onClick={() => onAdd(deal)}
      role="button"
      aria-label={`Add ${localizedName} deal to order — save ${savingsPercent}%`}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onAdd(deal)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-warning/30 bg-card cursor-pointer transition-all duration-200 hover:border-warning/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-warning/15 active:scale-[0.98] touch-manipulation animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning"
    >
      {/* Savings badge */}
      <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded bg-warning px-1.5 py-0.5 text-2xs font-black uppercase tracking-wide text-foreground shadow-xs">
        <Sparkles className="w-2.5 h-2.5" />
        {t.common.savePercent} {toLocalizedDigits(savingsPercent, language)}%
      </div>

      {/* Image */}
      <div className="relative overflow-hidden shrink-0">
        <img
          src={deal.image}
          alt={localizedName}
          className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-muted/70 to-transparent" />

        {/* Category badge */}
        <div className="absolute left-1.5 top-1.5 rounded bg-muted/80 px-1.5 py-0.5 text-2xs font-display font-extrabold uppercase tracking-wider text-warning backdrop-blur-xs shadow-xs border border-warning/30">
          {categoryLabel}
        </div>

        {/* Add overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-muted/20 backdrop-blur-[1px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning text-foreground shadow-md shadow-warning/30 transform group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2 gap-1 justify-between">
        <h3 className="font-body font-bold text-xs text-foreground leading-tight line-clamp-1 group-hover:text-warning transition-colors">
          {localizedName}
        </h3>

        <div className="flex items-end justify-between gap-1 pt-0.5">
          {/* Price */}
          <div className="flex items-baseline gap-1.5 leading-none flex-wrap">
            <span className="font-display font-black text-sm sm:text-base text-warning-text leading-none">
              {formatCurrency(deal.price)}
            </span>
            <span className="font-display font-extrabold text-[11px] line-through text-muted-foreground/70 leading-none">
              {formatCurrency(deal.originalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Items count chip */}
            <div className="flex items-center gap-0.5 rounded bg-warning/10 border border-warning/25 px-1 py-0.5">
              <Layers2 className="w-2.5 h-2.5 text-warning-text" />
              <span className="font-display font-bold text-2xs text-warning-text">{deal.products.length}</span>
            </div>
            <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-warning text-foreground text-sm font-extrabold leading-none shadow-xs group-hover:bg-warning transition-colors">
              +
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
