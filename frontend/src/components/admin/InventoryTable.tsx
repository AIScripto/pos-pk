import { useState } from 'react';
import { useInventory, StockEntry, getStockStatus } from '@/context/InventoryContext';
import { useProducts } from '@/context/ProductContext';
import { Product } from '@/types/pos';
import { categoryLabels } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StockAdjustDialog } from './StockAdjustDialog';
import { SlidersHorizontal, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const DEFAULT_ENTRY = (productId: string): StockEntry => ({
  productId,
  quantity: 0,
  minThreshold: 5,
  unit: 'units',
});

function StatusBadge({ entry }: { entry: StockEntry }) {
  const status = getStockStatus(entry);

  if (status === 'out_of_stock') {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <XCircle className="w-3 h-3" /> Out of Stock
      </Badge>
    );
  }
  if (status === 'low_stock') {
    return (
      <Badge className="gap-1 text-xs bg-warning/15 text-warning-text dark:text-warning border-warning/30 border">
        <AlertTriangle className="w-3 h-3" /> Low Stock
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 text-xs bg-success/15 text-success-text border-success/30 border">
      <CheckCircle2 className="w-3 h-3" /> In Stock
    </Badge>
  );
}

export function InventoryTable() {
  const { products } = useProducts();
  const { setStock, getEntry } = useInventory();
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);

  const totalLow = products.filter(p => {
    const e = getEntry(p.id) ?? DEFAULT_ENTRY(p.id);
    return getStockStatus(e) === 'low_stock';
  }).length;

  const totalOut = products.filter(p => {
    const e = getEntry(p.id) ?? DEFAULT_ENTRY(p.id);
    return getStockStatus(e) === 'out_of_stock';
  }).length;

  function handleSave(entry: StockEntry) {
    setStock(entry);
    setAdjustTarget(null);
  }

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">{products.length} products tracked</p>
        {totalOut > 0 && (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" /> {totalOut} out of stock
          </Badge>
        )}
        {totalLow > 0 && (
          <Badge className="gap-1 bg-warning/15 text-warning-text dark:text-warning border-warning/30 border">
            <AlertTriangle className="w-3 h-3" /> {totalLow} low stock
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stock</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Threshold</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(product => {
              const entry = getEntry(product.id) ?? DEFAULT_ENTRY(product.id);
              const status = getStockStatus(entry);

              return (
                <tr
                  key={product.id}
                  className={`transition-colors ${
                    status === 'out_of_stock'
                      ? 'bg-destructive/5 hover:bg-destructive/10'
                      : status === 'low_stock'
                      ? 'bg-warning/5 hover:bg-warning/10'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{product.code}</p>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs capitalize">
                      {categoryLabels[product.category] ?? product.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-semibold tabular-nums text-foreground">
                      {entry.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">{entry.unit}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden sm:table-cell">
                    <span className="text-muted-foreground tabular-nums">{entry.minThreshold}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge entry={entry} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => setAdjustTarget(product)}
                      aria-label={`Adjust stock for ${product.name}`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {adjustTarget && (
        <StockAdjustDialog
          open={!!adjustTarget}
          onOpenChange={open => { if (!open) setAdjustTarget(null); }}
          product={adjustTarget}
          entry={getEntry(adjustTarget.id) ?? DEFAULT_ENTRY(adjustTarget.id)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
