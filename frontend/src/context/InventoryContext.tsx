import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem } from '@/types/pos';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockEntry {
  productId: string;
  quantity: number;      // current stock level
  minThreshold: number;  // low-stock alert when quantity <= this
  unit: string;          // display unit label, e.g. "units"
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(entry: StockEntry): StockStatus {
  if (entry.quantity <= 0) return 'out_of_stock';
  if (entry.quantity <= entry.minThreshold) return 'low_stock';
  return 'in_stock';
}

interface InventoryState {
  stock: StockEntry[];
}

type InventoryAction =
  | { type: 'SET_STOCK'; payload: StockEntry }
  | { type: 'ADJUST_STOCK'; payload: { productId: string; delta: number } }
  | { type: 'DEDUCT_SALE'; payload: { productId: string; qty: number }[] };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_STOCK': {
      const exists = state.stock.some(s => s.productId === action.payload.productId);
      if (exists) {
        return {
          ...state,
          stock: state.stock.map(s =>
            s.productId === action.payload.productId ? action.payload : s
          ),
        };
      }
      return { ...state, stock: [...state.stock, action.payload] };
    }

    case 'ADJUST_STOCK':
      return {
        ...state,
        stock: state.stock.map(s =>
          s.productId === action.payload.productId
            ? { ...s, quantity: Math.max(0, s.quantity + action.payload.delta) }
            : s
        ),
      };

    case 'DEDUCT_SALE':
      return {
        ...state,
        stock: state.stock.map(s => {
          const deduction = action.payload.find(d => d.productId === s.productId);
          if (!deduction) return s;
          return { ...s, quantity: Math.max(0, s.quantity - deduction.qty) };
        }),
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface InventoryContextValue {
  stock: StockEntry[];
  setStock: (entry: StockEntry) => void;
  adjustStock: (productId: string, delta: number) => void;
  /** Called by CartContext after a sale to auto-deduct sold quantities. */
  deductSale: (items: CartItem[]) => void;
  getEntry: (productId: string) => StockEntry | undefined;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

const STORAGE_KEY = 'pos-app-inventory';

function loadState(): InventoryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InventoryState;
      if (Array.isArray(parsed.stock)) return parsed;
    }
  } catch {
    // fall through
  }
  return { stock: [] };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full
    }
  }, [state]);

  function setStock(entry: StockEntry) {
    dispatch({ type: 'SET_STOCK', payload: entry });
  }

  function adjustStock(productId: string, delta: number) {
    dispatch({ type: 'ADJUST_STOCK', payload: { productId, delta } });
  }

  function deductSale(items: CartItem[]) {
    // Accumulate deductions per product across all cart items (products + deal contents)
    const deductions = new Map<string, number>();

    items.forEach(item => {
      if (item.product) {
        const prev = deductions.get(item.product.id) ?? 0;
        deductions.set(item.product.id, prev + item.quantity);
      }
      if (item.deal) {
        item.deal.products.forEach(p => {
          const prev = deductions.get(p.id) ?? 0;
          deductions.set(p.id, prev + item.quantity);
        });
      }
    });

    if (deductions.size > 0) {
      dispatch({
        type: 'DEDUCT_SALE',
        payload: Array.from(deductions.entries()).map(([productId, qty]) => ({
          productId,
          qty,
        })),
      });
    }
  }

  function getEntry(productId: string): StockEntry | undefined {
    return state.stock.find(s => s.productId === productId);
  }

  return (
    <InventoryContext.Provider value={{ stock: state.stock, setStock, adjustStock, deductSale, getEntry }}>
      {children}
    </InventoryContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useInventory(): InventoryContextValue {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider');
  return ctx;
}
