import React, { lazy, Suspense, useRef, useState } from 'react';
import { CartProvider, useCart } from '@/context/CartContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { ProductProvider } from '@/context/ProductContext';
import { useOrders } from '@/context/OrderContext';
import { POSHeader } from '@/components/pos/POSHeader';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { QuickActionButtons } from '@/components/pos/QuickActionButtons';
import { useTill } from '@/context/TillContext';
import { useLock, LockProvider }  from '@/context/LockContext';
import { LockScreen } from '@/components/pos/LockScreen';
import { ShoppingBag, FileText, ChefHat, Package, Search, PauseCircle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

import TillRestoringGate from '@/components/pos/TillRestoringGate';
import TillClosedGate from '@/components/pos/TillClosedGate';
import { usePOSKeyboardShortcuts } from '@/hooks/usePOSKeyboardShortcuts';
import { usePOSCheckout } from '@/hooks/pos/usePOSCheckout';
import { POSModalsContainer } from '@/components/pos/POSModalsContainer';

const ManagerReportPanel = lazy(() => import('@/components/reports/ManagerReportPanel'));

// ---------------------------------------------------------------------------
// Inner component — has access to CartContext via useCart()
// ---------------------------------------------------------------------------

function POSInner() {
  const { t, language } = useTranslation();
  const { addProduct, addDeal, state, markInvoicePaid, holdOrder, clearCart, clearInvoiceHistory } = useCart();
  const { getActiveOrders, clearSessionOrders } = useOrders();
  const { isOpen: tillOpen, isRestoring: isTillRestoring, session: tillSession } = useTill();
  const { isLocked } = useLock();
  const { toast }    = useToast();

  const [showCart,       setShowCart]       = useState(false);
  const [showInvoices,   setShowInvoices]   = useState(false);
  const [showHeld,       setShowHeld]       = useState(false);
  const [showOrders,     setShowOrders]     = useState(false);
  const [showProducts,   setShowProducts]   = useState(false);
  const [showOpenTill,     setShowOpenTill]     = useState(false);
  const [showCloseTill,    setShowCloseTill]    = useState(false);
  const [showTillCloseout, setShowTillCloseout] = useState(false);

  const checkout = usePOSCheckout();

  // Global POS Keyboard Shortcuts
  usePOSKeyboardShortcuts({
    onToggleCart: () => setShowCart((prev) => !prev),
    onToggleHeld: () => setShowHeld((prev) => !prev),
    onToggleOrders: () => setShowOrders((prev) => !prev),
    onToggleProducts: () => setShowProducts((prev) => !prev),
    onToggleInvoices: () => setShowInvoices((prev) => !prev),
    onDirectCashCheckout: () => { void onDirectCashCheckoutClick(); },
  });

  // Auto-open the till dialog as soon as we know the till is closed.
  React.useEffect(() => {
    if (!isTillRestoring && !tillOpen) setShowOpenTill(true);
  }, [isTillRestoring, tillOpen]);

  // When a NEW till session is opened, clear stale orders and invoice history
  const prevTillSessionId = useRef<string | null>(null);
  React.useEffect(() => {
    if (!tillSession?.id) return;
    const currentId = tillSession.id;
    if (prevTillSessionId.current !== null && prevTillSessionId.current !== currentId) {
      clearSessionOrders();
      clearInvoiceHistory();
    }
    prevTillSessionId.current = currentId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tillSession?.id]);

  const activeOrderCount = getActiveOrders().length;
  const cartItemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const onCheckoutClick = () => {
    checkout.handleCheckout(() => setShowOpenTill(true));
  };

  const onDirectCashCheckoutClick = async () => {
    return checkout.handleDirectCashCheckout(
      () => setShowOpenTill(true),
      () => setShowCart(false)
    );
  };

  const onConfirmInvoiceClick = async (inv?: import('@/types/pos').Invoice | null) => {
    return checkout.handleConfirmInvoice(
      () => setShowOpenTill(true),
      () => setShowCart(false),
      inv ?? undefined
    );
  };

  const onPaymentConfirmedClick = async (allocations: import('@/types/pos').PaymentAllocation[]) => {
    return checkout.handlePaymentConfirmed(allocations, () => setShowCart(false));
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Lock screen overlay */}
      {isLocked && <LockScreen />}

      {/* Header */}
      <POSHeader
        heldCount={state.heldOrders.length}
        onOpenHeld={() => setShowHeld(true)}
        onOpenTill={() => setShowOpenTill(true)}
        onCloseTill={() => setShowTillCloseout(true)}
      />

      {isTillRestoring ? (
        <TillRestoringGate />
      ) : !tillOpen ? (
        <TillClosedGate onOpenTill={() => setShowOpenTill(true)} />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: product area */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
            {/* Top action bar */}
            <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-2.5 no-print shrink-0">
              <div>
                <p className="font-display font-black text-2xs uppercase tracking-[0.22em] text-primary">
                  {t.common.serviceBoard}
                </p>
                <h2 className="font-display font-black text-[18px] text-foreground leading-tight">
                  {t.common.menu}
                </h2>
              </div>

              {/* Function Keys Action Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pos-scrollbar py-1 max-w-full">
                {[
                  {
                    key: 'F1',
                    label: t.common.search,
                    icon: Search,
                    badge: null,
                    action: () => {
                      // Keyed off a stable data attribute, not the placeholder text —
                      // the placeholder is translated, so matching on "Search" broke F1
                      // in every non-English locale.
                      const searchInput = document.querySelector<HTMLInputElement>('input[data-pos-search]');
                      if (searchInput) { searchInput.focus(); searchInput.select(); }
                    },
                  },
                  {
                    key: 'F2',
                    label: t.common.currentOrder,
                    icon: ShoppingBag,
                    badge: cartItemCount > 0 ? cartItemCount : null,
                    action: () => setShowCart((prev) => !prev),
                  },
                  {
                    key: 'F3',
                    label: t.common.park,
                    icon: PauseCircle,
                    badge: state.heldOrders.length > 0 ? state.heldOrders.length : null,
                    action: () => setShowHeld(true),
                  },
                  {
                    key: 'F4',
                    label: t.common.orders,
                    icon: ChefHat,
                    badge: activeOrderCount > 0 ? activeOrderCount : null,
                    action: () => setShowOrders((prev) => !prev),
                  },
                  {
                    key: 'F5',
                    label: t.common.deals,
                    icon: Sparkles,
                    badge: null,
                    action: () => {
                      const dealsBtn = document.querySelector<HTMLButtonElement>('button[data-category="deals"]');
                      if (dealsBtn) dealsBtn.click();
                    },
                  },
                  {
                    key: 'F6',
                    label: t.common.products,
                    icon: Package,
                    badge: null,
                    action: () => setShowProducts(true),
                  },
                  {
                    key: 'F7',
                    label: t.common.invoices,
                    icon: FileText,
                    badge: state.invoices.length > 0 ? state.invoices.length : null,
                    action: () => setShowInvoices(true),
                  },
                ].map((fk) => {
                  const Icon = fk.icon;
                  return (
                    <button
                      key={fk.key}
                      type="button"
                      onClick={fk.action}
                      className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] h-11 px-2.5 py-1 rounded-xl border border-border bg-secondary hover:bg-secondary/80 dark:hover:bg-muted hover:border-primary/80 transition-all cursor-pointer shadow-sm dark:shadow-md hover:shadow-lg active:scale-[0.96] group shrink-0 relative"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs sm:text-[13px] text-primary group-hover:text-primary transition-colors">
                          {fk.key}
                        </span>
                        <Icon className="w-4 h-4 shrink-0 text-foreground group-hover:text-primary transition-transform duration-150 group-hover:scale-110" />
                      </div>
                      <span className="font-display font-extrabold text-[11px] sm:text-xs text-foreground tracking-tight leading-tight mt-0.5 group-hover:text-primary">
                        {fk.label}
                      </span>
                      {fk.badge !== null && fk.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary text-white font-display font-black text-2xs px-1 shadow-md border border-white dark:border-border">
                          {fk.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-border shrink-0">
                  <Suspense fallback={null}>
                    <ManagerReportPanel invoices={state.invoices} />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1 overflow-hidden relative">
              <ProductGrid
                onAddProduct={(product) => {
                  addProduct(product);
                  toast({ title: `${getLocalizedItemName(product, language)} ${t.common.added}`, description: t.notifications.itemAdded });
                }}
                onAddDeal={(deal) => {
                  addDeal(deal);
                  toast({ title: `${getLocalizedItemName(deal, language)} ${t.common.added}`, description: t.notifications.itemAdded });
                }}
                onToggleCart={() => setShowCart((prev) => !prev)}
                onOpenHeld={() => setShowHeld(true)}
                onToggleOrders={() => setShowOrders((prev) => !prev)}
                onToggleProducts={() => setShowProducts(true)}
                onToggleInvoices={() => setShowInvoices((prev) => !prev)}
              />
            </div>
          </div>

          {/* Right: buttons and cart */}
          {/* The running order is the one panel a cashier never wants to lose.
              It used to appear only from 1024px, so on tablet portrait — a very
              common POS form factor — the cart was reachable only through a
              modal. It now holds from 768px at a narrower width. */}
          <div className="hidden md:flex w-[19rem] lg:w-[22rem] xl:w-[24rem] shrink-0 flex-col border-l border-border bg-card overflow-hidden">
            <QuickActionButtons
              cartItemCount={cartItemCount}
              onNewOrder={() => {
                if (state.items.length > 0) {
                  clearCart();
                  toast({ title: t.common.newOrder, description: t.notifications.cartCleared });
                } else {
                  toast({ title: t.common.newOrder, description: t.pos.addItemsToStart });
                }
              }}
              onDiscount={() => {
                if (state.items.length === 0) {
                  toast({ title: t.pos.cartEmpty, description: t.pos.addItemsToStart, variant: 'destructive' });
                } else {
                  toast({ title: t.discount.discountTitle, description: t.discount.expandItemHint });
                }
              }}
              onHold={() => {
                if (state.items.length === 0) {
                  toast({ title: t.pos.cartEmpty, description: t.pos.addItemsToStart, variant: 'destructive' });
                  return;
                }
                const held = holdOrder();
                if (held) {
                  toast({ title: t.notifications.orderHeld, description: held.label });
                }
              }}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              <CartPanel
                onCheckout={onCheckoutClick}
                onDirectCashCheckout={onDirectCashCheckoutClick}
                isConfirming={checkout.isConfirmingInvoice}
                onHold={(label) => {
                  toast({ title: t.notifications.orderHeld, description: label });
                  setShowHeld(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* POS Modals Container */}
      <POSModalsContainer
        showCart={showCart}
        setShowCart={setShowCart}
        showInvoices={showInvoices}
        setShowInvoices={setShowInvoices}
        showHeld={showHeld}
        setShowHeld={setShowHeld}
        showOrders={showOrders}
        setShowOrders={setShowOrders}
        showProducts={showProducts}
        setShowProducts={setShowProducts}
        showOpenTill={showOpenTill}
        setShowOpenTill={setShowOpenTill}
        showCloseTill={showCloseTill}
        setShowCloseTill={setShowCloseTill}
        showTillCloseout={showTillCloseout}
        setShowTillCloseout={setShowTillCloseout}
        showPaymentModal={checkout.showPaymentModal}
        setShowPaymentModal={checkout.setShowPaymentModal}
        previewInvoice={checkout.previewInvoice}
        setPreviewInvoice={checkout.setPreviewInvoice}
        isConfirmingInvoice={checkout.isConfirmingInvoice}
        pendingCardInvoiceRef={checkout.pendingCardInvoice}
        thermalReceiptInvoice={checkout.thermalReceiptInvoice}
        setThermalReceiptInvoice={checkout.setThermalReceiptInvoice}
        printInvoice={checkout.printInvoice}
        printRef={checkout.printRef}
        invoices={state.invoices}
        handleCheckout={onCheckoutClick}
        handleDirectCashCheckout={onDirectCashCheckoutClick}
        handleConfirmInvoice={onConfirmInvoiceClick}
        handlePaymentConfirmed={onPaymentConfirmedClick}
        handlePrint={checkout.handlePrint}
        handleViewInvoice={checkout.handleViewInvoice}
        handleDeleteInvoice={checkout.handleDeleteInvoice}
        handleShowReceipt={checkout.handleShowReceipt}
        markInvoicePaid={markInvoicePaid}
        onHoldToast={(label) => toast({ title: 'Order held', description: `"${label}" saved.` })}
      />
    </div>
  );
}

export default function POSPage() {
  return (
    <LockProvider>
      <ProductProvider>
        <InventoryProvider>
          <CartProvider>
            <POSInner />
          </CartProvider>
        </InventoryProvider>
      </ProductProvider>
    </LockProvider>
  );
}
