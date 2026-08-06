import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';
import { Order, OrderAction, OrderState, OrderStatus } from '@/types/order';
import { hydrateOrder } from '@/utils/order';
import { useAuth } from '@/context/AuthContext';
import { connectKitchenSocket } from '@/lib/socket';

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const ORDER_STORAGE_KEY = 'pos-app-orders';

const ACTIVE_STATUSES: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'collected'];

// ---------------------------------------------------------------------------
// Hydrate from localStorage
// ---------------------------------------------------------------------------

const hydrateOrderState = (): OrderState => {
  if (typeof window === 'undefined') return { activeOrders: [], recentOrders: [] };

  try {
    const stored = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!stored) return { activeOrders: [], recentOrders: [] };

    const parsed = JSON.parse(stored) as Partial<OrderState>;

    // Drop active orders from previous days — each business day starts fresh.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = Array.isArray(parsed.activeOrders)
      ? parsed.activeOrders
          .map(hydrateOrder)
          .filter((o) => o.createdAt >= startOfToday)
      : [];

    return {
      activeOrders: todayOrders,
      recentOrders: Array.isArray(parsed.recentOrders)
        ? parsed.recentOrders.map(hydrateOrder)
        : [],
    };
  } catch {
    return { activeOrders: [], recentOrders: [] };
  }
};

// ---------------------------------------------------------------------------
// Reducer — the state machine
// ---------------------------------------------------------------------------

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  const now = new Date();

  switch (action.type) {

    case 'CREATE_ORDER':
      return {
        ...state,
        activeOrders: [...state.activeOrders, action.payload],
      };

    case 'CONFIRM_ORDER': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'confirmed', confirmedAt: now }
            : order
        ),
      };
    }

    case 'START_PREPARING': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'preparing', preparingAt: now }
            : order
        ),
      };
    }

    case 'MARK_READY': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'ready', readyAt: now }
            : order
        ),
      };
    }

    case 'MARK_COLLECTED': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'collected', collectedAt: now }
            : order
        ),
      };
    }

    case 'MARK_DISPATCHED': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'dispatched', dispatchedAt: now }
            : order
        ),
      };
    }

    case 'MARK_DELIVERED': {
      return {
        ...state,
        activeOrders: state.activeOrders.map((order) =>
          order.id === action.payload
            ? { ...order, status: 'delivered', deliveredAt: now, paymentStatus: 'paid' }
            : order
        ),
      };
    }

    case 'CLOSE_ORDER': {
      const { orderId, invoiceId } = action.payload;
      const order = state.activeOrders.find((o) => o.id === orderId);
      if (!order) return state;

      const closed: Order = { ...order, status: 'closed', invoiceId, closedAt: now };

      return {
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        recentOrders: [closed, ...state.recentOrders].slice(0, 50),
      };
    }

    case 'VOID_ORDER': {
      const order = state.activeOrders.find((o) => o.id === action.payload);
      if (!order) return state;

      const voided: Order = { ...order, status: 'voided', voidedAt: now };

      return {
        activeOrders: state.activeOrders.filter((o) => o.id !== action.payload),
        recentOrders: [voided, ...state.recentOrders].slice(0, 50),
      };
    }

    case 'MARK_SYNCED': {
      return {
        ...state,
        recentOrders: state.recentOrders.map((order) =>
          order.id === action.payload ? { ...order, synced: true } : order
        ),
      };
    }

    case 'CLEAR_SESSION_ORDERS':
      // Called when a new till session is opened — discard active orders
      // from the previous session so the Orders badge starts at zero.
      return { ...state, activeOrders: [] };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

interface OrderContextType {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;

  // ── Helpers ──────────────────────────────────────────────────────────────
  createOrder:    (order: Order) => void;
  confirmOrder:   (orderId: string) => void;
  startPreparing: (orderId: string) => void;
  markReady:      (orderId: string) => void;
  markCollected:  (orderId: string) => void;
  markDispatched: (orderId: string) => void;
  markDelivered:  (orderId: string) => void;
  closeOrder:     (orderId: string, invoiceId: string) => void;
  voidOrder:          (orderId: string) => void;
  markSynced:         (orderId: string) => void;
  clearSessionOrders: () => void;

