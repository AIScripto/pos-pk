import { Category, Deal } from '@/types/pos';
import { cn } from '@/lib/utils';
import { useProducts } from '@/context/ProductContext';
import { useTranslation } from '@/i18n';
import { getLocalizedCategoryName } from '@/i18n/catalog';
import { getIconForCategory, DEALS_ICON } from './categoryIcons';

interface DealCategoryFilterProps {
  dealSubCategory: Category | 'all';
  onSubCategoryChange: (category: Category | 'all') => void;
  deals: Deal[];
}

export function DealCategoryFilter({
  dealSubCategory,
  onSubCategoryChange,
  deals,
}: DealCategoryFilterProps) {
  const { language } = useTranslation();
  const { categories: dynamicCategories } = useProducts();
  
  // Filter categories to only those that have deals
  const dealCategories = dynamicCategories
    .filter(cat => deals.some(d => d.category === cat.name))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const filters = [
    { key: 'all', label: language === 'ar' ? 'جميع العروض' : language === 'ur' ? 'تمام ڈیلز' : 'All Deals', icon: DEALS_ICON },
    ...dealCategories.map(c => ({
      key: c.name,
      label: `${getLocalizedCategoryName(c.name, language)}`,
      icon: getIconForCategory(c.name)
    }))
  ];

  return (
    <div className="border-b border-warning/30 bg-warning/10 dark:bg-warning/30 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto pos-scrollbar">
      <span className="text-2xs font-black uppercase tracking-wider text-warning-text shrink-0 mr-1">
        Filter Deals:
      </span>
      {filters.map((sub) => {
        const isSel = dealSubCategory === sub.key;
        const subCount =
          sub.key === 'all'
            ? deals.length
            : deals.filter((d) => d.category === sub.key).length;

        return (
          <button
            key={sub.key}
            type="button"
            onClick={() => onSubCategoryChange(sub.key as Category | 'all')}
            className={cn(
              'flex h-9 items-center gap-1.5 px-3 rounded-xl text-xs font-display font-extrabold transition-all shrink-0 cursor-pointer touch-manipulation shadow-2xs',
              isSel
                ? 'bg-warning text-foreground shadow-sm scale-[1.02] font-black border border-warning'
                : 'bg-card border border-border text-foreground hover:bg-warning-subtle hover:border-warning/50'
            )}
          >
            <sub.icon aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{sub.label}</span>
            <span
              className={cn(
                'text-2xs px-1.5 py-0.5 rounded-full font-black tabular-nums border',
                isSel
                  ? 'bg-muted/20 border-border/30 text-foreground'
                  : 'bg-secondary border-border text-foreground'
              )}
            >
              {subCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
