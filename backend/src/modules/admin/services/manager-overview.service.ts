import prisma from '../../../shared/lib/prisma';
import { toBigInt } from '../../../shared/utils/bigint';
import { BusinessDayService } from './business-day.service';

const paisaToAmount = (value: number | null | undefined) => Math.round(value ?? 0) / 100;

export class ManagerOverviewService {
  static async overview(branchId: string) {
    const branchBigInt = toBigInt(branchId);

    // ── Phase 1: fetch branch + operations + branch-scoped data in ONE parallel batch ──
    // openTills, pendingCloseTills, and kitchenOrders only need branchId, so they
    // can run alongside BusinessDayService.current() instead of waiting for it.
    // todaySales needs the resolved business date, so it runs in Phase 2.
    const [branch, operations, rawOpenTills, rawPendingCloseTills, activeKitchenOrders] = await Promise.all([
      prisma.branch.findUnique({
        where:  { id: branchBigInt },
        select: { id: true, name: true, label: true, orgId: true },
      }),
      // Pass orgId=undefined here; branch lookup above resolves it, but since
      // both run in parallel we can't share the value. The orgId shortcut inside
      // resolveCurrent still eliminates the *duplicate* branch lookup that was
      // previously happening inside branchTimezone().
      BusinessDayService.current(branchId),
      prisma.tillSession.findMany({
        where:   { branchId: branchBigInt, status: 'open', isActive: true },
        include: { terminal: true },
        orderBy: [{ openedAt: 'asc' }],
      }),
      prisma.tillSession.findMany({
        where:   { branchId: branchBigInt, status: 'pending_close_approval', isActive: true },
        include: { terminal: true },
        orderBy: [{ closeSubmittedAt: 'asc' }],
      }),
      prisma.kitchenOrder.findMany({
        where: {
          branchId: branchBigInt,
          isActive: true,
          status:   { not: 'served' },
        },
        include: { items: { where: { isActive: true } } },
        orderBy: { placedAt: 'asc' },
      }),
    ]);

    if (!branch) throw new Error('BRANCH_NOT_FOUND');

    // Only count open tills that belong to the currently active business day
    const currentBusinessDayId = operations.businessDay?.id;
    const openTills = currentBusinessDayId
      ? rawOpenTills.filter((t) => t.businessDayId === currentBusinessDayId)
      : [];
    const pendingCloseTills = currentBusinessDayId
      ? rawPendingCloseTills.filter((t) => !t.businessDayId || t.businessDayId === currentBusinessDayId)
      : rawPendingCloseTills;

    // ── Phase 2: todaySales — needs the business date resolved in Phase 1 ─────────
    // When no business day is open, fall back to the most recently CLOSED business
    // day's date rather than the shift-schedule suggestion. The shift-schedule date
    // can be wrong during night shifts (it returns the previous calendar day), which
    // causes the wrong date window and missing invoices in the snapshot.
    let businessDate = operations.businessDay?.businessDate;
    if (!businessDate) {
      const lastClosed = await prisma.businessDay.findFirst({
        where:   { branchId: branchBigInt },
        orderBy: { businessDate: 'desc' },
        select:  { businessDate: true },
      });
      businessDate = lastClosed?.businessDate ?? new Date(`${operations.suggestedBusinessDate}T00:00:00.000Z`);
    }
    const start = new Date(businessDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const todaySales = await prisma.invoice.groupBy({
      by:  ['terminalId', 'tillSessionId'],
      where: {
        branchId:      branchBigInt,
        isActive:      true,
        paymentStatus: { not: 'voided' },
        date:          { gte: start, lt: end },
      },
      _sum:  { grandTotalPaisa: true },
      _count: { id: true },
    });

    const salesByTill = new Map<string, { orders: number; sales: number }>();
    for (const row of todaySales) {
      salesByTill.set(row.tillSessionId.toString(), {
        orders: row._count.id,
        sales: paisaToAmount(row._sum.grandTotalPaisa),
      });
    }

    const tills = openTills.map((session) => {
      const sales = salesByTill.get(session.id.toString()) ?? { orders: 0, sales: 0 };
      return {
        sessionId: session.id.toString(),
        terminalId: session.terminalId.toString(),
        terminalName: session.terminal.name,
        terminalCode: session.terminal.code,
        openedBy: session.openedByName,
        openedAt: session.openedAt,
        shiftName: session.shiftName,
        businessDate: session.businessDate,
        orderCount: sales.orders,
        currentSale: sales.sales,
      };
    });

    const kitchenStatusCounts = activeKitchenOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] ?? 0) + 1;
      return acc;
    }, {});

    const totals = todaySales.reduce(
      (acc, row) => ({
        orders: acc.orders + row._count.id,
        sales: acc.sales + paisaToAmount(row._sum.grandTotalPaisa),
      }),
      { orders: 0, sales: 0 },
    );

    return {
      branch: {
        id: branch.id.toString(),
        name: branch.name,
        label: branch.label,
      },
      businessDate: start.toISOString().slice(0, 10),
      operations: {
        businessDay: operations.businessDay ? {
          id: operations.businessDay.id.toString(),
          businessDate: operations.businessDay.businessDate,
          status: operations.businessDay.status,
          openedAt: operations.businessDay.openedAt,
          openedByName: operations.businessDay.openedByName,
        } : null,
        shiftSession: operations.shiftSession ? {
          id: operations.shiftSession.id.toString(),
          name: operations.shiftSession.name,
          startTime: operations.shiftSession.startTime,
          endTime: operations.shiftSession.endTime,
          status: operations.shiftSession.status,
          openedAt: operations.shiftSession.openedAt,
          openedByName: operations.shiftSession.openedByName,
        } : null,
        suggestedBusinessDate: operations.suggestedBusinessDate,
        suggestedShift: operations.suggestedShift ? {
          id: operations.suggestedShift.id.toString(),
          name: operations.suggestedShift.name,
          startTime: operations.suggestedShift.startTime,
          endTime: operations.suggestedShift.endTime,
        } : null,
      },
      totals: {
        openTills: tills.length,
        pendingCloseTills: pendingCloseTills.length,
        totalOrders: totals.orders,
        currentSale: totals.sales,
        kitchenActiveOrders: activeKitchenOrders.length,
      },
      tills,
      pendingCloseTills: pendingCloseTills.map((session) => ({
        sessionId: session.id.toString(),
        terminalId: session.terminalId.toString(),
        terminalName: session.terminal.name,
        terminalCode: session.terminal.code,
        openedBy: session.openedByName,
        openedAt: session.openedAt,
        submittedAt: session.closeSubmittedAt,
        shiftName: session.shiftName,
        closingCashPaisa: session.closingCashPaisa,
        variance: session.variance,
        notes: session.notes,
      })),
      kitchen: {
        statusCounts: kitchenStatusCounts,
        orders: activeKitchenOrders.map((order) => ({
          id: order.id.toString(),
          orderNumber: order.orderNumber,
          orderType: order.orderType,
          status: order.status,
          terminalId: order.terminalId.toString(),
          cashierName: order.cashierName,
          placedAt: order.placedAt,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          items: order.items.map((item) => ({
            id: item.id.toString(),
            productName: item.productName,
            quantity: item.quantity,
            status: item.status,
          })),
        })),
      },
    };
  }
}
