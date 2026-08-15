import { Invoice } from '@/types/pos';
import { formatCurrency } from '@/utils/pos';
import { Printer, X, CheckCircle2, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { getLocalizedItemName } from '@/i18n/catalog';

interface ThermalReceiptModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function ThermalReceiptModal({ invoice, onClose }: ThermalReceiptModalProps) {
  const { t, language } = useTranslation();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!invoice) return;
    const handleAfterPrint = () => {
      onClose();
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(invoice.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const invoiceDate = new Date(invoice.date || Date.now()).toLocaleString(language === 'ur' ? 'ur-PK' : language === 'ar' ? 'ar-SA' : 'en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs animate-fade-in print:hidden"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:z-auto">
        <div className="relative flex flex-col max-h-[90vh] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden print:max-h-none print:w-full print:max-w-none print:border-none print:shadow-none print:bg-white">

          {/* Action Header (Hidden in Print) */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950 print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {t.receipt.receiptPreview}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Thermal Paper View (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950/80 pos-scrollbar print:p-0 print:bg-white print:overflow-visible">
            <div className="mx-auto w-[280px] rounded-lg border border-slate-300 dark:border-slate-800 bg-white p-4 font-mono text-xs text-slate-900 shadow-md print:w-full print:border-none print:p-2 print:shadow-none">
              {/* Header Logo / Branch */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h2 className="font-black text-base uppercase tracking-wider text-slate-950">{t.common.appName}</h2>
                <p className="text-[10px] text-slate-600">{t.common.subTitle}</p>
                <p className="text-[10px] text-slate-500 mt-1">{t.receipt.branch}</p>
              </div>

              {/* Order Token & Meta */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Token #:</span>
                  <span className="font-black text-sm text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    A{invoice.id.slice(-3).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.receipt.invoiceNumber}:</span>
                  <span className="font-bold text-slate-900">{invoice.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.receipt.date}:</span>
                  <span className="text-slate-900">{invoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.receipt.paymentMode}:</span>
                  <span className="font-bold uppercase text-slate-900">{invoice.paymentMethod || t.pos.cash}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-2.5 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase pb-1 border-b border-slate-200">
                  <span>{t.receipt.itemDescription}</span>
                  <span className="text-right">{t.receipt.qty} × {t.receipt.rate}</span>
                  <span className="text-right">{t.receipt.amount}</span>
                </div>
                <div className="space-y-1.5 pt-1.5 text-[10px]">
                  {invoice.items.map((item, index) => {
                    const itemName = getLocalizedItemName(item.product || item.deal, language) || 'Item';
                    const unitPrice = item.product?.price ?? item.deal?.price ?? 0;
                    return (
                      <div key={index} className="flex justify-between items-start leading-tight">
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-slate-900">{itemName}</span>
                        </div>
                        <div className="text-right text-slate-600 shrink-0 mr-2">
                          {item.quantity} × {formatCurrency(unitPrice)}
                        </div>
                        <div className="text-right font-bold text-slate-900 shrink-0">
                          {formatCurrency(unitPrice * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.receipt.subtotal}:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{t.receipt.discount}:</span>
                    <span className="font-semibold">-{formatCurrency(invoice.totalDiscount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.receipt.gstTax}:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs pt-1 border-t border-slate-200 font-black text-slate-950">
                  <span>{t.receipt.grandTotal}:</span>
                  <span>{formatCurrency(invoice.grandTotal)}</span>
                </div>
              </div>

              {/* Footer Thank You */}
              <div className="text-center pt-3 text-[9px] text-slate-500 space-y-1">
                <p className="font-bold text-slate-800">{t.receipt.thankYou}</p>
                <div className="pt-2 flex justify-center">
                  <div className="font-mono text-[8px] tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
                    *** {t.receipt.softwareBy} ***
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls (Hidden in Print) */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-950 print:hidden">
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
              >
                {t.common.close}
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-extrabold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{t.receipt.print}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

