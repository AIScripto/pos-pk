import { Invoice } from '@/types/pos';
import { formatCurrency, formatReceiptDate, calculateLineTotal } from '@/utils/pos';
import { TAX_CONFIG } from '@/config/tax';
import { useAppConfig } from '@/context/AppConfigContext';

interface ReceiptPrintViewProps {
  invoice: Invoice;
}

export function ReceiptPrintView({ invoice }: ReceiptPrintViewProps) {
  const { orgConfig } = useAppConfig();
  const branch = orgConfig?.defaultBranch;
  const businessName = orgConfig?.businessName || 'Crisp&Crumbs Restaurant';
  const businessPhone = orgConfig?.businessPhone || branch?.phone;
  const address = branch
    ? [branch.addrLine1, branch.addrArea, branch.addrCity].filter(Boolean).join(', ')
    : '';

  const totalPaid = invoice.paymentAllocations?.reduce((acc, alloc) => acc + alloc.amount, 0) || 0;
  const isPaid = totalPaid >= invoice.grandTotal || invoice.paymentStatus === 'paid';

  return (
    <div className="print-receipt bg-white text-black font-sans leading-tight" style={{ width: '80mm', margin: '0 auto', fontSize: '13px' }}>
      
      {/* Header */}
      <div className="text-center font-bold text-base uppercase mb-1">{businessName}</div>
      {address && <div className="text-center text-xs mb-1 whitespace-pre-wrap">{address}</div>}
      {businessPhone && <div className="text-center text-xs mb-1">Call: {businessPhone}</div>}
      <div className="text-center text-xs mb-1">Hello</div>

      <div className="border-b border-dashed border-gray-400 my-2" />

      <div className="flex justify-between text-xs font-bold uppercase mb-1">
        <span>TOKEN NO - {invoice.id.slice(-3)}</span>
        <span>INVOICE NO - {invoice.id.slice(0, 4)}</span>
      </div>
      <div className="text-center text-xs my-1 capitalize">Takeaway-Takeaway</div>
      <div className="text-center text-xs font-bold mb-2">Customer Copy</div>

      <div className="border-b border-dashed border-gray-400 my-2" />

      {/* Info */}
      <div className="text-xs space-y-1 mb-2">
        <div>Ref No : {invoice.id}</div>
        <div>Date: {formatReceiptDate(invoice.date)}</div>
      </div>

      <div className="font-bold text-lg mb-2 uppercase">
        {isPaid ? 'PAID' : 'Un PAID'}
      </div>

      {/* Items */}
      <div className="flex justify-between text-xs border-b border-gray-400 pb-1 mb-1 font-bold">
        <span>Qty Item</span>
        <span>T.Price</span>
      </div>

      <div className="mb-2">
        {invoice.items.map((item) => {
          const name = item.product?.name || item.deal?.name || '';
          const price = item.product?.price || item.deal?.price || 0;
          const lineTotal = calculateLineTotal(
            price,
            item.quantity,
            item.discountPercent,
            item.lumpSumDiscount
          );

          return (
            <div key={item.id} className="text-xs mb-1.5 flex justify-between items-start">
              <div className="flex gap-2">
                <span className="w-3 text-right">{item.quantity}</span>
                <span className="flex-1">{name}</span>
              </div>
              <span className="text-right pl-2">{formatCurrency(lineTotal)}</span>
            </div>
          );
        })}
      </div>

      <div className="border-b border-dashed border-gray-400 my-2" />

      {/* Totals */}
      <div className="text-xs space-y-1.5">
        <div className="flex justify-between">
          <span>Total</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        
        {invoice.totalDiscount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(invoice.totalDiscount)}</span>
          </div>
        )}
        
        {TAX_CONFIG.enabled && invoice.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>Tax ({invoice.taxRate}%)</span>
            <span>+{formatCurrency(invoice.taxAmount)}</span>
          </div>
        )}
        
        <div className="border-b border-dashed border-gray-400 my-1" />
        
        <div className="flex justify-between text-sm font-bold mt-1">
          <span>Grand Total</span>
          <span>{formatCurrency(invoice.grandTotal)}</span>
        </div>
        
        <div className="flex justify-between mt-1">
          <span>Paid Amount</span>
          <span>{formatCurrency(totalPaid)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Return Amount</span>
          <span>{formatCurrency(Math.max(0, totalPaid - invoice.grandTotal))}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-400 my-3" />

      {/* Footer */}
      <div className="text-center text-xs space-y-1 mb-4">
        <p>Thanks</p>
        <p>Bill Prepared By: Cashier</p>
        <p>Powered By AIPOS</p>
        <p>Print Time: {formatReceiptDate(new Date())}</p>
      </div>
    </div>
  );
}
