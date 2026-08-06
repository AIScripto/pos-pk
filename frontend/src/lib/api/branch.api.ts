import { api } from './client';

export interface Branch {
  id: string;
  orgId: string;
  brandId: string;
  cityId: string;
  areaId: string | null;
  label: string;
  name: string;
  phone?: string;
  email?: string;
  managerId?: string;
  openTime: string;
  closeTime: string;
  addrLine1: string;
  addrLine2?: string;
  addrArea: string;
  addrCity: string;
  addrState: string;
  addrCountry: string;
  addrPostCode: string;
  addrLat?: number;
  addrLng?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  city?: {
    id: string;
    code: string;
    name: string;
  };
  area?: {
    id: string;
    tag: string;
    name: string;
  } | null;
}

export interface CreateBranchInput {
  brandId: string;
  cityId: string;
  areaId?: string;
  label: string;
  name: string;
  phone?: string;
  email?: string;
  managerId?: string;
  openTime?: string;
  closeTime?: string;
  addrLine1?: string;
  addrLine2?: string;
  addrArea?: string;
  addrCity?: string;
  addrState?: string;
  addrCountry?: string;
  addrPostCode?: string;
  addrLat?: number;
  addrLng?: number;
}

export interface UpdateBranchInput {
  label?: string;
  name?: string;
  areaId?: string | null;
  phone?: string;
  email?: string;
  managerId?: string;
  openTime?: string;
  closeTime?: string;
  addrLine1?: string;
  addrLine2?: string;
  addrArea?: string;
  addrCity?: string;
  addrState?: string;
  addrCountry?: string;
  addrPostCode?: string;
  addrLat?: number;
  addrLng?: number;
  isActive?: boolean;
}

export const branchApi = {
  list: (cityId?: string, search?: string): Promise<Branch[]> => {
    const params: Record<string, string> = {};
    if (cityId) params['cityId'] = cityId;
    if (search) params['search'] = search;
    return api.get<Branch[]>('/admin/branches', params);
  },

  get: (id: string): Promise<Branch> => {
    return api.get<Branch>(`/admin/branches/${id}`);
  },

  create: (data: CreateBranchInput): Promise<Branch> => {
    return api.post<Branch>('/admin/branches', data);
  },

  update: (id: string, data: UpdateBranchInput): Promise<Branch> => {
    return api.patch<Branch>(`/admin/branches/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return api.delete<void>(`/admin/branches/${id}`);
  },
};
