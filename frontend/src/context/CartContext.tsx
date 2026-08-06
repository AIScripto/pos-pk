import React, { createContext, useContext, useEffect, useReducer, useState, ReactNode } from 'react';
import { useInventory } from '@/context/InventoryContext';
import { useAuth }      from '@/context/AuthContext';
import { useAppConfig } from '@/context/AppConfigContext';
import { LoyaltyConfig } from '@/lib/api/admin-config.api';
import { heldOrderApi } from '@/lib/api/held-order.api';
import {
  ActiveCustomer,
  CartState,
  CartAction,
  CartItem,
  CustomerFavoriteItem,
  CustomerProfile,
  Deal,
  HeldOrder,
  Invoice,
  Product,
} from '@/types/pos';
import { OrderType, PaymentMethod } from '@/types/order';
import {
  calculateCartTotals,
  calculateLoyaltyPoints,
  calculateTax,
  formatPhoneNumber,
  generateId,
  generateHoldLabel,
  generateInvoiceNumber,
  getCartItemIdentity,
  normalizePhoneNumber,
} from '@/utils/pos';
import { validateCartCalculation, isDuplicateInvoiceId, InvoiceSchema } from '@/lib/validation';

const CART_STORAGE_KEY = 'pos-app-pos-state';

// Initial state
const initialState: CartState = {
  items: [],
  invoices: [],
  customers: [],
  activeCustomer: null,
  heldOrders: [],
};

const parseNumber = (value: number, fallback: number = 0) => {
  return Number.isFinite(value) ? value : fallback;
};

const hydrateActiveCustomer = (activeCustomer: Partial<ActiveCustomer> | null | undefined): ActiveCustomer | null => {
  if (!activeCustomer) {
    return null;
  }

  const name = typeof activeCustomer.name === 'string' ? activeCustomer.name.trim().slice(0, 100) : '';
  const phone = typeof activeCustomer.phone === 'string' ? activeCustomer.phone : '';
  const normalizedPhone = formatPhoneNumber(phone);

  if (!name && !normalizedPhone) {
    return null;
  }

  return {
    customerId: activeCustomer.customerId ?? null,
    name,
    phone: normalizedPhone,
  };
};

