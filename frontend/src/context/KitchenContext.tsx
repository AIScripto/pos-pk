// =============================================================================
// KitchenContext — real-time kitchen order state via Socket.io + REST fallback
// =============================================================================

import React, { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from 'react';
import { connectKitchenSocket, disconnectSocket } from '@/lib/socket';
import { api } from '@/lib/api/client';
import type { Socket } from 'socket.io-client';

// Socket.IO is ON by default everywhere — only set VITE_ENABLE_SOCKET_IO=false to disable.
// Previously this was `DEV || VITE_ENABLE_SOCKET_IO === 'true'` which silently disabled
// real-time updates in production, causing orders to appear only on the 10-second REST poll.
const SOCKET_IO_ENABLED = import.meta.env.VITE_ENABLE_SOCKET_IO !== 'false';
// Fallback REST poll — safety net when socket drops; 5 s keeps the board fresh
const REST_POLL_MS = 5_000;

// ── Types ─────────────────────────────────────────────────────────────────────

export type KitchenStatus = 'new' | 'acknowledged' | 'in_progress' | 'ready' | 'served';

export interface KitchenOrderItem {
  id:          string;
  productName: string;
  quantity:    number;
  notes:       string | null;
  status:      'pending' | 'done';
}

export interface KitchenOrder {
  id:          string;
  orderNumber: string;
  orderType:   string;
  tableName:   string | null;
  covers:      number | null;
  cashierName: string;
  notes:       string | null;
  status:      KitchenStatus;
  placedAt:    string;
  acknowledgedAt: string | null;
  startedAt:   string | null;
  readyAt:     string | null;
  items:       KitchenOrderItem[];
}

// ── Reducer ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'INIT';    orders: KitchenOrder[] }
  | { type: 'NEW';     order:  KitchenOrder }
  | { type: 'UPDATE';  order:  KitchenOrder }

function reducer(state: KitchenOrder[], action: Action): KitchenOrder[] {
  switch (action.type) {
    case 'INIT':   return action.orders;
    case 'NEW': {
      // Deduplicate — ignore if we already have this order
      const exists = state.some((o) => String(o.id) === String(action.order.id));
      return exists ? state : [action.order, ...state];
    }
    case 'UPDATE':
      return state.map((o) => String(o.id) === String(action.order.id) ? action.order : o);
    default:       return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface KitchenContextValue {
  orders:     KitchenOrder[];
  connected:  boolean;
  realtimeEnabled: boolean;
  error:      string | null;
  acknowledge: (orderId: string) => void;
  start:       (orderId: string) => void;
  markReady:   (orderId: string) => void;
  markServed:  (orderId: string) => void;
}

const KitchenContext = createContext<KitchenContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface Props { branchId: string; token: string; children: ReactNode; }

export function KitchenProvider({ branchId, token, children }: Props) {
  const [orders, dispatch]  = useReducer(reducer, []);
  const [connected, setConnected] = React.useState(false);
  const [error, setError]         = React.useState<string | null>(null);
  const socketRef = React.useRef<Socket | null>(null);

  const fetchOrders = useCallback(() => {
    if (!branchId) return Promise.resolve();
    return api.get<KitchenOrder[]>('/kitchen/orders', { branchId })
      .then((orders) => {
        dispatch({ type: 'INIT', orders });
      })
      .catch((err) => {
        console.warn('[KDS] REST sync failed:', err?.message ?? err);
      });
  }, [branchId]);

  // ── REST fallback: fetch orders on mount so the board is never blank ────────
  useEffect(() => {
    if (!branchId) return undefined;
    console.log('[KDS] REST fallback — fetching active orders...');
    fetchOrders();

    const timer = window.setInterval(fetchOrders, REST_POLL_MS);
    return () => window.clearInterval(timer);
  }, [branchId, fetchOrders]);

  // ── Socket setup ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!branchId) {
      setError('No branch assigned — please log in via PIN on a terminal');
      return;
    }
    if (!SOCKET_IO_ENABLED) {
      setConnected(false);
      setError(null);
      return;
    }

    console.log('[KDS] KitchenProvider mounting — branchId:', branchId, '| token present:', !!token);
    const s = connectKitchenSocket(branchId, token);
    socketRef.current = s;

    s.on('connect',    () => { console.log('[KDS] socket connected'); setConnected(true); setError(null); });
    s.on('disconnect', () => { console.log('[KDS] socket disconnected'); setConnected(false); });

    s.on('kitchen:init', (orders: KitchenOrder[]) => {
      console.log('[KDS] kitchen:init — orders:', orders.length);
      dispatch({ type: 'INIT', orders });
    });

    s.on('kitchen:order:new', (order: KitchenOrder) => {
      console.log('[KDS] kitchen:order:new —', order.id, order.orderNumber, order.status);
      dispatch({ type: 'NEW', order });
    });

    s.on('kitchen:order:updated', (order: KitchenOrder) => {
      console.log('[KDS] kitchen:order:updated —', order.id, order.status);
      dispatch({ type: 'UPDATE', order });
    });

    s.on('kitchen:error', (err: { message: string }) => {
      console.error('[KDS] socket error:', err.message);
      setError(err.message);
    });

    return () => {
      s.off('connect');
      s.off('disconnect');
      s.off('kitchen:init');
      s.off('kitchen:order:new');
      s.off('kitchen:order:updated');
      s.off('kitchen:error');
      disconnectSocket();
    };
  }, [branchId, token]);

  const statusForEvent = (event: string): KitchenStatus | null => {
    switch (event) {
      case 'kitchen:acknowledge': return 'acknowledged';
      case 'kitchen:start':       return 'in_progress';
      case 'kitchen:ready':       return 'ready';
      case 'kitchen:served':      return 'served';
      default:                    return null;
    }
  };

  const emit = useCallback((event: string, orderId: string) => {
    if (SOCKET_IO_ENABLED && socketRef.current?.connected) {
      socketRef.current.emit(event, { orderId, branchId });
      return;
    }

    const status = statusForEvent(event);
    if (!status) return;

    api.patch<KitchenOrder>(`/kitchen/orders/${orderId}`, { status, branchId })
      .then((order) => dispatch({ type: 'UPDATE', order }))
      .catch((err) => setError(err?.message ?? 'Failed to update order'));
  }, [branchId]);

  const acknowledge = useCallback((id: string) => emit('kitchen:acknowledge', id), [emit]);
  const start       = useCallback((id: string) => emit('kitchen:start',       id), [emit]);
  const markReady   = useCallback((id: string) => emit('kitchen:ready',        id), [emit]);
  const markServed  = useCallback((id: string) => emit('kitchen:served',       id), [emit]);

  return (
    <KitchenContext.Provider value={{ orders, connected, realtimeEnabled: SOCKET_IO_ENABLED, error, acknowledge, start, markReady, markServed }}>
      {children}
    </KitchenContext.Provider>
  );
}

export function useKitchen(): KitchenContextValue {
  const ctx = useContext(KitchenContext);
  if (!ctx) throw new Error('useKitchen must be used inside <KitchenProvider>');
  return ctx;
}
