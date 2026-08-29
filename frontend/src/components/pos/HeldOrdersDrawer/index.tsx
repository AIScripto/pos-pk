import { useCart } from '@/context/CartContext';
import { HeldOrder } from '@/types/pos';
import { formatCurrency, calculateCartTotals, calculateTax } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import {
  PauseCircle,
  PlayCircle,
  Trash2,
  User,
  Clock,
  ShoppingBag,
  X,
  Coffee,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface HeldOrdersDrawerProps {
  onClose: () => void;
}

function formatElapsed(heldAt: Date): string {
  const secs = Math.floor((Date.now() - heldAt.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function HeldOrderCard({
  held,
  onResume,
  onDelete,
}: {
  held: HeldOrder;
  onResume: () => void;
  onDelete: () => void;
}) {
  const totals = calculateCartTotals(held.items);
  const { grandTotal } = calculateTax(totals.grandTotal);
  const itemCount = held.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemNames = held.items
    .slice(0, 3)
    .map((item) => item.product?.name ?? item.deal?.name ?? 'Item')
    .join(', ');
  const hasMore = held.items.length > 3;

  return (
    <div className="rounded-[20px] border border-border/70 bg-card/85 p-4 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.4)] transition-all hover:border-primary/40 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.5)] animate-slide-up">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/15 text-warning shrink-0">
            <PauseCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-card-foreground leading-tight">{held.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{formatElapsed(held.heldAt)}</p>
            </div>
          </div>
        </div>

        {/* Grand total */}
        <div className="text-right shrink-0">
          <p className="font-mono font-bold text-lg text-card-foreground">{formatCurrency(grandTotal)}</p>
          {TAX_CONFIG.enabled && (
            <p className="text-xs text-muted-foreground">incl. {TAX_CONFIG.label}</p>
          )}
        </div>
      </div>

      {/* Customer */}
      {held.activeCustomer && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2">
          <User className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-sm font-medium text-card-foreground">{held.activeCustomer.name}</span>
          {held.activeCustomer.phone && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{held.activeCustomer.phone}</span>
            </>
          )}
        </div>
      )}

      {/* Item summary */}
      <div className="mt-3 flex items-start gap-2">
        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          {itemCount} item{itemCount !== 1 ? 's' : ''} — {itemNames}
          {hasMore && ` +${held.items.length - 3} more`}
        </p>
      </div>

      {/* Pre-tax subtotal strip */}
      <div className="mt-3 flex justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
        <span>Subtotal: {formatCurrency(totals.subtotal)}</span>
        {totals.totalDiscount > 0 && (
          <span className="text-success">Discount: -{formatCurrency(totals.totalDiscount)}</span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={onResume}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <PlayCircle className="h-4 w-4" />
          Resume Order
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-border/70 bg-background/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function HeldOrdersDrawer({ onClose }: HeldOrdersDrawerProps) {
  const { state, resumeOrder, deleteHeldOrder } = useCart();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleResume = (id: string) => {
    resumeOrder(id);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteHeldOrder(deleteTarget);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md border-l border-border/70 bg-card shadow-[0_0_80px_-20px_rgba(15,23,42,0.7)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-card/80 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/15 text-warning">
              <PauseCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-card-foreground">Held Orders</h2>
              <p className="text-xs text-muted-foreground">
                {state.heldOrders.length} order{state.heldOrders.length !== 1 ? 's' : ''} on hold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pos-scrollbar">
          {state.heldOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Coffee className="w-9 h-9 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground text-lg">No held orders</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-[220px]">
                  Use the <strong>Hold</strong> button in the cart panel to pause an active order and start a new one.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Show newest holds first */}
              {[...state.heldOrders].reverse().map((held) => (
                <HeldOrderCard
                  key={held.id}
                  held={held}
                  onResume={() => handleResume(held.id)}
                  onDelete={() => setDeleteTarget(held.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="shrink-0 border-t border-border/70 bg-background/60 px-5 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Resuming an order will replace the current cart contents.
          </p>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard held order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the held order. The items and customer info will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep hold</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
