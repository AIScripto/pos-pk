// =============================================================================
// HeldOrder Service — branch-shared cart snapshots; any till can resume
// =============================================================================

import prisma from '../../../shared/lib/prisma';
import { toBigInt } from '../../../shared/utils/bigint';

export interface CreateHeldOrderInput {
  orgId:          string;
  cityId:         string;
  branchId:       string;
  terminalId:     string;
  cashierId:      string;
  label:          string;
  itemsJson:      string;           // JSON-encoded CartItem[]
  activeCustomerJson?: string;      // JSON-encoded ActiveCustomer | null
  orderType:      string;
  tableId?:       string;
  tableName?:     string;
  covers?:        number;
  customerId?:    string;
  customerName?:  string;
  customerPhone?: string;
  orderNotes?:    string;
}

export class HeldOrderService {

  static async create(input: CreateHeldOrderInput) {
    return prisma.heldOrder.create({
      data: {
        orgId:               toBigInt(input.orgId),
        cityId:              toBigInt(input.cityId),
        branchId:            toBigInt(input.branchId),
        terminalId:          toBigInt(input.terminalId),
        cashierId:           input.cashierId,
        label:               input.label,
        itemsJson:           JSON.parse(input.itemsJson),
        activeCustomerJson:  input.activeCustomerJson ?? null,
        orderType:           input.orderType,
        tableId:             input.tableId ? toBigInt(input.tableId) : null,
        tableName:           input.tableName  ?? null,
        covers:              input.covers     ?? null,
        customerId:          input.customerId    ?? null,
        customerName:        input.customerName  ?? null,
        customerPhone:       input.customerPhone ?? null,
        orderNotes:          input.orderNotes    ?? null,
        createdBy:           input.cashierId,
      },
    });
  }

  /** All active held orders for a branch — any till can see and resume these */
  static async list(branchId: string) {
    return prisma.heldOrder.findMany({
      where:   { branchId: toBigInt(branchId), isActive: true },
      orderBy: { heldAt: 'desc' },
    });
  }

  /** Soft-delete (resume or discard) */
  static async remove(id: string) {
    return prisma.heldOrder.update({
      where: { id: toBigInt(id) },
      data:  { isActive: false },
    });
  }
}
