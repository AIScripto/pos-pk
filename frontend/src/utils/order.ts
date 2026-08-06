import { CartItem } from '@/types/pos';
import { Order, OrderItem, OrderSource, OrderSummary, OrderType, PaymentMethod, PaymentStatus } from '@/types/order';
import { calculateLinePricing, calculateCartTotals, calculateTax, generateId } from '@/utils/pos';

let tokenCounter = 1;

export const generateOrderToken = (): string => {
  const prefix = 'A';
  const num = String(tokenCounter++).padStart(3, '0');
  if (tokenCounter > 999) tokenCounter = 1;
  return `${prefix}${num}`;
};

export const cartItemsToOrderItems = (items: CartItem[]): OrderItem[] => {
  return items.map((item) => {
    const pricing = calculateLinePricing(item);
    const name = item.product?.name ?? item.deal?.name ?? 'Unknown';
    const code = item.product?.code ?? item.deal?.code ?? '';
    return {
      id: item.id,
      name,
      code,
      unitPrice: pricing.unitPrice,
      quantity: item.quantity,
      discountPercent: item.discountPercent,
      lumpSumDiscount: item.lumpSumDiscount,
      lineTotal: pricing.total,
      isDeal: !!item.deal,
    };
  });
};

export const buildOrderFromCart = ({
  items,
  orderType,
  paymentMethod,
  source,
  branchId,
  terminalId,
  customerId,
  customerName,
  customerPhone,
  deliveryAddress,
}: {
  items: CartItem[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  source: OrderSource;
  branchId: string;
  terminalId: string;
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress?: string | null;
}): Order => {
  const totals = calculateCartTotals(items);
  const tax = calculateTax(totals.grandTotal);
  const now = new Date();
  const isCod = paymentMethod === 'cash-on-delivery' || paymentMethod === 'card-on-delivery';
  const paymentStatus: PaymentStatus = isCod ? 'pending' : 'paid';

  return {
    id: generateId(),
    token: generateOrderToken(),
    branchId,
    terminalId,
    source,
    orderType,
    paymentMethod,
    paymentStatus,
    status: 'new',
    items: cartItemsToOrderItems(items),
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    preTaxTotal: totals.grandTotal,
    taxRate: tax.taxRate,
    taxAmount: tax.taxAmount,
    grandTotal: tax.grandTotal,
    customerId,
    customerName,
    customerPhone,
    deliveryAddress: deliveryAddress ?? null,
    invoiceId: null,
    synced: false,
    createdAt: now,
    confirmedAt: null,
    preparingAt: null,
    readyAt: null,
    collectedAt: null,
    dispatchedAt: null,
    deliveredAt: null,
    closedAt: null,
    voidedAt: null,
  };
};

export const isCodOrder = (order: Order): boolean =>
  order.paymentMethod === 'cash-on-delivery' ||
  order.paymentMethod === 'card-on-delivery';

export const toOrderSummary = (order: Order): OrderSummary => {
  const itemNames = order.items
    .slice(0, 3).map((i) => i.name).join(', ')
    + (order.items.length > 3 ? ` +${order.items.length - 3}` : '');
  return {
    id: order.id,
    token: order.token,
    status: order.status,
    orderType: order.orderType,
    source: order.source,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
    itemNames,
    grandTotal: order.grandTotal,
    customerName: order.customerName,
    createdAt: order.createdAt,
    readyAt: order.readyAt,
    elapsedSeconds: Math.floor((Date.now() - order.createdAt.getTime()) / 1000),
  };
};

export const formatElapsedTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  new: 'New', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready', collected: 'Collected', dispatched: 'Dispatched',
  delivered: 'Delivered', closed: 'Closed', voided: 'Voided',
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  new: 'text-slate-700 dark:text-slate-300',
  confirmed: 'text-blue-700 dark:text-blue-400',
  preparing: 'text-amber-700 dark:text-amber-400',
  ready: 'text-emerald-700 dark:text-emerald-400',
  collected: 'text-teal-700 dark:text-teal-400',
  dispatched: 'text-purple-700 dark:text-purple-400',
  delivered: 'text-emerald-700 dark:text-emerald-400',
  closed: 'text-slate-700 dark:text-slate-400',
  voided: 'text-rose-700 dark:text-rose-400',
};

export const ORDER_TYPE_LABEL: Record<string, string> = {
  'dine-in': 'Dine-in', 'takeaway': 'Takeaway', 'delivery': 'Delivery',
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  'cash': 'Cash', 'card': 'Card',
  'cash-on-delivery': 'Cash on Delivery', 'card-on-delivery': 'Card on Delivery',
};

export const PAYMENT_METHOD_SHORT: Record<string, string> = {
  'cash': 'Cash', 'card': 'Card',
  'cash-on-delivery': 'COD (Cash)', 'card-on-delivery': 'COD (Card)',
};

export const hydrateOrder = (raw: Order): Order => ({
  ...raw,
  paymentMethod:   raw.paymentMethod  ?? 'cash',
  paymentStatus:   raw.paymentStatus  ?? 'paid',
  deliveryAddress: raw.deliveryAddress ?? null,
  createdAt:    new Date(raw.createdAt),
  confirmedAt:  raw.confirmedAt  ? new Date(raw.confirmedAt)  : null,
  preparingAt:  raw.preparingAt  ? new Date(raw.preparingAt)  : null,
  readyAt:      raw.readyAt      ? new Date(raw.readyAt)      : null,
  collectedAt:  raw.collectedAt  ? new Date(raw.collectedAt)  : null,
  dispatchedAt: raw.dispatchedAt ? new Date(raw.dispatchedAt) : null,
  deliveredAt:  raw.deliveredAt  ? new Date(raw.deliveredAt)  : null,
  closedAt:     raw.closedAt     ? new Date(raw.closedAt)     : null,
  voidedAt:     raw.voidedAt     ? new Date(raw.voidedAt)     : null,
});
