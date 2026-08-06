import { api } from './client';

export interface State {
  id: string;
  tag: string;
  name: string;
  code: string;
  zipCode?: string;
  country: string;
  region?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStateInput {
  tag: string;
  name: string;
  code?: string;
  zipCode?: string;
  country?: string;
  region?: string;
  isActive?: boolean;
}

export type UpdateStateInput = Partial<CreateStateInput>;

export const stateApi = {
  /**
   * List all states for the organization
   */
  list: async (): Promise<State[]> => {
    return api.get<State[]>('/admin/states');
  },

  /**
   * Get a single state by ID
   */
  get: async (id: string): Promise<State> => {
    return api.get<State>(`/admin/states/${id}`);
  },

  /**
   * Create a new state
   */
  create: async (data: CreateStateInput): Promise<State> => {
    return api.post<State>('/admin/states', data);
  },

  /**
   * Update an existing state
   */
  update: async (id: string, data: UpdateStateInput): Promise<State> => {
    return api.patch<State>(`/admin/states/${id}`, data);
  },

  /**
   * Delete (soft delete) a state
   */
  delete: async (id: string): Promise<void> => {
    return api.delete(`/admin/states/${id}`);
  },
};
