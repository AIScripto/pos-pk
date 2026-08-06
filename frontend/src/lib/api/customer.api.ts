import { api } from './client';

export interface ApiCustomer {
  id:              string;
  orgId:           string;
  name:            string;
  phone:           string;
  email:           string | null;
  loyaltyPoints:   number;
  lifetimePoints:  number;
  totalSpentPaisa: number;
  tierId:          string | null;
  smsOptIn:        boolean;
  isActive:        boolean;
  createdAt:       string;
}

export const customerApi = {
  search(params: { phone?: string; name?: string; page?: number; limit?: number }) {
    return api.get<ApiCustomer[]>('/customers', params as Record<string, string | number | undefined>);
  },

  getByPhone(phone: string) {
    return api.get<ApiCustomer>(`/customers/phone/${encodeURIComponent(phone)}`);
  },

  getById(id: string) {
    return api.get<ApiCustomer>(`/customers/${id}`);
  },

  create(data: Pick<ApiCustomer, 'name' | 'phone'> & Partial<ApiCustomer>) {
    return api.post<ApiCustomer>('/customers', data);
  },

  update(id: string, data: Partial<ApiCustomer>) {
    return api.patch<ApiCustomer>(`/customers/${id}`, data);
  },

  loyaltyHistory(id: string) {
    return api.get<{ customer: ApiCustomer; transactions: unknown[] }>(`/customers/${id}/loyalty`);
  },
};
