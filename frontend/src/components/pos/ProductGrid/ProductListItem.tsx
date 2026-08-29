import { Product } from '@/types/pos';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName, getLocalizedCategoryName } from '@/i18n/catalog';

interface ProductListItemProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductListItem({ product, onAdd }: ProductListItemProps) {
  const { language } = useTranslation();
  const localizedName = getLocalizedItemName(product, language);
  const localizedCategory = getLocalizedCategoryName(product.category, language);
  const { getEntry } = useInventory();
  const entry = getEntry(product.id);
  const stockStatus = entry ? getStockStatus(entry) : 'in_stock';
  const isOutOfStock = stockStatus === 'out_of_stock';
  const hasDiscount  = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      onClick={() => !isOutOfStock && onAdd(product)}
      className={cn(
        'group flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer touch-manipulation',
        isOutOfStock
          ? 'bg-secondary border-border opacity-50 cursor-not-allowed'
          : 'bg-card border-border hover:border-primary hover:bg-muted/40 active:scale-[0.99] shadow-xs'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={product.image} alt={localizedName} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-body font-extrabold text-xs text-foreground truncate group-hover:text-primary">
              {localizedName}
            </h4>
            <span className="font-mono font-bold text-2xs text-muted-foreground bg-secondary px-1 py-0.5 rounded border border-border">
              {product.code}
            </span>
          </div>
          <span className="text-2xs text-muted-foreground uppercase tracking-wide">
            {localizedCategory}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-baseline gap-1 text-right">
          <span className="font-display font-black text-xs text-primary">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="font-display font-bold text-2xs line-through text-muted-foreground/70">
              {formatCurrency(product.originalPrice!)}
            </span>
          )}
        </div>

        <button
          disabled={isOutOfStock}
          className="flex h-6 px-2 items-center justify-center gap-1 rounded-lg bg-primary hover:bg-primary/90 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
