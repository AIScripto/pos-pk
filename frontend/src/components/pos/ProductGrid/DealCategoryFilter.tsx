import { Category, Deal } from '@/types/pos';
import { cn } from '@/lib/utils';
import { useProducts } from '@/context/ProductContext';
import { useTranslation } from '@/i18n';
import { getLocalizedCategoryName } from '@/i18n/catalog';

interface DealCategoryFilterProps {
  dealSubCategory: Category | 'all';
  onSubCategoryChange: (category: Category | 'all') => void;
  deals: Deal[];
}

const getIconForCategory = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('wrap')) return '🌯';
  if (lower.includes('chicken')) return '🍗';
  if (lower.includes('fry') || lower.includes('fries')) return '🍟';
  if (lower.includes('drink') || lower.includes('beverage')) return '🥤';
  if (lower.includes('pizza')) return '🍕';
  if (lower.includes('dessert') || lower.includes('sweet')) return '🍦';
  if (lower.includes('salad')) return '🥗';
  return '🍽️';
};

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
    { key: 'all', label: language === 'ar' ? 'جميع العروض' : language === 'ur' ? 'تمام ڈیلز' : 'All Deals', icon: '⚡' },
    ...dealCategories.map(c => ({
      key: c.name,
      label: `${getLocalizedCategoryName(c.name, language)}`,
      icon: getIconForCategory(c.name)
    }))
  ];

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/30 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto pos-scrollbar">
      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 shrink-0 mr-1">
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
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm scale-[1.02] font-black border border-amber-400'
                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-500/50'
            )}
          >
            <span className="text-sm">{sub.icon}</span>
            <span>{sub.label}</span>
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.2 rounded-full font-black tabular-nums border',
                isSel
                  ? 'bg-slate-950/20 border-slate-950/30 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100'
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