const hydrateCartState = (): CartState => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return initialState;
    }

    const parsed = JSON.parse(stored) as Partial<CartState>;

    return {
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item) => ({
            ...item,
            quantity: Math.max(1, parseNumber(item.quantity, 1)),
            discountPercent: Math.min(100, Math.max(0, parseNumber(item.discountPercent))),
            lumpSumDiscount: Math.max(0, parseNumber(item.lumpSumDiscount)),
          }))
        : [],
      invoices: (() => {
        // Drop invoices from previous days — each business day starts fresh.
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        return (Array.isArray(parsed.invoices) ? parsed.invoices : [])
          .filter((inv) => new Date(inv.date) >= startOfToday);
      })().map((invoice) => ({
            ...invoice,
            date: new Date(invoice.date),
            items: Array.isArray(invoice.items)
              ? invoice.items.map((item) => ({
                  ...item,
                  quantity: Math.max(1, parseNumber(item.quantity, 1)),
                  discountPercent: Math.min(100, Math.max(0, parseNumber(item.discountPercent))),
                  lumpSumDiscount: Math.max(0, parseNumber(item.lumpSumDiscount)),
                }))
              : [],
            subtotal: parseNumber(invoice.subtotal),
            totalDiscount: parseNumber(invoice.totalDiscount),
            preTaxTotal: parseNumber((invoice as Invoice).preTaxTotal, parseNumber(invoice.subtotal) - parseNumber(invoice.totalDiscount)),
            taxRate: parseNumber((invoice as Invoice).taxRate),
            taxAmount: parseNumber((invoice as Invoice).taxAmount),
            grandTotal: parseNumber(invoice.grandTotal),
            paymentMethod: (invoice as Invoice).paymentMethod ?? 'cash',
            paymentStatus: (invoice as Invoice).paymentStatus ?? 'paid',
            paidAt: (invoice as Invoice).paidAt ? new Date((invoice as Invoice).paidAt as unknown as string) : null,
            customer: invoice.customer
              ? {
                  ...invoice.customer,
                  customerId: invoice.customer.customerId ?? null,
                  name: invoice.customer.name ?? '',
                  phone: invoice.customer.phone ?? '',
                  loyaltyPointsBeforeOrder: parseNumber(invoice.customer.loyaltyPointsBeforeOrder),
                  loyaltyPointsEarned: parseNumber(invoice.customer.loyaltyPointsEarned),
                  loyaltyPointsAfterOrder: parseNumber(invoice.customer.loyaltyPointsAfterOrder),
                }
              : null,
          })),
      customers: Array.isArray(parsed.customers)
        ? dedupeCustomers(parsed.customers.map((customer) => ({
            ...customer,
            phone: formatPhoneNumber(customer.phone ?? ''),
            loyaltyPoints: parseNumber(customer.loyaltyPoints),
            totalOrders: parseNumber(customer.totalOrders),
            totalSpent: parseNumber(customer.totalSpent),
            favoriteItems: Array.isArray(customer.favoriteItems)
              ? customer.favoriteItems.map((item) => ({
                  itemKey: item.itemKey ?? generateId(),
                  name: item.name ?? 'Unknown item',
                  quantity: Math.max(0, parseNumber(item.quantity)),
                }))
              : [],
            orderHistory: Array.isArray(customer.orderHistory)
              ? customer.orderHistory.map((order) => ({
                  invoiceId: order.invoiceId ?? generateId(),
                  date: new Date(order.date),
                  grandTotal: parseNumber(order.grandTotal),
                  itemCount: parseNumber(order.itemCount),
                }))
              : [],
            createdAt: new Date(customer.createdAt ?? new Date()),
            updatedAt: new Date(customer.updatedAt ?? new Date()),
            lastOrderAt: customer.lastOrderAt ? new Date(customer.lastOrderAt) : null,
          })))
        : [],
      activeCustomer: hydrateActiveCustomer(parsed.activeCustomer),
      heldOrders: Array.isArray((parsed as CartState).heldOrders)
        ? ((parsed as CartState).heldOrders).map((held) => ({
            ...held,
            heldAt: new Date(held.heldAt),
            label: typeof held.label === 'string' && held.label ? held.label : 'Held Order',
            items: Array.isArray(held.items)
              ? held.items.map((item) => ({
                  ...item,
                  quantity: Math.max(1, parseNumber(item.quantity, 1)),
                  discountPercent: Math.min(100, Math.max(0, parseNumber(item.discountPercent))),
                  lumpSumDiscount: Math.max(0, parseNumber(item.lumpSumDiscount)),
                }))
              : [],
            activeCustomer: hydrateActiveCustomer(held.activeCustomer),
          }))
        : [],
    };
  } catch {
    return initialState;
  }
};

