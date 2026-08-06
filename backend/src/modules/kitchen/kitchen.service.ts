// =============================================================================
// Kitchen Service — create kitchen orders from invoices, update status
// =============================================================================

import { Prisma } from '@prisma/client';
import prisma from '../../shared/lib/prisma';
import { toBigInt } from '../../shared/utils/bigint';

export type KitchenStatus = 'new' | 'acknowledged' | 'in_progress' | 'ready' | 'served';

export class KitchenService {

  /** Called by InvoiceService after creating an invoice.
   *  Creates the corresponding KitchenOrder record. */
  static async createFromInvoice(payload: {
    invoiceId:   string;
    orgId:       string;
    branchId:    string;
    terminalId:  string;
    orderNumber: string;
    orderType:   string;
    tableId?:    string | null;
    tableName?:  string | null;
    covers?:     number | null;
    cashierName: string;
    notes?:      string | null;
    items: {
      productId?:  string | null;
      productName: string;
      quantity:    number;
    }[];
  }) {
    return prisma.kitchenOrder.create({
      data: {
        invoiceId:   toBigInt(payload.invoiceId),
        orgId:       toBigInt(payload.orgId),
        branchId:    toBigInt(payload.branchId),
        terminalId:  toBigInt(payload.terminalId),
        orderNumber: payload.orderNumber,
        orderType:   payload.orderType,
        tableId:     payload.tableId  ? toBigInt(payload.tableId)  : null,
        tableName:   payload.tableName ?? null,
        covers:      payload.covers   ?? null,
        cashierName: payload.cashierName,
        notes:       payload.notes    ?? null,
        status:      'new',
        // placedAt has @default(now()) in schema — no need to set manually
        items: {
          create: payload.items.map((i) => ({
            productId:   i.productId ? toBigInt(i.productId) : null,
            productName: i.productName,
            quantity:    i.quantity,
            status:      'pending',
          })),
        },
      },
      include: { items: true },
    });
  }

  /** Return all active (not served) kitchen orders for a branch. */
  static async activeOrders(branchId: string) {
    return prisma.kitchenOrder.findMany({
      where: {
        branchId: toBigInt(branchId),
        isActive: true,
        status:   { not: 'served' },
      },
      include: { items: { where: { isActive: true } } },
      orderBy: { placedAt: 'asc' },
    });
  }

  /** Transition a kitchen order to a new status. */
  static async updateStatus(id: string, status: KitchenStatus) {
    const now = new Date();
    const timestamps: Prisma.KitchenOrderUpdateInput = {};

    if (status === 'acknowledged') timestamps.acknowledgedAt = now;
    if (status === 'in_progress')  timestamps.startedAt      = now;
    if (status === 'ready')        timestamps.readyAt        = now;
    if (status === 'served')       timestamps.servedAt       = now;

    return prisma.kitchenOrder.update({
      where:   { id: toBigInt(id) },
      data:    { status, ...timestamps },
      include: { items: { where: { isActive: true } } },
    });
  }

  /** Mark a single item as done. */
  static async markItemDone(itemId: string) {
    return prisma.kitchenOrderItem.update({
      where: { id: toBigInt(itemId) },
      data:  { status: 'done' },
    });
  }
}
