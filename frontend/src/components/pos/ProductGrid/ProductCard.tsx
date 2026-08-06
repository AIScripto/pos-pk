import { Product } from '@/types/pos';
import { formatCurrency } from '@/utils/pos';
import { Plus, AlertTriangle } from 'lucide-react';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { getEntry } = useInventory();
  const entry = getEntry(product.id);
  const stockStatus = entry ? getStockStatus(entry) : 'in_stock';
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLowStock   = stockStatus === 'low_stock';
  const hasDiscount  = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      onClick={() => !isOutOfStock && onAdd(product)}
      role="button"
      aria-label={`Add ${product.name} to order${isOutOfStock ? ' — out of stock' : ''}`}
      aria-disabled={isOutOfStock}
      tabIndex={isOutOfStock ? -1 : 0}
      onKeyDown={(e) => e.key === 'Enter' && !isOutOfStock && onAdd(product)}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-white dark:bg-slate-900 shadow-xs transition-all duration-200 animate-fade-in touch-manipulation',
        isOutOfStock
          ? 'border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed opacity-60'
          : 'border-slate-200/80 dark:border-slate-800 cursor-pointer hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]'
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-20 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/70 to-transparent" />

        {/* SKU badge */}
        <div className="absolute left-1.5 top-1.5 rounded bg-slate-950/75 px-1.5 py-0.5 text-[8px] font-display font-extrabold uppercase tracking-widest text-white/90 backdrop-blur-xs shadow-xs">
          {product.code}
        </div>

        {/* Stock status overlays */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-1 rounded-md bg-rose-600/90 px-2 py-1 shadow-md">
              <AlertTriangle className="w-3 h-3 text-white" />
              <span className="text-[9px] font-display font-bold uppercase tracking-wide text-white">Out of Stock</span>
            </div>
          </div>
        )}

        {/* Add button overlay (only when in stock) */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-950/20 backdrop-blur-[1px]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 transform group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2 gap-1 justify-between">
        <h3 className="font-body font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-1 pt-0.5">
          {/* Price */}
          <div className="flex items-baseline gap-1.5 leading-none flex-wrap">
            <span className="font-display font-black text-sm sm:text-base text-blue-600 dark:text-blue-400 leading-none">
              {formatCurrency(product.price)}
            </span>
            {hasDiscount && (
              <span className="font-display font-extrabold text-[11px] line-through text-slate-400 dark:text-slate-500 leading-none">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Badges + add button */}
          <div className="flex items-center gap-1 shrink-0">
            {isLowStock && !isOutOfStock && (
              <span className="stock-badge-low text-[8px] px-1 py-0.2">Low</span>
            )}
            {hasDiscount && (
              <span className="rounded bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 text-[8px] font-extrabold leading-none">
                SALE
              </span>
            )}
            {!isOutOfStock && (
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-extrabold leading-none shrink-0 shadow-xs group-hover:bg-blue-700 transition-colors">
                +
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
