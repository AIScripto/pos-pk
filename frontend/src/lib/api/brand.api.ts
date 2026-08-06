import { api } from './client';

export interface Brand {
  id: string;
  orgId: string;
  name: string;
  tag: string;
  logo?: string;
  tagline?: string;
  primaryColor?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandInput {
  name: string;
  tag: string;
  tagline?: string;
  primaryColor?: string;
  logo?: string;
}

export interface UpdateBrandInput {
  name?: string;
  tagline?: string;
  primaryColor?: string;
  logo?: string;
  isActive?: boolean;
}

export const brandApi = {
  list: async (): Promise<Brand[]> => {
    return api.get<Brand[]>('/admin/brands');
  },

  get: async (id: string): Promise<Brand> => {
    return api.get<Brand>(`/admin/brands/${id}`);
  },

  create: async (data: CreateBrandInput): Promise<Brand> => {
    return api.post<Brand>('/admin/brands', data);
  },

  update: async (id: string, data: UpdateBrandInput): Promise<Brand> => {
    return api.patch<Brand>(`/admin/brands/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/brands/${id}`);
  },
};
