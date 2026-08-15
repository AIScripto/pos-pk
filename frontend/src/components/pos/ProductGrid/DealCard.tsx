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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 cursor-pointer transition-all duration-200 hover:border-amber-500/60 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-500/15 active:scale-[0.98] touch-manipulation animate-fade-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {/* Savings badge */}
      <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 rounded bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-slate-950 shadow-xs">
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
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/70 to-transparent" />

        {/* Category badge */}
        <div className="absolute left-1.5 top-1.5 rounded bg-slate-950/80 px-1.5 py-0.5 text-[8px] font-display font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur-xs shadow-xs border border-amber-500/30">
          {categoryLabel}
        </div>

        {/* Add overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-950/20 backdrop-blur-[1px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 transform group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2 gap-1 justify-between">
        <h3 className="font-body font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-amber-500 transition-colors">
          {localizedName}
        </h3>

        <div className="flex items-end justify-between gap-1 pt-0.5">
          {/* Price */}
          <div className="flex items-baseline gap-1.5 leading-none flex-wrap">
            <span className="font-display font-black text-sm sm:text-base text-amber-600 dark:text-amber-400 leading-none">
              {formatCurrency(deal.price)}
            </span>
            <span className="font-display font-extrabold text-[11px] line-through text-slate-400 dark:text-slate-500 leading-none">
              {formatCurrency(deal.originalPrice)}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Items count chip */}
            <div className="flex items-center gap-0.5 rounded bg-amber-500/10 border border-amber-500/25 px-1 py-0.5">
              <Layers2 className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span className="font-display font-bold text-[8px] text-amber-700 dark:text-amber-300">{deal.products.length}</span>
            </div>
            <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-amber-500 text-slate-950 text-sm font-extrabold leading-none shadow-xs group-hover:bg-amber-600 transition-colors">
              +
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
