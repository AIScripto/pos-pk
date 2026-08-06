// Product and Cart Types for POS System

export type Category = string;

export interface Product {
  id: string;
  name: string;
  code: string; // SKU
  /** Actual selling price (the "Now" price shown to the customer). */
  price: number;
  /**
   * Original / undiscounted price (the "Was" price).
   * Only present when a product-level discount has been applied.
   */
  originalPrice?: number;
  category: Category;
  image: string;
  description?: string;
}

export interface Deal {
  id: string;
  name: string;
  code: string;
  price: number;
  originalPrice: number; // Sum of individual items
  products: Product[];
  image: string;
  description?: string;
  categoryId?: string | null;
  category?: string;
  availabilityType?: 'all_time' | 'scheduled';
  availableDays?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface CartItem {
  id: string; // Unique cart item ID
  product?: Product;
  deal?: Deal;
  quantity: number;
  discountPercent: number; // Line item discount percentage
  lumpSumDiscount: number; // Fixed amount discount
}

export interface CustomerFavoriteItem {
  itemKey: string;
  name: string;
  quantity: number;
}

export interface CustomerOrderRecord {
  invoiceId: string;
  date: Date;
  grandTotal: number;
  itemCount: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  favoriteItems: CustomerFavoriteItem[];
  orderHistory: CustomerOrderRecord[];
  createdAt: Date;
  updatedAt: Date;
  lastOrderAt: Date | null;
}

export interface ActiveCustomer {
  customerId: string | null;
  name: string;
  phone: string;
}

export interface InvoiceCustomerSnapshot {
  customerId: string | null;
  name: string;
  phone: string;
  loyaltyPointsBeforeOrder: number;
  loyaltyPointsEarned: number;
  loyaltyPointsAfterOrder: number;
}

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'cash-on-delivery'
  | 'card-on-delivery';

export type PaymentStatus = 'paid' | 'pending' | 'voided';

export interface PaymentAllocation {
  method: PaymentMethod;
  amount: number;
}

export interface Invoice {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  /** Pre-tax total (subtotal minus discounts). */
  preTaxTotal: number;
  /** Tax rate percentage that was active when this invoice was generated (e.g. 21). */
  taxRate: number;
  /** Computed tax amount in currency units. */
  taxAmount: number;
  /** Final amount the customer pays (preTaxTotal + taxAmount). */
  grandTotal: number;
  customer: InvoiceCustomerSnapshot | null;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAt?: Date | null;
  /** Breakdown of how the invoice was paid. Optional for backwards compatibility. */
  paymentAllocations?: PaymentAllocation[];
  terminalId?: string;
}

/**
 * A held order — the live cart frozen in time so a cashier can start a new order
 * and come back to resume this one later.
 */
export interface HeldOrder {
  /** Unique ID for the held slot. */
  id: string;
  /** Timestamp when the order was put on hold. */
  heldAt: Date;
  /**
   * Short human-readable label for the slot, e.g. "Table 4" or an
   * auto-generated name like "Order #3 – 14:07".
   */
  label: string;
  /** Snapshot of cart items at hold time. */
  items: CartItem[];
  /** Customer that was active at hold time, if any. */
  activeCustomer: ActiveCustomer | null;
}

// Cart state and actions
export interface CartState {
  items: CartItem[];
  invoices: Invoice[];
  customers: CustomerProfile[];
  activeCustomer: ActiveCustomer | null;
  /** Orders currently put on hold, persistent across page reloads. */
  heldOrders: HeldOrder[];
}

export type CartAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'ADD_DEAL'; payload: Deal }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_DISCOUNT_PERCENT'; payload: { id: string; discountPercent: number } }
  | { type: 'UPDATE_LUMP_DISCOUNT'; payload: { id: string; lumpSumDiscount: number } }
  | { type: 'SET_ACTIVE_CUSTOMER'; payload: ActiveCustomer }
  | { type: 'CLEAR_ACTIVE_CUSTOMER' }
  | { type: 'CLEAR_CART' }
  | { type: 'SAVE_INVOICE'; payload: { invoice: Invoice; customerProfile: CustomerProfile | null } }
  | { type: 'DELETE_INVOICE'; payload: string }
  | { type: 'MARK_INVOICE_PAID'; payload: { invoiceId: string; paidAt: Date } }
  /** Replace the entire held-orders list (e.g. loaded from server on mount). */
  | { type: 'SET_HELD_ORDERS'; payload: HeldOrder[] }
  /** Freeze the current cart + customer into a HeldOrder slot and clear the live cart. */
  | { type: 'HOLD_ORDER'; payload: HeldOrder }
  /** Swap the live cart with a held order (restores items + customer, removes from held list). */
  | { type: 'RESUME_ORDER'; payload: string }  // payload = heldOrder.id
  /** Permanently discard a held order without resuming it. */
  | { type: 'DELETE_HELD_ORDER'; payload: string }  // payload = heldOrder.id
  /** Swap the temp local ID with the server-assigned ID after holdOrder API call resolves. */
  | { type: 'REPLACE_HELD_ORDER_ID'; payload: { tempId: string; serverId: string; serverHeldAt: Date } }
  /** Clear invoice history when a new till session opens — each session starts fresh. */
  | { type: 'CLEAR_INVOICE_HISTORY' };
