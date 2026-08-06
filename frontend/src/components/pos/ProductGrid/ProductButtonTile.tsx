import { Product } from '@/types/pos';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';

interface ProductButtonTileProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductButtonTile({ product, onAdd }: ProductButtonTileProps) {
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
          ? 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 active:scale-[0.98] shadow-xs'
      )}
    >
      <div className="flex items-start justify-between gap-1 w-full">
        <span className="font-extrabold text-[8px] uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
          {product.code}
        </span>
        {hasDiscount && (
          <span className="font-extrabold text-[8px] uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
            Sale
          </span>
        )}
      </div>

      <h4 className="font-body font-black text-xs text-slate-900 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {product.name}
      </h4>

      <div className="flex items-baseline justify-between gap-1 w-full pt-0.5">
        <div className="flex items-baseline gap-1 font-display font-black text-xs text-blue-600 dark:text-blue-400 leading-none">
          <span>{formatCurrency(product.price)}</span>
          {hasDiscount && (
            <span className="text-[9px] font-extrabold line-through text-slate-400 dark:text-slate-500 leading-none">
              {formatCurrency(product.originalPrice!)}
            </span>
          )}
        </div>
        <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-600 text-white text-xs font-black shadow-xs group-hover:bg-blue-700 shrink-0">
          +
        </span>
      </div>
    </button>
  );
}
