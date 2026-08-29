import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { StockEntry } from '@/context/InventoryContext';
import { Product } from '@/types/pos';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  entry: StockEntry;
  onSave: (entry: StockEntry) => void;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  product,
  entry,
  onSave,
}: StockAdjustDialogProps) {
  const [quantity, setQuantity] = useState(entry.quantity);
  const [minThreshold, setMinThreshold] = useState(entry.minThreshold);
  const [unit, setUnit] = useState(entry.unit);

  useEffect(() => {
    if (open) {
      setQuantity(entry.quantity);
      setMinThreshold(entry.minThreshold);
      setUnit(entry.unit);
    }
  }, [open, entry]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ productId: product.id, quantity, minThreshold, unit });
    onOpenChange(false);
  }

  function nudge(delta: number) {
    setQuantity(prev => Math.max(0, prev + delta));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Quantity stepper */}
          <div className="space-y-1.5">
            <Label>Current Stock</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
            aria-label="Decrease"
                variant="outline"
                className="shrink-0"
                onClick={() => nudge(-1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                min="0"
                value={quantity}
                onChange={e => setQuantity(Math.max(0, Number(e.target.value)))}
                className="text-center font-semibold text-lg"
              />
              <Button
                type="button"
                size="icon"
            aria-label="Increase"
                variant="outline"
                className="shrink-0"
                onClick={() => nudge(1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 pt-1">
              {[10, 25, 50, 100].map(preset => (
                <Button
                  key={preset}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => setQuantity(prev => prev + preset)}
                >
                  +{preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Low-stock threshold */}
          <div className="space-y-1.5">
            <Label htmlFor="sad-threshold">Low Stock Alert Threshold</Label>
            <Input
              id="sad-threshold"
              type="number"
              min="0"
              value={minThreshold}
              onChange={e => setMinThreshold(Math.max(0, Number(e.target.value)))}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Show "Low Stock" warning when quantity falls to or below this number.
            </p>
          </div>

          {/* Unit label */}
          <div className="space-y-1.5">
            <Label htmlFor="sad-unit">Unit</Label>
            <Input
              id="sad-unit"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="units"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
