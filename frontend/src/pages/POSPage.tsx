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
  const { t } = useTranslation();
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
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 no-print shrink-0">
              <div>
                <p className="font-display font-black text-[9px] uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                  {t.common.serviceBoard}
                </p>
                <h2 className="font-display font-black text-[18px] text-slate-900 dark:text-slate-100 leading-tight">
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
                      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
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
                      className="flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] h-11 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-700/90 bg-slate-200/80 dark:bg-slate-900/90 hover:bg-slate-300/80 dark:hover:bg-slate-800 hover:border-blue-500/80 dark:hover:border-blue-400/80 transition-all cursor-pointer shadow-sm dark:shadow-md hover:shadow-lg active:scale-[0.96] group shrink-0 relative"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-xs sm:text-[13px] text-blue-600 dark:text-blue-400 group-hover:text-blue-500 transition-colors">
                          {fk.key}
                        </span>
                        <Icon className="w-4 h-4 shrink-0 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform duration-150 group-hover:scale-110" />
                      </div>
                      <span className="font-display font-extrabold text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 tracking-tight leading-tight mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {fk.label}
                      </span>
                      {fk.badge !== null && fk.badge > 0 && (
                        <span className="absolute -top-1.5 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 text-white font-display font-black text-[10px] px-1 shadow-md border border-white dark:border-slate-900">
                          {fk.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="ml-3 sm:ml-4 pl-3 sm:pl-4 border-l border-slate-300 dark:border-slate-700/80 shrink-0">
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
                  toast({ title: `${product.name} added`, description: 'Item added to order' });
                }}
                onAddDeal={(deal) => {
                  addDeal(deal);
                  toast({ title: `${deal.name} added`, description: 'Deal added to order' });
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
          <div className="hidden lg:flex w-[22rem] xl:w-[24rem] shrink-0 flex-col bg-card overflow-hidden">
            <QuickActionButtons
              cartItemCount={cartItemCount}
              onNewOrder={() => {
                if (state.items.length > 0) {
                  clearCart();
                  toast({ title: 'New order started', description: 'Cart cleared for next customer.' });
                } else {
                  toast({ title: 'New order', description: 'Ready to add items to cart.' });
                }
              }}
              onDiscount={() => {
                if (state.items.length === 0) {
                  toast({ title: 'Cart empty', description: 'Add items to cart first before applying discount.', variant: 'destructive' });
                } else {
                  toast({ title: 'Discount (F2)', description: 'Expand cart item below to apply item or lump-sum discount.' });
                }
              }}
              onHold={() => {
                if (state.items.length === 0) {
                  toast({ title: 'Cart empty', description: 'Add items before parking order.', variant: 'destructive' });
                  return;
                }
                const held = holdOrder();
                if (held) {
                  toast({ title: 'Order parked', description: `Saved as ${held.label}` });
                }
              }}
            />

            <div className="flex-1 overflow-hidden flex flex-col">
              <CartPanel
                onCheckout={onCheckoutClick}
                onDirectCashCheckout={onDirectCashCheckoutClick}
                isConfirming={checkout.isConfirmingInvoice}
                onHold={(label) => {
                  toast({ title: 'Order held', description: `"${label}" saved.` });
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
