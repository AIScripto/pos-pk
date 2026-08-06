// ─────────────────────────────────────────────────────────────────────────────
// Products & Deals — central catalogue with per-branch price overrides
// ─────────────────────────────────────────────────────────────────────────────

import type { BaseEntity } from './common.js';

export type Category =
  | 'burgers' | 'wraps' | 'chicken'
  | 'fries'   | 'drinks' | 'deals' | 'other';

export const CATEGORY_LABELS: Record<Category, string> = {
  burgers: 'Burgers',
  wraps:   'Wraps',
  chicken: 'Chicken',
  fries:   'Fries',
  drinks:  'Drinks',
  deals:   'Deals',
  other:   'Other',
};

// ── Product ───────────────────────────────────────────────────────────────────

export interface Product extends BaseEntity {
  orgId:           string;
  name:            string;
  code:            string;          // SKU
  /** Base price in paisa (smallest currency unit). */
  basePricePaisa:  number;
  /** Discounted price in paisa — set when a product-level discount is active. */
  salePricePaisa:  number | null;
  category:        Category;
  image:           string;
  description:     string;
  isFeatured:      boolean;
  sortOrder:       number;
}

/** Per-branch price override — lets a branch charge differently from HQ base price */
export interface ProductBranchConfig extends BaseEntity {
  productId:       string;
  branchId:        string;
  pricePaisa:      number;          // overridden price for this branch
  salePricePaisa:  number | null;
}

// ── Deal (bundle) ─────────────────────────────────────────────────────────────

export interface Deal extends BaseEntity {
  orgId:            string;
  name:             string;
  code:             string;
  /** Deal selling price in paisa */
  pricePaisa:       number;
  /** Sum of individual product prices — used to show savings */
  originalPricePaisa: number;
  image:            string;
  description:      string;
  products:         DealProduct[];
}

export interface DealProduct {
  productId: string;
  productName: string;   // denormalised for display
  quantity:  number;
}

// ── Cart types ────────────────────────────────────────────────────────────────

export interface CartItem {
  id:              string;   // unique cart item id
  product?:        Product;
  deal?:           Deal;
  quantity:        number;
  discountPercent: number;
  lumpSumDiscount: number;   // paisa
}

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateProductDTO {
  orgId:          string;
  name:           string;
  code:           string;
  basePricePaisa: number;
  salePricePaisa?: number;
  category:       Category;
  image:          string;
  description?:   string;
  isFeatured?:    boolean;
  sortOrder?:     number;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}