const buildFavoriteItems = (
  existingFavorites: CustomerFavoriteItem[],
  items: CartItem[],
) => {
  const counts = new Map<string, CustomerFavoriteItem>();

  existingFavorites.forEach((favorite) => {
    counts.set(favorite.itemKey, { ...favorite });
  });

  items.forEach((item) => {
    const identity = getCartItemIdentity(item);
    const existing = counts.get(identity.itemKey);

    counts.set(identity.itemKey, {
      itemKey: identity.itemKey,
      name: identity.name,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
  });

  return Array.from(counts.values())
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
};

const mergeCustomerProfiles = (baseCustomer: CustomerProfile, incomingCustomer: CustomerProfile) => {
  const mergedFavorites = Array.from(
    [...baseCustomer.favoriteItems, ...incomingCustomer.favoriteItems].reduce((map, favorite) => {
      const existing = map.get(favorite.itemKey);

      map.set(favorite.itemKey, {
        itemKey: favorite.itemKey,
        name: favorite.name,
        quantity: (existing?.quantity ?? 0) + favorite.quantity,
      });

      return map;
    }, new Map<string, CustomerFavoriteItem>()),
  )
    .map(([, value]) => value)
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);

  const mergedOrderHistory = [...baseCustomer.orderHistory, ...incomingCustomer.orderHistory]
    .sort((left, right) => right.date.getTime() - left.date.getTime())
    .filter((order, index, collection) => index === collection.findIndex((entry) => entry.invoiceId === order.invoiceId))
    .slice(0, 10);

  return {
    ...baseCustomer,
    ...incomingCustomer,
    id: baseCustomer.id,
    phone: formatPhoneNumber(incomingCustomer.phone || baseCustomer.phone),
    loyaltyPoints: Math.max(baseCustomer.loyaltyPoints, incomingCustomer.loyaltyPoints),
    totalOrders: Math.max(baseCustomer.totalOrders, incomingCustomer.totalOrders),
    totalSpent: Math.max(baseCustomer.totalSpent, incomingCustomer.totalSpent),
    favoriteItems: mergedFavorites,
    orderHistory: mergedOrderHistory,
    createdAt:
      baseCustomer.createdAt.getTime() <= incomingCustomer.createdAt.getTime()
        ? baseCustomer.createdAt
        : incomingCustomer.createdAt,
    updatedAt:
      baseCustomer.updatedAt.getTime() >= incomingCustomer.updatedAt.getTime()
        ? baseCustomer.updatedAt
        : incomingCustomer.updatedAt,
    lastOrderAt: [baseCustomer.lastOrderAt, incomingCustomer.lastOrderAt]
      .filter((date): date is Date => date instanceof Date)
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null,
  };
};

const dedupeCustomers = (customers: CustomerProfile[]) => {
  const uniqueCustomers = new Map<string, CustomerProfile>();

  customers.forEach((customer) => {
    const normalizedPhone = normalizePhoneNumber(customer.phone);
    const key = normalizedPhone || customer.id;
    const existing = uniqueCustomers.get(key);

    if (!existing) {
      uniqueCustomers.set(key, customer);
      return;
    }

    uniqueCustomers.set(key, mergeCustomerProfiles(existing, customer));
  });

  return Array.from(uniqueCustomers.values()).sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime());
};

