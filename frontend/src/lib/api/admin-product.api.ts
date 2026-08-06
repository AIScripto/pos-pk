import { api } from './client';

export interface Product {
  id: string;
  orgId: string;
  categoryId: string | null;
  categoryTag?: string | null;
  categoryName?: string | null;
  name: string;
  sku: string;
  basePricePaisa: number;
  salePricePaisa: number | null;
  effectivePricePaisa?: number;
  effectiveSalePricePaisa?: number | null;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string; // SKU is auto-generated based on category tag
  basePricePaisa: number;
  salePricePaisa?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  basePricePaisa?: number;
  salePricePaisa?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export const adminProductApi = {
  list: async (): Promise<Product[]> => {
    return api.get<Product[]>('/admin/products');
  },

  get: async (id: string): Promise<Product> => {
    return api.get<Product>(`/admin/products/${id}`);
  },

  create: async (data: CreateProductInput): Promise<Product> => {
    return api.post<Product>('/admin/products', data);
  },

  update: async (id: string, data: UpdateProductInput): Promise<Product> => {
    return api.patch<Product>(`/admin/products/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/products/${id}`);
  },

  // Preview next SKU for a category before creating
  getNextSku: async (categoryId: string): Promise<string> => {
    const res = await api.get<{ sku: string }>(`/admin/products/sku/next/${categoryId}`);
    return res.sku;
  },
};
