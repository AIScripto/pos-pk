// =============================================================================
// HeldOrder API — branch-shared cart snapshots (any till can resume)
// =============================================================================

import { api } from './client';
import type { CartItem, ActiveCustomer } from '@/types/pos';

export interface ServerHeldOrder {
  id:                  string;
  branchId:            string;
  terminalId:          string;
  cashierId:           string;
  label:               string;
  itemsJson:           CartItem[];        // stored as JSON, cast back on read
  activeCustomerJson:  ActiveCustomer | null;
  orderType:           string;
  tableId?:            string | null;
  tableName?:          string | null;
  customerId?:         string | null;
  customerName?:       string | null;
  customerPhone?:      string | null;
  heldAt:              string;
}

export const heldOrderApi = {
  list() {
    return api.get<ServerHeldOrder[]>('/held-orders');
  },

  create(data: {
    label:              string;
    itemsJson:          string;   // JSON.stringify(CartItem[])
    activeCustomerJson?: string;  // JSON.stringify(ActiveCustomer | null)
    orderType:          string;
    tableId?:           string;
    tableName?:         string;
    covers?:            number;
    customerId?:        string;
    customerName?:      string;
    customerPhone?:     string;
    orderNotes?:        string;
  }) {
    return api.post<ServerHeldOrder>('/held-orders', data);
  },

  remove(id: string) {
    return api.delete<void>(`/held-orders/${id}`);
  },
};
