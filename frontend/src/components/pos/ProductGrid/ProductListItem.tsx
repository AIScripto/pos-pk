import { Product } from '@/types/pos';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { formatCurrency } from '@/utils/pos';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface ProductListItemProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductListItem({ product, onAdd }: ProductListItemProps) {
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
          ? 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.99] shadow-xs'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img src={product.image} alt={product.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-body font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
              {product.name}
            </h4>
            <span className="font-mono font-bold text-[8px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700">
              {product.code}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-baseline gap-1 text-right">
          <span className="font-display font-black text-xs text-blue-600 dark:text-blue-400">
            {formatCurrency(product.price)}
          </span>
          {hasDiscount && (
            <span className="font-display font-bold text-[9px] line-through text-slate-400 dark:text-slate-500">
              {formatCurrency(product.originalPrice!)}
            </span>
          )}
        </div>

        <button
          disabled={isOutOfStock}
          className="flex h-6 px-2 items-center justify-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-xs transition-all disabled:opacity-50"
        >
          <Plus className="w-3 h-3" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}
