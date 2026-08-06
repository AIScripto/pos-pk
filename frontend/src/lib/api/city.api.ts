// =============================================================================
// City API Client — endpoints for city management
// =============================================================================

import { api } from './client';

export interface City {
  id: string;
  code: string;
  name: string;
  stateId?: string;
  latitude: number | null;
  longitude: number | null;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityInput {
  name: string;
  code: string;
  stateId?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateCityInput {
  name?: string;
  code?: string;
  stateId?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export const cityApi = {
  /**
   * Get all cities for the current organization
   */
  list() {
    return api.get<City[]>('/admin/cities');
  },

  /**
   * Get a specific city by ID
   */
  get(id: string) {
    return api.get<City>(`/admin/cities/${id}`);
  },

  /**
   * Create a new city
   */
  create(data: CreateCityInput) {
    return api.post<City>('/admin/cities', data);
  },

  /**
   * Update an existing city
   */
  update(id: string, data: UpdateCityInput) {
    return api.patch<City>(`/admin/cities/${id}`, data);
  },

  /**
   * Soft delete a city
   */
  delete(id: string) {
    return api.delete(`/admin/cities/${id}`);
  },
};
