import { api } from './client';

export interface TillConfig {
  id: string;
  branchId: string;
  name: string;
  code: string | null;
  type: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ShiftTemplate {
  id: string;
  branchId: string;
  name: string;
  startTime: string;
  endTime: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CurrentShift {
  shift: ShiftTemplate | null;
  businessDate: string;
  timezone: string;
}

export const tillConfigApi = {
  listTills(branchId: string) {
    return api.get<TillConfig[]>('/admin/tills', { branchId });
  },
  createTill(input: Partial<TillConfig> & { branchId: string; name: string }) {
    return api.post<TillConfig>('/admin/tills', input);
  },
  updateTill(id: string, input: Partial<TillConfig>) {
    return api.patch<TillConfig>(`/admin/tills/${id}`, input);
  },
  listShifts(branchId: string) {
    return api.get<ShiftTemplate[]>('/admin/shifts', { branchId });
  },
  createShift(input: Partial<ShiftTemplate> & { branchId: string; name: string; startTime: string; endTime: string }) {
    return api.post<ShiftTemplate>('/admin/shifts', input);
  },
  updateShift(id: string, input: Partial<ShiftTemplate>) {
    return api.patch<ShiftTemplate>(`/admin/shifts/${id}`, input);
  },
  currentShift(branchId: string) {
    return api.get<CurrentShift>('/admin/shifts/current', { branchId });
  },
};
