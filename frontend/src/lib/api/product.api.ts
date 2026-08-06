import { api } from './client';

export interface ApiProduct {
  id:                      string;
  orgId:                   string;
  name:                    string;
  sku:                     string;
  category:                string;
  basePricePaisa:          number;
  salePricePaisa:          number | null;
  effectivePricePaisa:     number;
  effectiveSalePricePaisa: number | null;
  stockQty:                number;
  minThreshold:            number;
  description:             string | null;
  imageUrl:                string | null;
  sortOrder:               number;
  isActive:                boolean;
}

export const productApi = {
  list(orgId: string, branchId: string) {
    return api.get<ApiProduct[]>('/products', { orgId, branchId });
  },

  create(data: Partial<ApiProduct>) {
    return api.post<ApiProduct>('/products', data);
  },

  update(id: string, data: Partial<ApiProduct>) {
    return api.patch<ApiProduct>(`/products/${id}`, data);
  },

  remove(id: string) {
    return api.delete<void>(`/products/${id}`);
  },
};
