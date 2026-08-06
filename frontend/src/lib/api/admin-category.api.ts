import { api } from './client';

export interface Category {
  id: string;
  orgId: string;
  foodTypeId: string | null;
  name: string;
  tag: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  tag: string;
  foodTypeId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  tag?: string;
  foodTypeId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export const adminCategoryApi = {
  list: async (): Promise<Category[]> => {
    return api.get<Category[]>('/admin/categories');
  },

  get: async (id: string): Promise<Category> => {
    return api.get<Category>(`/admin/categories/${id}`);
  },

  create: async (data: CreateCategoryInput): Promise<Category> => {
    return api.post<Category>('/admin/categories', data);
  },

  update: async (id: string, data: UpdateCategoryInput): Promise<Category> => {
    return api.patch<Category>(`/admin/categories/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/categories/${id}`);
  },
};
