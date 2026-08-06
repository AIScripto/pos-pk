import { api } from './client';

export interface FoodType {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodTypeInput {
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFoodTypeInput {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const adminFoodTypeApi = {
  list: async (): Promise<FoodType[]> => {
    return api.get<FoodType[]>('/admin/food-types');
  },

  get: async (id: string): Promise<FoodType> => {
    return api.get<FoodType>(`/admin/food-types/${id}`);
  },

  create: async (data: CreateFoodTypeInput): Promise<FoodType> => {
    return api.post<FoodType>('/admin/food-types', data);
  },

  update: async (id: string, data: UpdateFoodTypeInput): Promise<FoodType> => {
    return api.patch<FoodType>(`/admin/food-types/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/food-types/${id}`);
  },
};
