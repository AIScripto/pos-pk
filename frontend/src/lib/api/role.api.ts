import { api } from './client';

export interface Role {
  id: string;
  orgId: string;
  name: string;
  tag: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  tag: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const roleApi = {
  list: async (): Promise<Role[]> => {
    return api.get<Role[]>('/admin/roles');
  },

  get: async (id: string): Promise<Role> => {
    return api.get<Role>(`/admin/roles/${id}`);
  },

  create: async (data: CreateRoleInput): Promise<Role> => {
    return api.post<Role>('/admin/roles', data);
  },

  update: async (id: string, data: UpdateRoleInput): Promise<Role> => {
    return api.patch<Role>(`/admin/roles/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/roles/${id}`);
  },
};