  // ── Selectors ─────────────────────────────────────────────────────────────
  getOrdersByStatus: (status: OrderStatus | OrderStatus[]) => Order[];
  getOrderById:      (orderId: string) => Order | undefined;
  getActiveOrders:   () => Order[];
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    orderReducer,
    undefined,
    hydrateOrderState
  );

  // Persist to localStorage on every state change
  useEffect(() => {
    window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Real-time synchronization of kitchen order status updates with the POS active orders
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.branchId) return;

    const token = localStorage.getItem('pos-app-token') ?? '';
    const socket = connectKitchenSocket(user.branchId, token);

    const handleOrderUpdated = (kitchenOrder: { invoiceId: string | number; status: string }) => {
      const invoiceIdStr = String(kitchenOrder.invoiceId);
      
      // Find matching active order in POS state
      const matchingOrder = state.activeOrders.find(
        (o) => o.invoiceId === invoiceIdStr || o.id === invoiceIdStr
      );
      if (!matchingOrder) return;

      if (kitchenOrder.status === 'in_progress' && matchingOrder.status !== 'preparing') {
        dispatch({ type: 'START_PREPARING', payload: matchingOrder.id });
      } else if (kitchenOrder.status === 'ready' && matchingOrder.status !== 'ready') {
        dispatch({ type: 'MARK_READY', payload: matchingOrder.id });
      } else if (kitchenOrder.status === 'served') {
        dispatch({ type: 'CLOSE_ORDER', payload: { orderId: matchingOrder.id, invoiceId: matchingOrder.invoiceId } });
      }
    };

    socket.on('kitchen:order:updated', handleOrderUpdated);

    return () => {
      socket.off('kitchen:order:updated', handleOrderUpdated);
    };
  }, [user?.branchId, state.activeOrders]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const createOrder    = useCallback((order: Order) =>
    dispatch({ type: 'CREATE_ORDER',    payload: order }), []);

  const confirmOrder   = useCallback((orderId: string) =>
    dispatch({ type: 'CONFIRM_ORDER',   payload: orderId }), []);

  const startPreparing = useCallback((orderId: string) =>
    dispatch({ type: 'START_PREPARING', payload: orderId }), []);

  const markReady      = useCallback((orderId: string) =>
    dispatch({ type: 'MARK_READY',      payload: orderId }), []);

  const markCollected  = useCallback((orderId: string) =>
    dispatch({ type: 'MARK_COLLECTED',  payload: orderId }), []);

  const markDispatched = useCallback((orderId: string) =>
    dispatch({ type: 'MARK_DISPATCHED', payload: orderId }), []);

  const markDelivered  = useCallback((orderId: string) =>
    dispatch({ type: 'MARK_DELIVERED',  payload: orderId }), []);

  const closeOrder     = useCallback((orderId: string, invoiceId: string) =>
    dispatch({ type: 'CLOSE_ORDER',     payload: { orderId, invoiceId } }), []);

  const voidOrder      = useCallback((orderId: string) =>
    dispatch({ type: 'VOID_ORDER',      payload: orderId }), []);

  const markSynced         = useCallback((orderId: string) =>
    dispatch({ type: 'MARK_SYNCED',          payload: orderId }), []);

  const clearSessionOrders = useCallback(() =>
    dispatch({ type: 'CLEAR_SESSION_ORDERS' }), []);

  // ── Selectors ─────────────────────────────────────────────────────────────

  const getOrdersByStatus = useCallback((status: OrderStatus | OrderStatus[]): Order[] => {
    const statuses = Array.isArray(status) ? status : [status];
    return state.activeOrders.filter((o) => statuses.includes(o.status));
  }, [state.activeOrders]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return (
      state.activeOrders.find((o) => o.id === orderId) ??
      state.recentOrders.find((o) => o.id === orderId)
    );
  }, [state.activeOrders, state.recentOrders]);

  const getActiveOrders = useCallback((): Order[] => {
    return [...state.activeOrders].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }, [state.activeOrders]);

  return (
    <OrderContext.Provider
      value={{
        state,
        dispatch,
        createOrder,
        confirmOrder,
        startPreparing,
        markReady,
        markCollected,
        markDispatched,
        markDelivered,
        closeOrder,
        voidOrder,
        markSynced,
        clearSessionOrders,
        getOrdersByStatus,
        getOrderById,
        getActiveOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
