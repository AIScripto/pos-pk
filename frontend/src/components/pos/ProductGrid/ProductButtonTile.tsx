import { Product } from '@/types/pos';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface ProductButtonTileProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductButtonTile({ product, onAdd }: ProductButtonTileProps) {
  const { language } = useTranslation();
  const localizedName = getLocalizedItemName(product, language);
  const { getEntry } = useInventory();
  const entry = getEntry(product.id);
  const stockStatus = entry ? getStockStatus(entry) : 'in_stock';
  const isOutOfStock = stockStatus === 'out_of_stock';
  const hasDiscount  = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={cn(
        'group relative flex flex-col justify-between p-2 h-18 rounded-xl border transition-all duration-150 text-left touch-manipulation',
        isOutOfStock
          ? 'bg-secondary border-border opacity-50 cursor-not-allowed'
          : 'bg-card border-border hover:border-primary hover:bg-primary/50 dark:hover:bg-primary/20 active:scale-[0.98] shadow-xs'
      )}
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="font-extrabold text-2xs uppercase tracking-wider text-muted-foreground bg-secondary px-1 py-0.5 rounded border border-border">
          {product.code}
        </span>
        {hasDiscount && (
          <span className="font-extrabold text-2xs uppercase tracking-wide bg-success-subtle text-success-text px-1 py-0.5 rounded border border-success-border">
            Sale
          </span>
        )}
      </div>

      <h4 className="font-body font-black text-xs text-foreground line-clamp-1 leading-tight group-hover:text-primary">
        {localizedName}
      </h4>

      <div className="flex items-baseline justify-between gap-1 w-full pt-0.5">
        <div className="flex items-baseline gap-1 font-display font-black text-xs text-primary leading-none">
          <span>{formatCurrency(product.price)}</span>
          {hasDiscount && (
            <span className="text-2xs font-extrabold line-through text-muted-foreground/70 leading-none">
              {formatCurrency(product.originalPrice!)}
            </span>
          )}
        </div>
        <span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-white text-xs font-black shadow-xs group-hover:bg-primary/90 shrink-0">
          +
        </span>
      </div>
    </button>
  );
}
