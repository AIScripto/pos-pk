import { api } from './client';

export interface User {
  id:        string;
  orgId:     string;
  username:  string;
  name:      string;
  email:     string | null;
  phone?:    string | null;
  role?:     string | null;
  roleTag?:  string | null;
  roleId?:   string | null;
  /** Populated for branch-scoped roles (manager, cashier, kitchen) */
  branchId?: string | null;
  /** True when pinHash is set — backend never exposes the raw hash */
  hasPin?:   boolean;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  username:  string;
  name:      string;
  email:     string;
  phone?:    string;
  roleId:    string;
  branchId?: string;
  /** 4-digit PIN — required for cashier/kitchen, optional for manager */
  pin?:      string;
  password?: string;
}

export interface UpdateUserInput {
  name?:     string;
  phone?:    string;
  roleId?:   string;
  branchId?: string;
  isActive?: boolean;
  /** Provide to change the PIN; omit to leave unchanged */
  pin?:      string;
  password?: string;
}

export const userApi = {
  list: () => api.get<User[]>('/admin/users'),
  get:  (id: string) => api.get<User>(`/admin/users/${id}`),
  create: (data: CreateUserInput) => api.post<User>('/admin/users', data),
  update: (id: string, data: UpdateUserInput) => api.patch<User>(`/admin/users/${id}`, data),
  delete: (id: string) => api.delete<void>(`/admin/users/${id}`),
  setPin:   (id: string, pin: string) => api.patch<{ message: string }>(`/admin/users/${id}/pin`, { pin }),
  clearPin: (id: string) => api.delete<{ message: string }>(`/admin/users/${id}/pin`),
  suggestUsername: (roleTag: string) =>
    api.get<{ username: string }>('/admin/users/suggest-username', { roleTag }),
};
