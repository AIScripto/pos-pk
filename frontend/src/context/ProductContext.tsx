import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, Deal, Category } from '@/types/pos';
import { products as seedProducts, deals as seedDeals } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { useOffline } from '@/sync';
import { adminProductApi, Product as AdminProduct } from '@/lib/api/admin-product.api';
import { adminDealApi, Deal as AdminDeal } from '@/lib/api/admin-deal.api';
import { adminCategoryApi, Category as AdminCategory } from '@/lib/api/admin-category.api';
import burgerImg from '@/assets/burger.jpg';
import comboImg from '@/assets/combo.jpg';

// ─── State & Actions ─────────────────────────────────────────────────────────

interface ProductState {
  categories: AdminCategory[];
  products: Product[];
  deals: Deal[];
}

type ProductAction =
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_DEAL'; payload: Deal }
  | { type: 'UPDATE_DEAL'; payload: Deal }
  | { type: 'DELETE_DEAL'; payload: string }
  | { type: 'SET_PRODUCTS_AND_DEALS'; payload: { products: Product[]; deals: Deal[]; categories: AdminCategory[] } };

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) };
    case 'ADD_DEAL':
      return { ...state, deals: [...state.deals, action.payload] };
    case 'UPDATE_DEAL':
      return {
        ...state,
        deals: state.deals.map(d => d.id === action.payload.id ? action.payload : d),
      };
    case 'DELETE_DEAL':
      return { ...state, deals: state.deals.filter(d => d.id !== action.payload) };
    case 'SET_PRODUCTS_AND_DEALS':
      return {
        ...state,
        categories: action.payload.categories,
        products: action.payload.products,
        deals: action.payload.deals,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProductContextValue {
  categories: AdminCategory[];
  products: Product[];
  deals: Deal[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id'>) => void;
  updateDeal: (deal: Deal) => void;
  deleteDeal: (id: string) => void;
  syncProductsOnline: () => Promise<void>;
}

const ProductContext = createContext<ProductContextValue | null>(null);

const STORAGE_KEY = 'pos-app-products-v3';

function loadState(): ProductState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProductState;
      if (Array.isArray(parsed.products) && Array.isArray(parsed.deals)) {
        // Filter out legacy hardcoded mock seed products if present
        const realProducts = parsed.products.filter((p) => !p.id.startsWith('prod_'));
        const realDeals = parsed.deals.filter((d) => !d.id.startsWith('deal_'));
        return { categories: parsed.categories || [], products: realProducts, deals: realDeals };
      }
    }
  } catch {
    // ignore
  }
  return { categories: [], products: [], deals: [] };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, undefined, loadState);
  const { user } = useAuth();
  const { isOnline } = useOffline();

  const syncProductsOnline = React.useCallback(async () => {
    if (!isOnline || !user) return;

    try {
      const [categoriesRes, productsRes, dealsRes] = await Promise.allSettled([
        adminCategoryApi.list(),
        adminProductApi.list(),
        adminDealApi.list(),
      ]);

      const backendCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
      const backendProducts   = productsRes.status === 'fulfilled' ? productsRes.value : [];
      const backendDeals      = dealsRes.status === 'fulfilled'    ? dealsRes.value : [];

      // Map products
      const mappedProducts: Product[] = backendProducts.map((p: AdminProduct) => {
        const cat = p.categoryName || 'Uncategorized';

        return {
          id: p.id,
          name: p.name,
          code: p.sku,
          price: (p.effectiveSalePricePaisa ?? p.effectivePricePaisa) / 100,
          originalPrice: p.effectiveSalePricePaisa ? p.effectivePricePaisa / 100 : undefined,
          category: cat,
          image: p.imageUrl || burgerImg,
          description: p.description || '',
        };
      });

      // Filter active deals and map
      const activeDeals = backendDeals.filter((d: AdminDeal) => d.isActive);
      const mappedDeals: Deal[] = activeDeals.map((d: AdminDeal) => {
        const cat: Category | undefined = d.categoryName || undefined;

        return {
          id: d.id,
          name: d.name,
          code: d.tag,
          price: (d.salePricePaisa ?? d.basePricePaisa) / 100,
          originalPrice: d.basePricePaisa / 100,
          image: comboImg,
          description: d.description || '',
          categoryId: d.categoryId || null,
          category: cat,
          availabilityType: d.availabilityType,
          availableDays: d.availableDays,
          startTime: d.startTime,
          endTime: d.endTime,
          products: (d.productIds || [])
            .map((pid: string) => mappedProducts.find((p) => p.id === pid))
            .filter((p): p is Product => p !== undefined),
        };
      });

      dispatch({
        type: 'SET_PRODUCTS_AND_DEALS',
        payload: { categories: backendCategories, products: mappedProducts, deals: mappedDeals },
      });
    } catch (err) {
      console.warn('Failed to fetch live products/deals online:', err);
    }
  }, [isOnline, user]);

  // Save changes locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable
    }
  }, [state]);

  // Auto-sync products on mount, connection restored, or periodically (30s)
  useEffect(() => {
    if (!user) return;
    
    syncProductsOnline();

    const interval = setInterval(() => {
      syncProductsOnline();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, syncProductsOnline]);

  const value: ProductContextValue = {
    categories: state.categories,
    products: state.products,
    deals: state.deals,
    addProduct: (p) =>
      dispatch({ type: 'ADD_PRODUCT', payload: { ...p, id: `prod_${Date.now()}` } }),
    updateProduct: (p) => dispatch({ type: 'UPDATE_PRODUCT', payload: p }),
    deleteProduct: (id) => dispatch({ type: 'DELETE_PRODUCT', payload: id }),
    addDeal: (d) =>
      dispatch({ type: 'ADD_DEAL', payload: { ...d, id: `deal_${Date.now()}` } }),
    updateDeal: (d) => dispatch({ type: 'UPDATE_DEAL', payload: d }),
    deleteDeal: (id) => dispatch({ type: 'DELETE_DEAL', payload: id }),
    syncProductsOnline,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProducts(): ProductContextValue {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider');
  return ctx;
}
