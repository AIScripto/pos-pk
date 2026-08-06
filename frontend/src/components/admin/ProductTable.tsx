import { useState } from 'react';
import { Product } from '@/types/pos';
import { categoryLabels } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductFormDialog } from './ProductFormDialog';
import { Pencil, Trash2, Plus, PackageSearch } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

export function ProductTable() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const existingCodes = products.map(p => p.code);

  function openEdit(product: Product) {
    setEditTarget(product);
    setFormOpen(true);
  }

  function openAdd() {
    setEditTarget(undefined);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <PackageSearch className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No products yet</p>
          <p className="text-sm mt-1">Add your first product to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-14">Img</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        🍽️
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {product.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{product.code}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs capitalize">
                      {categoryLabels[product.category] ?? product.category}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="text-xs line-through text-muted-foreground tabular-nums">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                        <span className="font-semibold tabular-nums text-green-600 dark:text-green-400">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold tabular-nums">${product.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {confirmDeleteId === product.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => { deleteProduct(product.id); setConfirmDeleteId(null); }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(product)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDeleteId(product.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(undefined); }}
        product={editTarget}
        onSave={editTarget
          ? (values) => updateProduct({ ...values, id: editTarget.id })
          : (values) => addProduct(values)
        }
        existingCodes={existingCodes}
      />
    </div>
  );
}
