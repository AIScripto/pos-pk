// =============================================================================
// Area API — client for area management endpoints
// =============================================================================

import { api } from './client';

export interface Area {
  id: string;
  cityId: string;
  tag: string;
  name: string;
  details: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAreaInput {
  cityId: string;
  tag: string;
  name: string;
  details?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface UpdateAreaInput {
  tag?: string;
  name?: string;
  details?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export const areaApi = {
  list(cityId: string, search?: string) {
    return api.get<Area[]>('/admin/areas', { cityId, search });
  },

  get(id: string) {
    return api.get<Area>(`/admin/areas/${id}`);
  },

  create(data: CreateAreaInput) {
    return api.post<Area>('/admin/areas', data);
  },

  update(id: string, data: UpdateAreaInput) {
    return api.patch<Area>(`/admin/areas/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/admin/areas/${id}`);
  },
};
