import { useState } from 'react';
import { Deal } from '@/types/pos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DealFormDialog } from './DealFormDialog';
import { Pencil, Trash2, Plus, PackageSearch } from 'lucide-react';
import { useProducts } from '@/context/ProductContext';

export function DealTable() {
  const { products, deals, addDeal, updateDeal, deleteDeal } = useProducts();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Deal | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const existingCodes = deals.map(d => d.code);
  const savings = (deal: Deal) => deal.originalPrice - deal.price;

  function openEdit(deal: Deal) {
    setEditTarget(deal);
    setFormOpen(true);
  }

  function openAdd() {
    setEditTarget(undefined);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{deals.length} deals</p>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <PackageSearch className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium">No deals yet</p>
          <p className="text-sm mt-1">Create your first bundle deal to attract customers.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-14">Img</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Items</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Saves</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deals.map(deal => (
                <tr key={deal.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    {deal.image ? (
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                        🎉
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{deal.name}</p>
                    {deal.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {deal.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 hidden sm:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">{deal.code}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {deal.products.slice(0, 3).map((p, i) => (
                        <Badge key={`${p.id}-${i}`} variant="outline" className="text-xs">
                          {p.name}
                        </Badge>
                      ))}
                      {deal.products.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{deal.products.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <p className="font-semibold tabular-nums">${deal.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground line-through">${deal.originalPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                    <Badge variant="secondary" className="text-green-600 dark:text-green-400 font-semibold">
                      -${savings(deal).toFixed(2)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    {confirmDeleteId === deal.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => { deleteDeal(deal.id); setConfirmDeleteId(null); }}
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
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(deal)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setConfirmDeleteId(deal.id)}
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

      <DealFormDialog
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditTarget(undefined); }}
        deal={editTarget}
        availableProducts={products}
        onSave={editTarget
          ? (values) => updateDeal({ ...values, id: editTarget.id })
          : (values) => addDeal(values)
        }
        existingCodes={existingCodes}
      />
    </div>
  );
}
