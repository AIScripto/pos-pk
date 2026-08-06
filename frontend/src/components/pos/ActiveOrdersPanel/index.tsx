import { useOrders } from '@/context/OrderContext';
import { Order, OrderStatus } from '@/types/order';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  ORDER_TYPE_LABEL,
  PAYMENT_METHOD_SHORT,
  isCodOrder,
  formatElapsedTime,
  toOrderSummary,
} from '@/utils/order';
import { formatCurrency } from '@/utils/pos';
import { useEffect, useState } from 'react';
import { CheckCircle2, ChefHat, Clock, Package, Trash2, X, Truck, BadgeDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActiveOrdersPanelProps {
  onClose: () => void;
  onShowReceipt: (invoiceId: string) => void;
  onPaymentReceived: (invoiceId: string) => void;
}

const STATUS_ICON: Record<OrderStatus, typeof ChefHat> = {
  new:        Clock,
  confirmed:  Clock,
  preparing:  ChefHat,
  ready:      CheckCircle2,
  collected:  Package,
  dispatched: Truck,
  delivered:  BadgeDollarSign,
  closed:     Package,
  voided:     X,
};

const STATUS_BG: Record<string, string> = {
  new:        'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-sm',
  confirmed:  'border-blue-300 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
  preparing:  'border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
  ready:      'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
  collected:  'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 shadow-sm',
  dispatched: 'border-purple-300 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
  delivered:  'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
  closed:     'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 shadow-sm',
  voided:     'border-rose-300 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-slate-900 dark:text-slate-100 shadow-sm',
};

function OrderCard({
  order,
  onShowReceipt,
  onPaymentReceived,
}: {
  order: Order;
  onShowReceipt: (invoiceId: string) => void;
  onPaymentReceived: (invoiceId: string) => void;
}) {
  const { markReady, markCollected, markDispatched, markDelivered, closeOrder, voidOrder } = useOrders();
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - order.createdAt.getTime()) / 1000)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - order.createdAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const summary    = toOrderSummary(order);
  const StatusIcon = STATUS_ICON[order.status] ?? Clock;
  const isWarning  = order.status === 'preparing' && elapsed > 300;
  const isCod      = isCodOrder(order);
  const isDelivery = order.orderType === 'delivery';

  return (
    <div className={cn(
      'rounded-2xl border p-4 transition-all',
      STATUS_BG[order.status] ?? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900',
      isWarning && 'border-rose-400 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 ring-1 ring-rose-400/40'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl font-black shrink-0 shadow-sm',
            order.status === 'ready'     ? 'bg-emerald-600 text-white'
            : order.status === 'preparing' ? 'bg-amber-500 text-slate-950'
            : order.status === 'dispatched' ? 'bg-purple-600 text-white'
            : 'bg-slate-800 text-white'
          )}
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: '18px' }}
          >
            {order.token}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <StatusIcon className={cn('w-4 h-4 shrink-0', ORDER_STATUS_COLOR[order.status])} />
              <span className={cn('text-xs font-black uppercase tracking-wider', ORDER_STATUS_COLOR[order.status])}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                {ORDER_TYPE_LABEL[order.orderType]}
              </span>
              <span className="text-slate-400">·</span>
              {/* Payment method badge */}
              <span className={cn(
                'text-[10px] uppercase tracking-wide rounded-md px-2 py-0.5 font-black border',
                isCod
                  ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-300'
                  : 'bg-slate-200/80 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              )}
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                {PAYMENT_METHOD_SHORT[order.paymentMethod] ?? order.paymentMethod}
              </span>
              <span className="text-slate-400">·</span>
              <span className={cn(
                'text-[11px] tabular-nums font-extrabold px-2 py-0.5 rounded-full border',
                isWarning
                  ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-slate-200/60 dark:bg-slate-800 border-slate-300/80 dark:border-slate-700 text-slate-800 dark:text-slate-200'
              )}>
                {formatElapsedTime(elapsed)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-black text-slate-950 dark:text-white tabular-nums"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
            {formatCurrency(order.grandTotal)}
          </span>
          {isCod && (
            <p className="text-[10px] text-purple-700 dark:text-purple-400 font-extrabold mt-0.5 uppercase tracking-wide"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}>
              Unpaid
            </p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3.5">
        {order.items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs">
            <span className="text-slate-900 dark:text-slate-100 font-bold truncate flex-1">
              {item.isDeal && <span className="text-amber-500 mr-1 font-extrabold">★</span>}
              {item.quantity}× {item.name}
            </span>
            <span className="text-slate-800 dark:text-slate-200 font-extrabold tabular-nums ml-2 shrink-0">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
        ))}
        {order.items.length > 4 && (
          <p className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400">
            +{order.items.length - 4} more items
          </p>
        )}
      </div>

      {/* Customer */}
      {order.customerName && (
        <div className="text-xs text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1 font-semibold">
          <span className="opacity-75">Customer:</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{order.customerName}</span>
          {order.customerPhone && (
            <span className="opacity-75">· {order.customerPhone}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">

        {/* Kitchen: Mark Ready (all order types) */}
        {order.status === 'preparing' && (
          <button
            onClick={() => markReady(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 text-xs font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            Mark Ready
          </button>
        )}

        {/* Ready — dine-in / takeaway: Collected */}
        {order.status === 'ready' && !isDelivery && (
          <button
            onClick={() => {
              markCollected(order.id);
              setTimeout(() => {
                closeOrder(order.id, order.invoiceId ?? '');
                if (order.invoiceId) onShowReceipt(order.invoiceId);
              }, 300);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 py-2.5 text-xs font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            <Package className="w-4 h-4 text-white" />
            Collected
          </button>
        )}

        {/* Ready — delivery: Dispatch Rider */}
        {order.status === 'ready' && isDelivery && (
          <button
            onClick={() => markDispatched(order.id)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-2.5 text-xs font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            <Truck className="w-4 h-4 text-white" />
            Dispatch Rider
          </button>
        )}

        {/* Dispatched — prepaid: just close */}
        {order.status === 'dispatched' && !isCod && (
          <button
            onClick={() => {
              closeOrder(order.id, order.invoiceId ?? '');
              if (order.invoiceId) onShowReceipt(order.invoiceId);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 py-2.5 text-xs font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            Mark Delivered
          </button>
        )}

        {/* Dispatched — COD: confirm cash received → marks invoice paid */}
        {order.status === 'dispatched' && isCod && (
          <button
            onClick={() => {
              if (order.invoiceId) onPaymentReceived(order.invoiceId);
              markDelivered(order.id);
              setTimeout(() => {
                closeOrder(order.id, order.invoiceId ?? '');
                if (order.invoiceId) onShowReceipt(order.invoiceId);
              }, 300);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 py-2.5 text-xs font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            <BadgeDollarSign className="w-4 h-4 text-white" />
            Cash Received
          </button>
        )}

        {/* Void button — available before dispatch */}
        {['new', 'confirmed', 'preparing', 'ready'].includes(order.status) && (
          <button
            onClick={() => voidOrder(order.id)}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 hover:text-rose-600 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

      </div>
    </div>
  );
}

export function ActiveOrdersPanel({ onClose, onShowReceipt, onPaymentReceived }: ActiveOrdersPanelProps) {
  const { getActiveOrders, state } = useOrders();
  const activeOrders = getActiveOrders();

  // Refresh elapsed timers every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const preparing   = activeOrders.filter((o) => o.status === 'preparing');
  const ready       = activeOrders.filter((o) => o.status === 'ready');
  const dispatched  = activeOrders.filter((o) => o.status === 'dispatched');
  const other       = activeOrders.filter((o) => !['preparing', 'ready', 'dispatched'].includes(o.status));

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg border-l border-border bg-card shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '20px' }}>
                Active Orders
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeOrders.length} order{activeOrders.length !== 1 ? 's' : ''} in progress
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
        <div className="flex-1 overflow-y-auto p-4 pos-scrollbar space-y-4">
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <ChefHat className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-700 text-foreground"
                style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>
                No active orders
              </p>
              <p className="text-sm text-muted-foreground max-w-[200px]">
                Orders will appear here once a cashier confirms checkout
              </p>
            </div>
          ) : (
            <>
              {ready.length > 0 && (
                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-400 mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                    Ready for collection ({ready.length})
                  </p>
                  <div className="space-y-3">
                    {ready.map((o) => <OrderCard key={o.id} order={o} onShowReceipt={onShowReceipt} onPaymentReceived={onPaymentReceived} />)}
                  </div>
                </section>
              )}

              {dispatched.length > 0 && (
                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-800 dark:text-purple-400 mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                    Out for delivery ({dispatched.length})
                  </p>
                  <div className="space-y-3">
                    {dispatched.map((o) => <OrderCard key={o.id} order={o} onShowReceipt={onShowReceipt} onPaymentReceived={onPaymentReceived} />)}
                  </div>
                </section>
              )}

              {preparing.length > 0 && (
                <section>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-800 dark:text-amber-400 mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}>
                    Preparing ({preparing.length})
                  </p>
                  <div className="space-y-3">
                    {preparing.map((o) => <OrderCard key={o.id} order={o} onShowReceipt={onShowReceipt} onPaymentReceived={onPaymentReceived} />)}
                  </div>
                </section>
              )}

              {other.length > 0 && (
                <section>
                  <p className="text-[10px] font-700 uppercase tracking-[0.18em] text-muted-foreground mb-2"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
                    Queued ({other.length})
                  </p>
                  <div className="space-y-3">
                    {other.map((o) => <OrderCard key={o.id} order={o} onShowReceipt={onShowReceipt} onPaymentReceived={onPaymentReceived} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-secondary/30 px-5 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{preparing.length} preparing · {ready.length} ready · {dispatched.length} out for delivery</span>
            <span className="opacity-60">Auto-refreshes every second</span>
          </div>
        </div>
      </div>
    </>
  );
}