const buildUpdatedCustomerProfile = (
  existingCustomer: CustomerProfile | undefined,
  activeCustomer: ActiveCustomer,
  invoice: Invoice,
  loyaltyConfig?: LoyaltyConfig,
) => {
  const now = invoice.date;
  const loyaltyPointsBeforeOrder = existingCustomer?.loyaltyPoints ?? 0;
  const isLoyaltyEnabled = loyaltyConfig?.isEnabled !== false;
  const earnRate = loyaltyConfig?.earnRatePaisa ?? 1000;
  const loyaltyPointsEarned = isLoyaltyEnabled ? calculateLoyaltyPoints(invoice.grandTotal, earnRate) : 0;
  const loyaltyPointsAfterOrder = loyaltyPointsBeforeOrder + loyaltyPointsEarned;

  const customerProfile: CustomerProfile = {
    id: existingCustomer?.id ?? activeCustomer.customerId ?? generateId(),
    name: activeCustomer.name.trim(),
    phone: formatPhoneNumber(activeCustomer.phone),
    loyaltyPoints: loyaltyPointsAfterOrder,
    totalOrders: (existingCustomer?.totalOrders ?? 0) + 1,
    totalSpent: (existingCustomer?.totalSpent ?? 0) + invoice.grandTotal,
    favoriteItems: buildFavoriteItems(existingCustomer?.favoriteItems ?? [], invoice.items),
    orderHistory: [
      {
        invoiceId: invoice.id,
        date: invoice.date,
        grandTotal: invoice.grandTotal,
        itemCount: invoice.items.reduce((sum, item) => sum + item.quantity, 0),
      },
      ...(existingCustomer?.orderHistory ?? []),
    ].slice(0, 10),
    createdAt: existingCustomer?.createdAt ?? now,
    updatedAt: now,
    lastOrderAt: now,
  };

  return {
    customerProfile,
    customerSnapshot: {
      customerId: customerProfile.id,
      name: customerProfile.name,
      phone: customerProfile.phone,
      loyaltyPointsBeforeOrder,
      loyaltyPointsEarned,
      loyaltyPointsAfterOrder,
    },
  };
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const existingItem = state.items.find(
        item => item.product?.id === action.payload.id && !item.deal
      );
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      
      const newItem: CartItem = {
        id: generateId(),
        product: action.payload,
        quantity: 1,
        discountPercent: 0,
        lumpSumDiscount: 0,
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }
    
    case 'ADD_DEAL': {
      const newItem: CartItem = {
        id: generateId(),
        deal: action.payload,
        quantity: 1,
        discountPercent: 0,
        lumpSumDiscount: 0,
      };
      
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity < 1) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
    
    case 'UPDATE_DISCOUNT_PERCENT': {
      const { id, discountPercent } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id 
            ? { ...item, discountPercent: Math.min(100, Math.max(0, discountPercent)) } 
            : item
        ),
      };
    }
    
    case 'UPDATE_LUMP_DISCOUNT': {
      const { id, lumpSumDiscount } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id 
            ? { ...item, lumpSumDiscount: Math.max(0, lumpSumDiscount) } 
            : item
        ),
      };
    }

    case 'SET_ACTIVE_CUSTOMER':
      return {
        ...state,
        activeCustomer: action.payload,
      };

    case 'CLEAR_ACTIVE_CUSTOMER':
      return {
        ...state,
        activeCustomer: null,
      };
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        activeCustomer: null,
      };
    
    case 'SAVE_INVOICE':
      return {
        ...state,
        invoices: [action.payload.invoice, ...state.invoices],
        customers: action.payload.customerProfile
          ? dedupeCustomers([
              action.payload.customerProfile,
              ...state.customers.filter((customer) => {
                const sameId = customer.id === action.payload.customerProfile?.id;
                const samePhone =
                  normalizePhoneNumber(customer.phone) !== '' &&
                  normalizePhoneNumber(customer.phone) ===
                    normalizePhoneNumber(action.payload.customerProfile?.phone ?? '');

                return !sameId && !samePhone;
              }),
            ])
          : state.customers,
        items: [],
        activeCustomer: null,
      };
    
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(inv => inv.id !== action.payload),
      };

    case 'MARK_INVOICE_PAID':
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv.id === action.payload.invoiceId
            ? { ...inv, paymentStatus: 'paid', paidAt: action.payload.paidAt }
            : inv
        ),
      };

    // ── Hold / Resume ────────────────────────────────────────────────────

    case 'SET_HELD_ORDERS':
      return { ...state, heldOrders: action.payload };

    case 'HOLD_ORDER':
      // Freeze the live cart into a held slot and clear the active cart.
      return {
        ...state,
        heldOrders: [...state.heldOrders, action.payload],
        items: [],
        activeCustomer: null,
      };

    case 'RESUME_ORDER': {
      // Pull the held order back into the live cart.
      const held = state.heldOrders.find((h) => h.id === action.payload);
      if (!held) return state;
      return {
        ...state,
        items: held.items.map((item) => ({ ...item })),
        activeCustomer: held.activeCustomer,
        heldOrders: state.heldOrders.filter((h) => h.id !== action.payload),
      };
    }

    case 'DELETE_HELD_ORDER':
      return {
        ...state,
        heldOrders: state.heldOrders.filter((h) => h.id !== action.payload),
      };

    case 'REPLACE_HELD_ORDER_ID': {
      const { tempId, serverId, serverHeldAt } = action.payload;
      return {
        ...state,
        heldOrders: state.heldOrders.map((h) =>
          h.id === tempId ? { ...h, id: serverId, heldAt: serverHeldAt } : h
        ),
      };
    }

    case 'CLEAR_INVOICE_HISTORY':
      // Called when a new till session opens — each session starts with a clean invoice list.
      return { ...state, invoices: [] };

  }
}

