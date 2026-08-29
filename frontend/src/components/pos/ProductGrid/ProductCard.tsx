import { Product } from '@/types/pos';
import { formatCurrency } from '@/utils/pos';
import { Plus, AlertTriangle } from 'lucide-react';
import { useInventory, getStockStatus } from '@/context/InventoryContext';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const { t, language } = useTranslation();
  const localizedName = getLocalizedItemName(product, language);
  const { getEntry } = useInventory();
  const entry = getEntry(product.id);
  const stockStatus = entry ? getStockStatus(entry) : 'in_stock';
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLowStock   = stockStatus === 'low_stock';
  const hasDiscount  = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <button
      type="button"
      disabled={isOutOfStock}
      onClick={() => onAdd(product)}
      aria-label={`${t.common.add} ${localizedName}${isOutOfStock ? ` — ${t.common.outOfStock}` : ''}`}
      className={cn(
        'group pos-tile animate-fade-in',
        isOutOfStock ? 'pos-tile-unavailable' : 'pos-tile-available'
      )}
    >
      {/* Image — the aspect ratio is fixed rather than the height, so the tile keeps
          its proportions as the grid reflows from 3 to 8 columns. */}
      <div className="relative aspect-[5/3] w-full overflow-hidden shrink-0 bg-muted">
        <img
          src={product.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />

        {/* SKU */}
        <div className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-display font-bold uppercase tracking-wide text-white/95 backdrop-blur-xs">
          {product.code}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-xs">
            <div className="flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1.5 shadow-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive-foreground" />
              <span className="text-[11px] font-display font-bold uppercase tracking-wide text-destructive-foreground">
                {t.common.outOfStock}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5">
        <h3 className="line-clamp-2 font-body text-sm font-bold leading-tight text-card-foreground transition-colors group-hover:text-primary">
          {localizedName}
        </h3>

        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-1.5 leading-none">
            <span className="pos-price text-base leading-none">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="font-display text-xs font-bold leading-none text-muted-foreground line-through">
                {formatCurrency(product.originalPrice!)}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {isLowStock && !isOutOfStock && <span className="stock-badge-low">{t.common.low}</span>}
            {hasDiscount && <span className="stock-badge-sale">{t.common.sale}</span>}
          </div>
        </div>
      </div>

      {/* Add affordance. Persistent, not hover-revealed — on the touch terminal this
          app runs on, hover never fires and a hover-only signal is simply absent. */}
      {!isOutOfStock && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs transition-transform duration-150 group-hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}
