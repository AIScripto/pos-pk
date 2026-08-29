import { Invoice } from '@/types/pos';
import { formatCurrency, formatDate, calculateLineTotal } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { useAppConfig } from '@/context/AppConfigContext';
import { X, Printer, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface InvoicePreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onPrint: () => void;
  /** Called when cashier taps "Confirm & Send to Kitchen" */
  onConfirm?: () => void;
  isConfirming?: boolean;
}

export function InvoicePreview({ invoice, onClose, onPrint, onConfirm, isConfirming = false }: InvoicePreviewProps) {
  const { t } = useTranslation();
  const { orgConfig } = useAppConfig();
  const branch = orgConfig?.defaultBranch;
  const businessName = orgConfig?.businessName || 'Crisp&Crumbs Restaurant';
  const businessPhone = orgConfig?.businessPhone || branch?.phone;
  const address = branch
    ? [branch.addrLine1, branch.addrArea, branch.addrCity].filter(Boolean).join(', ')
    : '';
  const receiptFooter = orgConfig?.receiptFooter || 'Thank you for your order!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-bold text-lg text-card-foreground">Invoice Preview</h2>
            <p className="text-sm text-muted-foreground">{invoice.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-4 pos-scrollbar">
          {/* Store Info */}
          <div className="text-center mb-6">
            <h3 className="font-bold text-xl text-card-foreground">{businessName}</h3>
            {address && <p className="text-sm text-muted-foreground">{address}</p>}
            {businessPhone && <p className="text-sm text-muted-foreground">Tel: {businessPhone}</p>}
          </div>

          {/* Invoice Details */}
          <div className="flex justify-between text-sm mb-4 pb-4 border-b border-dashed border-border">
            <div>
              <p className="text-muted-foreground">Invoice #</p>
              <p className="font-mono font-medium text-card-foreground">{invoice.id}</p>
              {/* Payment status badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide border ${
                  invoice.paymentStatus === 'pending'
                    ? 'bg-special/10 border-special/30 text-special'
                    : 'bg-success/10 border-success/30 text-success'
                }`}>
                  {invoice.paymentStatus === 'pending' ? 'Payment Pending' : 'Paid'}
                </span>
                <span className="text-2xs text-muted-foreground uppercase tracking-wide">
                  {invoice.paymentMethod === 'cash' ? 'Cash'
                    : invoice.paymentMethod === 'card' ? 'Card'
                    : invoice.paymentMethod === 'cash-on-delivery' ? 'COD — Cash'
                    : invoice.paymentMethod === 'card-on-delivery' ? 'COD — Card'
                    : invoice.paymentMethod ?? 'Cash'}
                </span>
              </div>
              {invoice.paymentStatus === 'paid' && invoice.paidAt && invoice.paymentMethod?.includes('on-delivery') && (
                <p className="mt-1 text-2xs text-muted-foreground">
                  Paid: {formatDate(invoice.paidAt)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-medium text-card-foreground">{formatDate(invoice.date)}</p>
            </div>
          </div>

          {invoice.customer && (
            <div className="mb-4 rounded-2xl border border-border/70 bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
                  <p className="mt-1 font-semibold text-card-foreground">{invoice.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Loyalty</p>
                  <p className="mt-1 font-semibold text-primary">+{invoice.customer.loyaltyPointsEarned} pts</p>
                  <p className="text-xs text-muted-foreground">
                    Balance {invoice.customer.loyaltyPointsAfterOrder}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {invoice.items.map((item) => {
              const name = item.product?.name || item.deal?.name || '';
              const code = item.product?.code || item.deal?.code || '';
              const price = item.product?.price || item.deal?.price || 0;
              const lineTotal = calculateLineTotal(
                price,
                item.quantity,
                item.discountPercent,
                item.lumpSumDiscount
              );
              const isDeal = !!item.deal;
              const hasDiscount = item.discountPercent > 0 || item.lumpSumDiscount > 0;

              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 text-sm py-2 border-b border-border/50">
                  <div className="col-span-5">
                    <div className="flex items-center gap-1">
                      {isDeal && <Sparkles className="w-3 h-3 text-accent shrink-0" />}
                      <span className="font-medium text-card-foreground truncate">{name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{code}</p>
                    {hasDiscount && (
                      <p className="text-xs text-accent">
                        {item.discountPercent > 0 && `${item.discountPercent}% off`}
                        {item.discountPercent > 0 && item.lumpSumDiscount > 0 && ' + '}
                        {item.lumpSumDiscount > 0 && `${formatCurrency(item.lumpSumDiscount)} off`}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-mono text-card-foreground">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right font-mono text-muted-foreground">
                    {formatCurrency(price)}
                  </div>
                  <div className="col-span-3 text-right font-mono font-semibold text-card-foreground">
                    {formatCurrency(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-dashed border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono text-card-foreground">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-accent">Total Discount</span>
                <span className="font-mono text-accent">-{formatCurrency(invoice.totalDiscount)}</span>
              </div>
            )}
            {TAX_CONFIG.enabled && invoice.taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pre-Tax Total</span>
                  <span className="font-mono text-card-foreground">{formatCurrency(invoice.preTaxTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {TAX_CONFIG.label}
                    <span className="ml-1 text-xs opacity-60">({invoice.taxRate}%)</span>
                  </span>
                  <span className="font-mono text-muted-foreground">+{formatCurrency(invoice.taxAmount)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-card-foreground">Grand Total</span>
              <span className="font-mono text-primary">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-dashed border-border">
            <p className="text-sm text-muted-foreground">{receiptFooter}</p>
            <p className="text-xs text-muted-foreground mt-1">{businessName}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="pos-btn-secondary px-4"
          >
            {t.common.close}
          </button>
          <button
            onClick={onPrint}
            disabled={isConfirming}
            className="flex-1 pos-btn-secondary"
          >
            <Printer className="w-4 h-4" />
            {t.receipt.print}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className="pos-btn-success flex-1 text-base"
            >
              {isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
              {isConfirming ? t.pos.processingOrder : t.pos.sendToKitchen}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
