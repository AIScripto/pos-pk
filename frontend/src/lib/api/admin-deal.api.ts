import { api } from './client';

export interface Deal {
  id: string;
  orgId: string;
  categoryId?: string | null;
  categoryName?: string | null;
  name: string;
  tag: string;
  description: string | null;
  productIds?: string[];
  basePricePaisa: number;
  salePricePaisa: number | null;
  discountPercentage: number | null;
  availabilityType?: 'all_time' | 'scheduled';
  availableDays?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealInput {
  name: string;
  tag: string;
  categoryId?: string | null;
  description?: string | null;
  productIds?: string[];
  basePricePaisa: number;
  salePricePaisa?: number | null;
  discountPercentage?: number | null;
  availabilityType?: 'all_time' | 'scheduled';
  availableDays?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateDealInput {
  name?: string;
  tag?: string;
  categoryId?: string | null;
  description?: string | null;
  productIds?: string[];
  basePricePaisa?: number;
  salePricePaisa?: number | null;
  discountPercentage?: number | null;
  availabilityType?: 'all_time' | 'scheduled';
  availableDays?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isActive?: boolean;
}

export const adminDealApi = {
  list: async (): Promise<Deal[]> => {
    return api.get<Deal[]>('/admin/deals');
  },

  get: async (id: string): Promise<Deal> => {
    return api.get<Deal>(`/admin/deals/${id}`);
  },

  create: async (data: CreateDealInput): Promise<Deal> => {
    return api.post<Deal>('/admin/deals', data);
  },

  update: async (id: string, data: UpdateDealInput): Promise<Deal> => {
    return api.patch<Deal>(`/admin/deals/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/deals/${id}`);
  },
};
