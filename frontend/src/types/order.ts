/**
 * Order Types — QSR state machine
 *
 * An Order is the lifecycle record of a customer transaction.
 * It is created when a cashier (or kiosk) confirms a cart, and travels
 * through states until it is closed and synced to HQ.
 *
 * Relationship to Invoice:
 *   Invoice  = financial snapshot (amounts, tax, customer) — created at checkout
 *   Order    = operational record (status, kitchen, collection) — wraps the invoice
 *
 * Payment model:
 *   prepaid (cash/card at counter) → Invoice created at checkout, receipt on collection
 *   cash-on-delivery / card-on-delivery → Invoice created only after rider confirms delivery
 */

// ---------------------------------------------------------------------------
// Order status — the state machine transitions
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'new'          // Cart submitted, not yet paid
  | 'confirmed'    // Payment taken (or COD accepted) — sent to kitchen
  | 'preparing'    // Kitchen is working on it
  | 'ready'        // Kitchen bumped it — ready for collection / dispatch
  | 'collected'    // Customer picked it up (dine-in / takeaway)
  | 'dispatched'   // Rider has left with the order (delivery only)
  | 'delivered'    // Customer received it — triggers COD invoice creation
  | 'closed'       // Invoice saved, order complete
  | 'voided';      // Cancelled before completion

// ---------------------------------------------------------------------------
// Order source — which channel created this order
// ---------------------------------------------------------------------------

export type OrderSource =
  | 'counter'       // Cashier created it at the counter POS
  | 'kiosk'         // Customer created it at the self-order kiosk
  | 'staff-tablet'; // Waiter created it on a tablet

// ---------------------------------------------------------------------------
// Order type — where the customer will eat
// ---------------------------------------------------------------------------

export type OrderType =
  | 'dine-in'
  | 'takeaway'
  | 'delivery';

// ---------------------------------------------------------------------------
// Payment method — how the customer pays
// ---------------------------------------------------------------------------

export type PaymentMethod =
  | 'cash'               // Cash paid at counter now
  | 'card'               // Card paid at counter now
  | 'cash-on-delivery'   // Rider collects cash from customer
  | 'card-on-delivery';  // Rider has a card machine

// ---------------------------------------------------------------------------
// Payment status
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | 'paid'     // Payment confirmed
  | 'pending'; // Awaiting COD collection

// ---------------------------------------------------------------------------
// Core Order interface
// ---------------------------------------------------------------------------

export interface Order {
  /** Unique order ID — also used as the display token number (e.g. "A047") */
  id: string;

  /** Short human-readable token shown on KDS and status board (e.g. "A047") */
  token: string;

  /** Branch this order belongs to */
  branchId: string;

  /** Which terminal or device created this order */
  terminalId: string;

  /** Which channel created this order */
  source: OrderSource;

  /** Dine-in, takeaway, or delivery */
  orderType: OrderType;

  /** How the customer pays */
  paymentMethod: PaymentMethod;

  /** Whether payment has been received */
  paymentStatus: PaymentStatus;

  /** Current state in the lifecycle */
  status: OrderStatus;

  /** Snapshot of cart items at order creation time */
  items: OrderItem[];

  /** Financial totals — stamped at creation */
  subtotal: number;
  totalDiscount: number;
  preTaxTotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;

  /** Customer info if provided */
  customerId: string | null;
  customerName: string | null;
  customerPhone: string | null;

  /** Delivery address (delivery orders only) */
  deliveryAddress: string | null;

  /** ID of the Invoice created when this order was closed */
  invoiceId: string | null;

  /** Whether this order has been synced to HQ */
  synced: boolean;

  // ── Timestamps ──────────────────────────────────────────────────────────
  createdAt: Date;
  confirmedAt: Date | null;
  preparingAt: Date | null;
  readyAt: Date | null;
  collectedAt: Date | null;
  dispatchedAt: Date | null;
  deliveredAt: Date | null;
  closedAt: Date | null;
  voidedAt: Date | null;
}

// ---------------------------------------------------------------------------
// OrderItem — line item within an order (simpler than CartItem)
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: string;
  name: string;
  code: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  lumpSumDiscount: number;
  lineTotal: number;
  isDeal: boolean;
}

// ---------------------------------------------------------------------------
// OrderSummary — lightweight version for lists / KDS / status board
// ---------------------------------------------------------------------------

export interface OrderSummary {
  id: string;
  token: string;
  status: OrderStatus;
  orderType: OrderType;
  source: OrderSource;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemCount: number;
  itemNames: string;   // "Burger, Fries, Coke"
  grandTotal: number;
  customerName: string | null;
  createdAt: Date;
  readyAt: Date | null;
  /** Elapsed time in seconds since createdAt */
  elapsedSeconds: number;
}

// ---------------------------------------------------------------------------
// OrderState — what OrderContext holds
// ---------------------------------------------------------------------------

export interface OrderState {
  /** All active orders (not yet closed or voided) — shown on KDS + status board */
  activeOrders: Order[];
  /** Recently closed orders — last 50, for the order history view */
  recentOrders: Order[];
}

// ---------------------------------------------------------------------------
// OrderAction — every possible state transition
// ---------------------------------------------------------------------------

export type OrderAction =
  | { type: 'CREATE_ORDER';    payload: Order }
  | { type: 'CONFIRM_ORDER';   payload: string }   // orderId
  | { type: 'START_PREPARING'; payload: string }   // orderId
  | { type: 'MARK_READY';      payload: string }   // orderId
  | { type: 'MARK_COLLECTED';  payload: string }   // orderId — dine-in/takeaway
  | { type: 'MARK_DISPATCHED'; payload: string }   // orderId — delivery
  | { type: 'MARK_DELIVERED';  payload: string }   // orderId — delivery COD confirmed
  | { type: 'CLOSE_ORDER';     payload: { orderId: string; invoiceId: string } }
  | { type: 'VOID_ORDER';           payload: string }   // orderId
  | { type: 'MARK_SYNCED';          payload: string }   // orderId
  | { type: 'CLEAR_SESSION_ORDERS' };                   // new till session opened
