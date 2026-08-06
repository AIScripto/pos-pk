import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Invoice } from '@/types/pos';
import { CartPanel } from '@/components/pos/CartPanel';
import { InvoicePreview } from '@/components/pos/InvoicePreview';
import { InvoiceHistory } from '@/components/pos/InvoiceHistory';
import { ReceiptPrintView } from '@/components/pos/ReceiptPrintView';
import { HeldOrdersDrawer } from '@/components/pos/HeldOrdersDrawer';
import { ActiveOrdersPanel } from '@/components/pos/ActiveOrdersPanel';
import { ProductManagementPanel } from '@/components/admin/ProductManagementPanel';
import { OpenTillDialog } from '@/components/till/OpenTillDialog';
import { CloseTillDialog } from '@/components/till/CloseTillDialog';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ThermalReceiptModal } from '@/components/pos/ThermalReceiptModal';
import { TillCloseoutModal } from '@/components/pos/TillCloseoutModal';

interface POSModalsContainerProps {
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  showInvoices: boolean;
  setShowInvoices: (show: boolean) => void;
  showHeld: boolean;
  setShowHeld: (show: boolean) => void;
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  showProducts: boolean;
  setShowProducts: (show: boolean) => void;
  showOpenTill: boolean;
  setShowOpenTill: (show: boolean) => void;
  showCloseTill: boolean;
  setShowCloseTill: (show: boolean) => void;
  showTillCloseout: boolean;
  setShowTillCloseout: (show: boolean) => void;
  showPaymentModal: boolean;
  setShowPaymentModal: (show: boolean) => void;
  previewInvoice: Invoice | null;
  setPreviewInvoice: (invoice: Invoice | null) => void;
  isConfirmingInvoice: boolean;
  pendingCardInvoiceRef: React.MutableRefObject<Invoice | null>;
  thermalReceiptInvoice: Invoice | null;
  setThermalReceiptInvoice: (invoice: Invoice | null) => void;
  printInvoice: Invoice | null;
  printRef: React.RefObject<HTMLDivElement>;
  invoices: Invoice[];
  handleCheckout: () => void;
  handleConfirmInvoice: (inv?: Invoice | null) => Promise<boolean>;
  handlePaymentConfirmed: (allocations: import('@/types/pos').PaymentAllocation[]) => Promise<void>;
  handlePrint: (invoice: Invoice) => void;
  handleViewInvoice: (invoice: Invoice) => void;
  handleDeleteInvoice: (id: string) => void;
  handleShowReceipt: (invoiceId: string) => void;
  markInvoicePaid: (id: string) => void;
  onHoldToast: (label: string) => void;
}

export function POSModalsContainer({
  showCart,
  setShowCart,
  showInvoices,
  setShowInvoices,
  showHeld,
  setShowHeld,
  showOrders,
  setShowOrders,
  showProducts,
  setShowProducts,
  showOpenTill,
  setShowOpenTill,
  showCloseTill,
  setShowCloseTill,
  showTillCloseout,
  setShowTillCloseout,
  showPaymentModal,
  setShowPaymentModal,
  previewInvoice,
  setPreviewInvoice,
  isConfirmingInvoice,
  pendingCardInvoiceRef,
  thermalReceiptInvoice,
  setThermalReceiptInvoice,
  printInvoice,
  printRef,
  invoices,
  handleCheckout,
  handleConfirmInvoice,
  handlePaymentConfirmed,
  handlePrint,
  handleViewInvoice,
  handleDeleteInvoice,
  handleShowReceipt,
  markInvoicePaid,
  onHoldToast,
}: POSModalsContainerProps) {
  return (
    <>
      {/* ── Mobile cart overlay ── */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm border-l border-border bg-card shadow-2xl animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
              <h2 className="font-display font-extrabold text-[18px] text-foreground">
                Your Order
              </h2>
              <button onClick={() => setShowCart(false)} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartPanel
                onCheckout={handleCheckout}
                onHold={(label) => {
                  onHoldToast(label);
                  setShowCart(false);
                  setShowHeld(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice History modal ── */}
      {showInvoices && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowInvoices(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-display font-extrabold text-[20px] text-foreground">
                  Invoice History
                </h2>
                <p className="text-xs text-muted-foreground">{invoices.length} invoices</p>
              </div>
              <button onClick={() => setShowInvoices(false)} className="rounded-lg p-1.5 hover:bg-secondary">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pos-scrollbar">
              <InvoiceHistory
                invoices={invoices}
                onViewInvoice={handleViewInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onPrintInvoice={handlePrint}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Held Orders Drawer ── */}
      {showHeld && <HeldOrdersDrawer onClose={() => setShowHeld(false)} />}

      {/* ── Active Orders Panel ── */}
      {showOrders && (
        <ActiveOrdersPanel
          onClose={() => setShowOrders(false)}
          onShowReceipt={handleShowReceipt}
          onPaymentReceived={(invoiceId) => markInvoicePaid(invoiceId)}
        />
      )}

      {/* ── Invoice Preview modal ── */}
      {previewInvoice && (
        <InvoicePreview
          invoice={previewInvoice}
          isConfirming={isConfirmingInvoice}
          onClose={() => setPreviewInvoice(null)}
          onPrint={async () => {
            if (!invoices.find(inv => inv.id === previewInvoice.id)) {
              const saved = await handleConfirmInvoice(previewInvoice);
              if (!saved) return;
            }
            handlePrint(previewInvoice);
          }}
          onConfirm={
            invoices.find(inv => inv.id === previewInvoice.id)
              ? undefined
              : () => { void handleConfirmInvoice(previewInvoice); }
          }
        />
      )}

      {/* ── Product Management Panel ── */}
      <ProductManagementPanel
        open={showProducts}
        onOpenChange={setShowProducts}
      />

      {/* ── Till Dialogs ── */}
      <OpenTillDialog  open={showOpenTill}  onOpenChange={setShowOpenTill} />
      <CloseTillDialog open={showCloseTill} onOpenChange={setShowCloseTill} invoices={invoices} />
      <TillCloseoutModal isOpen={showTillCloseout} onClose={() => setShowTillCloseout(false)} />

      {/* ── Thermal Receipt Modal ── */}
      <ThermalReceiptModal
        invoice={thermalReceiptInvoice}
        onClose={() => setThermalReceiptInvoice(null)}
      />

      {/* ── Card Payment Modal (Stripe) ── */}
      {showPaymentModal && pendingCardInvoiceRef.current && (
        <PaymentModal
          grandTotal={pendingCardInvoiceRef.current.grandTotal}
          onConfirm={handlePaymentConfirmed}
          onCancel={() => {
            setShowPaymentModal(false);
            pendingCardInvoiceRef.current = null;
          }}
        />
      )}

      {/* ── Hidden print view ── */}
      {printInvoice && createPortal(
        <div ref={printRef} className="print-receipt-wrapper">
          <ReceiptPrintView invoice={printInvoice} />
        </div>,
        document.body
      )}
    </>
  );
}
