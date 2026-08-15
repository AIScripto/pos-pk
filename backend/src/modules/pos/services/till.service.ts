// ─────────────────────────────────────────────────────────────────────────────
// Till Service — open/close till, compute summary
// ─────────────────────────────────────────────────────────────────────────────

import prisma from '../../../shared/lib/prisma';
import { Prisma } from '@prisma/client';
import { toBigInt } from '../../../shared/utils/bigint';

export class TillService {
  private static async appendLog(input: {
    tillSessionId: bigint;
    terminalId: bigint;
    userId: string;
    userName: string;
    action: string;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }, tx?: any) {
    const client = tx || prisma;
    try {
      await client.tillSessionLog.create({
        data: {
          tillSessionId: input.tillSessionId,
          terminalId:    input.terminalId,
          userId:        input.userId,
          userName:      input.userName,
          action:        input.action,
          notes:         input.notes ?? undefined,
          metadata:      (input.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    } catch (err) {
      console.warn('Till session log was not written', err);
    }
  }

  static async open(input: {
    orgId:        string;
    cityId:       string;
    branchId:     string;
    terminalId:   string;
    openedBy:     string;
    openedByName: string;
    openingCashAmount:   number;
    openingDenomJson:    string;
    notes?:       string;
  }, tx?: any) {
    const client = tx || prisma;
    const terminal = await client.terminal.findFirst({
      where: {
        id:       toBigInt(input.terminalId),
        branchId: toBigInt(input.branchId),
        isActive: true,
      },
      select: { id: true },
    });
    if (!terminal) throw new Error('TILL_DISABLED');

    // Ensure no already-open session on this terminal
    const existing = await client.tillSession.findFirst({
      where: { terminalId: toBigInt(input.terminalId), status: 'open', isActive: true },
    });
    if (existing) {
      await this.appendLog({
        tillSessionId: existing.id,
        terminalId:    existing.terminalId,
        userId:        input.openedBy,
        userName:      input.openedByName,
        action:        existing.openedBy === input.openedBy ? 'REJOINED' : 'JOINED',
        notes:         input.notes,
        metadata:      { source: 'open_existing_till' },
      }, tx);
      return existing;
    }

    const branch = await client.branch.findUnique({
      where: { id: toBigInt(input.branchId) },
      select: { id: true, orgId: true, cityId: true },
    });
    if (!branch) throw new Error('BRANCH_NOT_FOUND');

    const orgId = branch.orgId;
    const cityId = branch.cityId;

    let businessDay = await client.businessDay.findFirst({
      where: { branchId: toBigInt(input.branchId), status: 'open' },
    });
    if (!businessDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      businessDay = await client.businessDay.create({
        data: {
          orgId,
          cityId,
          branchId:     toBigInt(input.branchId),
          businessDate: today,
          status:       'open',
          openedBy:     input.openedBy || 'system',
          openedByName: input.openedByName || 'Cashier',
        },
      });
    }

    let shiftSession = await client.shiftSession.findFirst({
      where: { branchId: toBigInt(input.branchId), businessDayId: businessDay.id, status: 'open' },
      include: { shiftTemplate: true },
    });
    if (!shiftSession) {
      let shiftTemplate = await client.shiftTemplate.findFirst({
        where: { branchId: toBigInt(input.branchId), isActive: true },
      });
      if (!shiftTemplate) {
        shiftTemplate = await client.shiftTemplate.create({
          data: {
            branchId:  toBigInt(input.branchId),
            name:      'Full Day Shift',
            startTime: '00:00',
            endTime:   '23:59',
            isActive:  true,
            createdBy: input.openedBy || 'system',
          },
        });
      }

      shiftSession = await client.shiftSession.create({
        data: {
          businessDayId:   businessDay.id,
          branchId:        toBigInt(input.branchId),
          shiftTemplateId: shiftTemplate.id,
          name:            shiftTemplate.name,
          startTime:       shiftTemplate.startTime,
          endTime:         shiftTemplate.endTime,
          status:          'open',
          openedBy:        input.openedBy || 'system',
          openedByName:    input.openedByName || 'Cashier',
        },
        include: { shiftTemplate: true },
      });
    }

    const session = await client.tillSession.create({
      data: {
        orgId,
        cityId,
        branchId:         toBigInt(input.branchId),
        terminalId:       toBigInt(input.terminalId),
        businessDayId:    businessDay.id,
        shiftSessionId:   shiftSession.id,
        shiftTemplateId:  shiftSession.shiftTemplateId,
        shiftName:        shiftSession.name,
        businessDate:     businessDay.businessDate,
        openedBy:         input.openedBy || 'system',
        openedByName:     input.openedByName || 'Cashier',
        openingCashPaisa: Math.round(Number(input.openingCashAmount) || 0),
        openingDenom:     input.openingDenomJson,
        notes:            input.notes,
        createdBy:        input.openedBy || 'system',
      },
    });

    await this.appendLog({
      tillSessionId: session.id,
      terminalId:    session.terminalId,
      userId:        input.openedBy,
      userName:      input.openedByName,
      action:        'OPENED',
      notes:         input.notes,
      metadata:      { openingCashAmount: input.openingCashAmount },
    }, tx);

    return session;
  }

  static async close(input: {
    sessionId:          string;
    closedBy:           string;
    closedByName:       string;
    closingDenomJson:   string;
    closingCashAmount:  number;
    notes?:             string;
  }, tx?: any) {
    const client = tx || prisma;
    const session = await client.tillSession.findUnique({
      where: { id: toBigInt(input.sessionId) },
    });
    if (!session)              throw new Error('SESSION_NOT_FOUND');
    if (session.status !== 'open') throw new Error('TILL_NOT_OPEN');

    // Auto-settle any open kitchen orders for this till session upon closing
    const invoices = await client.invoice.findMany({
      where: {
        tillSessionId: toBigInt(input.sessionId),
        isActive: true,
      },
      select: { id: true },
    });
    const invoiceIds = invoices.map((i) => i.id);

    if (invoiceIds.length > 0) {
      await client.kitchenOrder.updateMany({
        where: {
          invoiceId: { in: invoiceIds },
          status: { not: 'served' },
        },
        data: {
          status:   'served',
          servedAt: new Date(),
        },
      });
    }

    // Calculate expected cash = opening + all cash sales in this session
    const cashSalesAgg = await client.invoice.aggregate({
      where: {
        tillSessionId: toBigInt(input.sessionId),
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        isActive:      true,
      },
      _sum: { grandTotalPaisa: true },
    });
    const cashSalesPaisa = cashSalesAgg._sum.grandTotalPaisa ?? 0;
    const expectedCash   = session.openingCashPaisa + cashSalesPaisa;
    const variance       = input.closingCashAmount - expectedCash;

    const pendingSession = await client.tillSession.update({
      where: { id: toBigInt(input.sessionId) },
      data: {
        status:           'pending_close_approval',
        closeSubmittedAt: new Date(),
        closeSubmittedBy: input.closedBy,
        closedBy:         input.closedBy,
        closedByName:     input.closedByName,
        closingCashPaisa: input.closingCashAmount,
        closingDenom:     input.closingDenomJson,
        variance,
        notes:            input.notes,
        updatedAt:        new Date(),
      },
    });

    await this.appendLog({
      tillSessionId: pendingSession.id,
      terminalId:    pendingSession.terminalId,
      userId:        input.closedBy,
      userName:      input.closedByName,
      action:        'CLOSE_SUBMITTED',
      notes:         input.notes,
      metadata: {
        closingCashAmount: input.closingCashAmount,
        expectedCashAmount: expectedCash,
        cashVarianceAmount: variance,
        },
    }, tx);

    return pendingSession;
  }

  /** Full till summary for reporting */
  static async summary(sessionId: string) {
    const sessionIdBig = toBigInt(sessionId);

    const [session, totalsAgg, paymentBreakdown, categorySales, txCount] = await Promise.all([
      prisma.tillSession.findUnique({ where: { id: sessionIdBig } }),

      // Gross financial totals
      prisma.invoice.aggregate({
        where: { tillSessionId: sessionIdBig, isActive: true },
        _sum: { grandTotalPaisa: true, totalDiscountPaisa: true, taxPaisa: true, covers: true },
        _count: { id: true },
      }),

      // Per-payment-method breakdown
      prisma.invoice.groupBy({
        by: ['paymentMethod', 'paymentStatus'],
        where: { tillSessionId: sessionIdBig, isActive: true },
        _sum: { grandTotalPaisa: true },
      }),

      // Category breakdown via InvoiceItem
      prisma.invoiceItem.groupBy({
        by: ['category'],
        where: { invoice: { tillSessionId: sessionIdBig, isActive: true }, isActive: true },
        _sum: { lineTotalPaisa: true, quantity: true },
        _count: { id: true },
        orderBy: { _sum: { lineTotalPaisa: 'desc' } },
      }),

      // Distinct invoice count (for totalTransactions)
      prisma.invoice.count({ where: { tillSessionId: sessionIdBig, isActive: true } }),
    ]);

    if (!session) throw new Error('SESSION_NOT_FOUND');

    const grossSalesPaisa    = totalsAgg._sum.grandTotalPaisa    ?? 0;
    const totalDiscountPaisa = totalsAgg._sum.totalDiscountPaisa ?? 0;
    const totalTaxPaisa      = totalsAgg._sum.taxPaisa           ?? 0;
    const totalCovers        = totalsAgg._sum.covers             ?? 0;

    let cashSalesPaisa = 0, cardSalesPaisa = 0, walletSalesPaisa = 0, codPendingPaisa = 0;
    for (const row of paymentBreakdown) {
      const amount = row._sum.grandTotalPaisa ?? 0;
      if (row.paymentStatus === 'paid') {
        if (row.paymentMethod === 'cash')   cashSalesPaisa   += amount;
        if (row.paymentMethod === 'card')   cardSalesPaisa   += amount;
        if (row.paymentMethod === 'wallet') walletSalesPaisa += amount;
      }
      if (row.paymentStatus === 'pending') codPendingPaisa += amount;
    }

    const openingCashPaisa  = session.openingCashPaisa;
    const expectedCashPaisa = openingCashPaisa + cashSalesPaisa;
    const actualCashPaisa   = session.closingCashPaisa ?? undefined;

    return {
      session,
      grossSalesPaisa,
      totalDiscountPaisa,
      totalTaxPaisa,
      netSalesPaisa:    grossSalesPaisa - totalDiscountPaisa,
      totalTransactions: txCount,
      totalCovers,
      cashSalesPaisa,
      cardSalesPaisa,
      walletSalesPaisa,
      codPendingPaisa,
      categorySales: categorySales.map((row) => ({
        category:         row.category,
        totalSalesPaisa:  row._sum.lineTotalPaisa  ?? 0,
        itemCount:        row._sum.quantity        ?? 0,
        transactionCount: row._count.id,
      })),
      openingCashPaisa,
      expectedCashPaisa,
      actualCashPaisa,
      variance: actualCashPaisa !== undefined ? actualCashPaisa - expectedCashPaisa : undefined,
    };
  }

  static async current(terminalId: string) {
    return prisma.tillSession.findFirst({
      where: { terminalId: toBigInt(terminalId), status: 'open', isActive: true },
    });
  }

  static async history(branchId: string, limit = 20) {
    return prisma.tillSession.findMany({
      where:   { branchId: toBigInt(branchId), isActive: true },
      orderBy: { openedAt: 'desc' },
      take:    limit,
    });
  }
}