// Context type
interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addProduct: (product: Product) => void;
  addDeal: (deal: Deal) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateDiscountPercent: (id: string, discountPercent: number) => void;
  updateLumpDiscount: (id: string, lumpSumDiscount: number) => void;
  setActiveCustomer: (customer: Partial<ActiveCustomer>) => void;
  selectCustomer: (customerId: string) => void;
  clearActiveCustomer: () => void;
  clearCart: () => void;
  generateInvoice: () => Invoice | null;
  saveInvoice: (invoice?: Invoice) => Invoice | null;
  deleteInvoice: (id: string) => void;
  markInvoicePaid: (invoiceId: string) => void;
  getCartTotals: () => { subtotal: number; totalDiscount: number; grandTotal: number };
  /** Freeze the current cart into a held slot. Optionally provide a custom label. */
  holdOrder: (label?: string) => HeldOrder | null;
  /** Restore a held order back to the live cart. */
  resumeOrder: (heldOrderId: string) => void;
  /** Permanently discard a held order. */
  deleteHeldOrder: (heldOrderId: string) => void;
  /** Clear invoice history when a new till session opens. */
  clearInvoiceHistory: () => void;
  /** Current order type — dine-in, takeaway, delivery */
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  /** Current payment method — cash, card, cash-on-delivery, card-on-delivery */
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  managerApprovalToken: string | null;
  setManagerApprovalToken: (token: string | null) => void;
  /**
   * Optional callback fired after saveInvoice succeeds.
   * POSPage wires this to OrderContext to create + close an Order record.
   */
  onInvoiceSaved?: (invoice: Invoice) => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export function CartProvider({
  children,
  onInvoiceSaved,
}: {
  children: ReactNode;
  onInvoiceSaved?: (invoice: Invoice) => void;
}) {
  const [state, dispatch] = useReducer(cartReducer, initialState, hydrateCartState);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [managerApprovalToken, setManagerApprovalToken] = useState<string | null>(null);
  const { deductSale } = useInventory();
  const { isLoggedIn } = useAuth();
  const { loyaltyConfig } = useAppConfig();

  // Persist cart state (items + customers) — invoices and held orders are server-backed
  useEffect(() => {
    const { invoices: _inv, heldOrders: _held, ...persistable } = state;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ ...persistable, invoices: state.invoices, heldOrders: [] }));
  }, [state]);

  // Load held orders from server on login — server is source of truth (branch-shared)
  useEffect(() => {
    if (!isLoggedIn) return;
    heldOrderApi.list()
      .then((serverOrders) => {
        const hydrated = serverOrders.map((o) => ({
          id:            o.id,
          heldAt:        new Date(o.heldAt),
          label:         o.label,
          items:         Array.isArray(o.itemsJson) ? o.itemsJson : [],
          activeCustomer: o.activeCustomerJson ?? null,
        }));
        dispatch({ type: 'SET_HELD_ORDERS', payload: hydrated });
      })
      .catch(() => { /* server unreachable — local cache remains */ });
  }, [isLoggedIn]);

  const addProduct = (product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  };

  const addDeal = (deal: Deal) => {
    dispatch({ type: 'ADD_DEAL', payload: deal });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateDiscountPercent = (id: string, discountPercent: number) => {
    dispatch({ type: 'UPDATE_DISCOUNT_PERCENT', payload: { id, discountPercent } });
  };

  const updateLumpDiscount = (id: string, lumpSumDiscount: number) => {
    dispatch({ type: 'UPDATE_LUMP_DISCOUNT', payload: { id, lumpSumDiscount } });
  };

  const setActiveCustomer = (customer: Partial<ActiveCustomer>) => {
    const nextCustomer = hydrateActiveCustomer({
      customerId: customer.customerId ?? state.activeCustomer?.customerId ?? null,
      name: customer.name ?? state.activeCustomer?.name ?? '',
      phone: customer.phone ?? state.activeCustomer?.phone ?? '',
    });

    if (nextCustomer) {
      dispatch({ type: 'SET_ACTIVE_CUSTOMER', payload: nextCustomer });
      return;
    }

    dispatch({ type: 'CLEAR_ACTIVE_CUSTOMER' });
  };

  const selectCustomer = (customerId: string) => {
    const customer = state.customers.find((entry) => entry.id === customerId);
    if (!customer) {
      return;
    }

    dispatch({
      type: 'SET_ACTIVE_CUSTOMER',
      payload: {
        customerId: customer.id,
        name: customer.name,
        phone: customer.phone,
      },
    });
  };

  const clearActiveCustomer = () => {
    dispatch({ type: 'CLEAR_ACTIVE_CUSTOMER' });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotals = () => {
    return calculateCartTotals(state.items);
  };

  const generateInvoice = (): Invoice | null => {
    if (state.items.length === 0) return null;

    const totals = getCartTotals();
    // preTaxTotal is what the customer owes AFTER discounts, BEFORE tax.
    const preTaxTotal = totals.grandTotal;
    const tax = calculateTax(preTaxTotal, paymentMethod);

    const activeCustomer = hydrateActiveCustomer(state.activeCustomer);
    const normalizedPhone = activeCustomer ? normalizePhoneNumber(activeCustomer.phone) : '';
    const existingCustomer = activeCustomer
      ? state.customers.find((customer) => {
          if (activeCustomer.customerId && customer.id === activeCustomer.customerId) {
            return true;
          }

          return normalizedPhone !== '' && normalizePhoneNumber(customer.phone) === normalizedPhone;
        })
      : undefined;
    const isLoyaltyEnabled = loyaltyConfig?.isEnabled !== false;
    const earnRate = loyaltyConfig?.earnRatePaisa ?? 1000;
    const loyaltyPointsEarned = isLoyaltyEnabled ? calculateLoyaltyPoints(tax.grandTotal, earnRate) : 0;
    const customerSnapshot = activeCustomer
      ? {
          customerId: existingCustomer?.id ?? activeCustomer.customerId ?? null,
          name: activeCustomer.name,
          phone: activeCustomer.phone,
          loyaltyPointsBeforeOrder: existingCustomer?.loyaltyPoints ?? 0,
          // Loyalty is earned on the final amount paid (including tax).
          loyaltyPointsEarned,
          loyaltyPointsAfterOrder:
            (existingCustomer?.loyaltyPoints ?? 0) + loyaltyPointsEarned,
        }
      : null;

    // Payment method and status are always resolved in the PaymentModal.
    // The invoice is generated as 'pending' here; the modal confirms it as 'paid'.
    return {
      id: generateInvoiceNumber(),
      date: new Date(),
      items: state.items.map((item) => ({ ...item })),
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      preTaxTotal,
      taxRate: tax.taxRate,
      taxAmount: tax.taxAmount,
      grandTotal: tax.grandTotal,
      paymentMethod: 'cash',    // default — overwritten by PaymentModal selection
      paymentStatus: 'pending', // always pending until PaymentModal confirms
      paidAt:        null,
      customer: customerSnapshot,
    };
  };

  const saveInvoice = (invoice?: Invoice) => {
    const nextInvoice = invoice ?? generateInvoice();
    if (nextInvoice) {
      // VALIDATION: Detect duplicate invoice IDs
      if (isDuplicateInvoiceId(nextInvoice.id)) {
        console.error('Duplicate invoice ID detected', { id: nextInvoice.id });
        return;
      }

      // VALIDATION: Verify cart totals are correct
      if (!validateCartCalculation(nextInvoice.subtotal, nextInvoice.totalDiscount, nextInvoice.taxAmount, nextInvoice.grandTotal)) {
        console.error('Cart calculation validation failed', {
          subtotal: nextInvoice.subtotal,
          discount: nextInvoice.totalDiscount,
          tax: nextInvoice.taxAmount,
          total: nextInvoice.grandTotal,
        });
        return;
      }

      const activeCustomer = hydrateActiveCustomer(state.activeCustomer);
      const normalizedPhone = activeCustomer ? normalizePhoneNumber(activeCustomer.phone) : '';
      const existingCustomer = activeCustomer
        ? state.customers.find((customer) => {
            if (activeCustomer.customerId && customer.id === activeCustomer.customerId) {
              return true;
            }

            return normalizedPhone !== '' && normalizePhoneNumber(customer.phone) === normalizedPhone;
          })
        : undefined;
      const customerUpdate =
        activeCustomer && activeCustomer.name.trim() && activeCustomer.phone.trim()
          ? buildUpdatedCustomerProfile(existingCustomer, activeCustomer, nextInvoice, loyaltyConfig)
          : null;
      const invoiceToSave: Invoice = {
        ...nextInvoice,
        customer: customerUpdate?.customerSnapshot ?? nextInvoice.customer,
      };

      dispatch({
        type: 'SAVE_INVOICE',
        payload: {
          invoice: invoiceToSave,
          customerProfile: customerUpdate?.customerProfile ?? null,
        },
      });
      setManagerApprovalToken(null);
      // Auto-deduct sold quantities from inventory stock
      deductSale(invoiceToSave.items);
      // Notify OrderContext (or any listener) that an invoice was saved
      onInvoiceSaved?.(invoiceToSave);
      return invoiceToSave;
    }

    return null;
  };

  const deleteInvoice = (id: string) => {
    dispatch({ type: 'DELETE_INVOICE', payload: id });
  };

  const markInvoicePaid = (invoiceId: string) => {
    dispatch({ type: 'MARK_INVOICE_PAID', payload: { invoiceId, paidAt: new Date() } });
  };

  // ── Hold / Resume ───────────────────────────────────────────────────────

  const holdOrder = (label?: string): HeldOrder | null => {
    if (state.items.length === 0) return null;

    const heldLabel = label?.trim() || generateHoldLabel(state.heldOrders.length);
    const items     = state.items.map((item) => ({ ...item }));

    // POST to server — swap temp ID with server-assigned ID when it resolves.
    // Using REPLACE_HELD_ORDER_ID avoids the stale-closure bug that SET_HELD_ORDERS
    // had: it only touches the single entry rather than replacing the whole list.
    heldOrderApi.create({
      label:              heldLabel,
      itemsJson:          JSON.stringify(items),
      activeCustomerJson: state.activeCustomer ? JSON.stringify(state.activeCustomer) : undefined,
      orderType,
      customerId:    state.activeCustomer?.customerId ?? undefined,
      customerName:  state.activeCustomer?.name       ?? undefined,
      customerPhone: state.activeCustomer?.phone      ?? undefined,
    }).then((serverHeld) => {
      dispatch({
        type: 'REPLACE_HELD_ORDER_ID',
        payload: {
          tempId:       held.id,
          serverId:     serverHeld.id,
          serverHeldAt: new Date(serverHeld.heldAt),
        },
      });
    }).catch(() => {
      // Server unreachable — local temp ID remains; recall still works locally
    });

    const held: HeldOrder = {
      id:            generateId(),  // temporary local ID
      heldAt:        new Date(),
      label:         heldLabel,
      items,
      activeCustomer: state.activeCustomer ? { ...state.activeCustomer } : null,
    };

    dispatch({ type: 'HOLD_ORDER', payload: held });
    return held;
  };

  const resumeOrder = (heldOrderId: string) => {
    heldOrderApi.remove(heldOrderId).catch((err: unknown) => {
      console.warn('[CartContext] resumeOrder: failed to remove held order from server', err);
    });
    dispatch({ type: 'RESUME_ORDER', payload: heldOrderId });
  };

  const deleteHeldOrder = (heldOrderId: string) => {
    heldOrderApi.remove(heldOrderId).catch((err: unknown) => {
      console.warn('[CartContext] deleteHeldOrder: failed to remove held order from server', err);
    });
    dispatch({ type: 'DELETE_HELD_ORDER', payload: heldOrderId });
  };

  const clearInvoiceHistory = () => {
    dispatch({ type: 'CLEAR_INVOICE_HISTORY' });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch,
        addProduct,
        addDeal,
        removeItem,
        updateQuantity,
        updateDiscountPercent,
        updateLumpDiscount,
        setActiveCustomer,
        selectCustomer,
        clearActiveCustomer,
        clearCart,
        generateInvoice,
        saveInvoice,
        deleteInvoice,
        markInvoicePaid,
        getCartTotals,
        holdOrder,
        resumeOrder,
        deleteHeldOrder,
        clearInvoiceHistory,
        orderType,
        setOrderType,
        paymentMethod,
        setPaymentMethod,
        managerApprovalToken,
        setManagerApprovalToken,
        onInvoiceSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
