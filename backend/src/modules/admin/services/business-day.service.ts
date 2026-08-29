import { Prisma } from '@prisma/client';
import prisma from '../../../shared/lib/prisma';
import { toBigInt } from '../../../shared/utils/bigint';
import { ShiftScheduleService } from '../../pos/services/shift-schedule.service';
import { toJsonText } from '../../../shared/utils/json-column';

const ACTIVE_TILL_STATUSES = ['open', 'pending_close_approval'];

type TillSessionMeta = Prisma.TillSessionGetPayload<{
  include: { terminal: true };
}>;

/** DB-level aggregation — replaces the old JS `summarizeTills` that loaded all
 *  invoices into memory. Two parallel groupBy queries cover all the same metrics. */
async function dbSummarizeTills(tillSessions: TillSessionMeta[]) {
  const emptyTotals = () => ({
    invoiceCount: 0, grossSalesPaisa: 0, netSalesPaisa: 0,
    totalDiscountPaisa: 0, totalTaxPaisa: 0,
    cashSalesPaisa: 0, cardSalesPaisa: 0, walletSalesPaisa: 0, codPendingPaisa: 0,
    openingCashPaisa: 0, expectedCashPaisa: 0, actualCashPaisa: 0, variancePaisa: 0,
    openTills: 0, pendingCloseTills: 0, closedTills: 0,
  });

  if (tillSessions.length === 0) return { totals: emptyTotals(), tills: [] };

  const tillIds = tillSessions.map((t) => t.id);
  const baseWhere: Prisma.InvoiceWhereInput = {
    tillSessionId: { in: tillIds },
    isActive: true,
    paymentStatus: { not: 'voided' },
  };

  const [financialByTill, paymentsByTill] = await Promise.all([
    // Per-till: gross totals, discount, tax, invoice count
    prisma.invoice.groupBy({
      by:    ['tillSessionId'],
      where: baseWhere,
      _sum:  { grandTotalPaisa: true, totalDiscountPaisa: true, taxPaisa: true },
      _count: { id: true },
    }),
    // Per-till per-method: payment breakdown (cash/card/wallet/pending)
    prisma.invoice.groupBy({
      by:    ['tillSessionId', 'paymentMethod', 'paymentStatus'],
      where: baseWhere,
      _sum:  { grandTotalPaisa: true },
    }),
  ]);

  // Build lookup maps for O(1) access
  type TillFinancials = {
    invoiceCount: number; grossSalesPaisa: number;
    totalDiscountPaisa: number; totalTaxPaisa: number;
    cashSalesPaisa: number; cardSalesPaisa: number;
    walletSalesPaisa: number; codPendingPaisa: number;
  };
  const finMap = new Map<string, TillFinancials>();
  for (const row of financialByTill) {
    finMap.set(row.tillSessionId.toString(), {
      invoiceCount:       row._count.id,
      grossSalesPaisa:    row._sum.grandTotalPaisa     ?? 0,
      totalDiscountPaisa: row._sum.totalDiscountPaisa  ?? 0,
      totalTaxPaisa:      row._sum.taxPaisa            ?? 0,
      cashSalesPaisa: 0, cardSalesPaisa: 0, walletSalesPaisa: 0, codPendingPaisa: 0,
    });
  }
  for (const row of paymentsByTill) {
    const fin = finMap.get(row.tillSessionId.toString());
    if (!fin) continue;
    const amount = row._sum.grandTotalPaisa ?? 0;
    if (row.paymentStatus === 'paid') {
      if (row.paymentMethod === 'cash')   fin.cashSalesPaisa   += amount;
      if (row.paymentMethod === 'card')   fin.cardSalesPaisa   += amount;
      if (row.paymentMethod === 'wallet') fin.walletSalesPaisa += amount;
    }
    if (row.paymentStatus === 'pending') fin.codPendingPaisa += amount;
  }

  const totals = emptyTotals();
  const tills = tillSessions.map((session) => {
    const fin = finMap.get(session.id.toString()) ?? {
      invoiceCount: 0, grossSalesPaisa: 0, totalDiscountPaisa: 0, totalTaxPaisa: 0,
      cashSalesPaisa: 0, cardSalesPaisa: 0, walletSalesPaisa: 0, codPendingPaisa: 0,
    };
    const expectedCashPaisa = session.openingCashPaisa + fin.cashSalesPaisa;
    const closingPaisa      = session.closingCashPaisa;
    const variancePaisa     = session.variance ?? (closingPaisa == null ? null : closingPaisa - expectedCashPaisa);

    totals.invoiceCount       += fin.invoiceCount;
    totals.grossSalesPaisa    += fin.grossSalesPaisa;
    totals.netSalesPaisa      += fin.grossSalesPaisa - fin.totalDiscountPaisa;
    totals.totalDiscountPaisa += fin.totalDiscountPaisa;
    totals.totalTaxPaisa      += fin.totalTaxPaisa;
    totals.cashSalesPaisa     += fin.cashSalesPaisa;
    totals.cardSalesPaisa     += fin.cardSalesPaisa;
    totals.walletSalesPaisa   += fin.walletSalesPaisa;
    totals.codPendingPaisa    += fin.codPendingPaisa;
    totals.openingCashPaisa   += session.openingCashPaisa;
    totals.expectedCashPaisa  += expectedCashPaisa;
    totals.actualCashPaisa    += closingPaisa ?? 0;
    totals.variancePaisa      += variancePaisa ?? 0;
    if (session.status === 'open')                     totals.openTills          += 1;
    if (session.status === 'pending_close_approval')   totals.pendingCloseTills  += 1;
    if (session.status === 'closed')                   totals.closedTills        += 1;

    return {
      sessionId:        session.id.toString(),
      terminalName:     session.terminal.name,
      terminalCode:     session.terminal.code,
      openedByName:     session.openedByName,
      status:           session.status,
      openedAt:         session.openedAt,
      closeSubmittedAt: session.closeSubmittedAt,
      approvedAt:       session.approvedAt,
      invoiceCount:     fin.invoiceCount,
      grossSalesPaisa:  fin.grossSalesPaisa,
      cashSalesPaisa:   fin.cashSalesPaisa,
      openingCashPaisa: session.openingCashPaisa,
      expectedCashPaisa,
      actualCashPaisa:  closingPaisa,
      variancePaisa,
    };
  });

  return { totals, tills };
}

export class BusinessDayService {
  private static async audit(input: {
    orgId: number;
    cityId?: number | null;
    branchId: number;
    businessDayId?: number | null;
    shiftSessionId?: number | null;
    tillSessionId?: number | null;
    action: string;
    actorId: string;
    actorName: string;
    notes?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    await prisma.operationAuditLog.create({
      data: {
        orgId: input.orgId,
        cityId: input.cityId ?? undefined,
        branchId: input.branchId,
        businessDayId: input.businessDayId ?? undefined,
        shiftSessionId: input.shiftSessionId ?? undefined,
        tillSessionId: input.tillSessionId ?? undefined,
        action: input.action,
        actorId: input.actorId,
        actorName: input.actorName,
        notes: input.notes ?? undefined,
        metadata: toJsonText(input.metadata ?? {}),
      },
    });
  }

  /** Pass orgId when the caller already has it to skip the branch→orgId lookup
   *  inside ShiftScheduleService and save one extra roundtrip. */
  static async current(branchId: string, orgId?: number) {
    const branchBigInt = toBigInt(branchId);
    const [schedule, businessDay] = await Promise.all([
      ShiftScheduleService.resolveCurrent(branchBigInt, new Date(), orgId),
      prisma.businessDay.findFirst({
        where: { branchId: branchBigInt, status: 'open' },
        include: {
          shiftSessions: {
            where: { status: 'open' },
            include: { shiftTemplate: true },
            orderBy: { openedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { openedAt: 'desc' },
      }),
    ]);

    // Determine the next available (unused) shift template for this business day.
    let suggestedShift = schedule.shift;
    if (businessDay) {
      // Run usedSessions lookup in parallel with allTemplates when needed.
      const usedSessions = await prisma.shiftSession.findMany({
        where:  { businessDayId: businessDay.id },
        select: { shiftTemplateId: true },
      });
      const usedIds = new Set(usedSessions.map((s) => s.shiftTemplateId));

      if (suggestedShift && usedIds.has(suggestedShift.id)) {
        // The schedule's templates are already fetched inside resolveCurrent —
        // re-use them via the allTemplates the schedule already has if possible,
        // otherwise fall back to a fresh query.
        const allTemplates = await prisma.shiftTemplate.findMany({
          where:   { branchId: branchBigInt, isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
        });
        suggestedShift = allTemplates.find((t) => !usedIds.has(t.id)) ?? null;
      }
    }

    return {
      suggestedBusinessDate: schedule.businessDateKey,
      suggestedShift,
      businessDay,
      shiftSession: businessDay?.shiftSessions[0] ?? null,
    };
  }

  static async openBusinessDay(input: {
    branchId: string;
    openedBy: string;
    openedByName: string;
    notes?: string;
  }) {
    const branchBigInt = toBigInt(input.branchId);

    // Phase 1 — run all guard checks + branch lookup + schedule in parallel.
    // None of these depend on each other's output.
    const [branch, openExisting, schedule] = await Promise.all([
      prisma.branch.findUnique({
        where:  { id: branchBigInt },
        select: { id: true, orgId: true, cityId: true },
      }),
      prisma.businessDay.findFirst({ where: { branchId: branchBigInt, status: 'open' } }),
      ShiftScheduleService.resolveCurrent(branchBigInt),
    ]);
    if (!branch)       throw new Error('BRANCH_NOT_FOUND');
    if (openExisting)  return openExisting;

    // Phase 2 — closedExisting needs the businessDate resolved in Phase 1.
    const closedExisting = await prisma.businessDay.findFirst({
      where: { branchId: branch.id, businessDate: schedule.businessDate, status: { not: 'open' } },
    });
    if (closedExisting) throw new Error('BUSINESS_DAY_ALREADY_CLOSED');

    // Phase 3 — create the record.
    const businessDay = await prisma.businessDay.create({
      data: {
        orgId:       branch.orgId,
        cityId:      branch.cityId,
        branchId:    branch.id,
        businessDate: schedule.businessDate,
        openedBy:    input.openedBy,
        openedByName: input.openedByName,
        notes:       input.notes,
      },
    });

    // Audit is fire-and-forget — failure must never block or roll back the open.
    this.audit({
      orgId: branch.orgId, cityId: branch.cityId, branchId: branch.id,
      businessDayId: businessDay.id, action: 'BUSINESS_DAY_OPENED',
      actorId: input.openedBy, actorName: input.openedByName, notes: input.notes,
      metadata: { businessDate: schedule.businessDateKey },
    }).catch((err) => console.error('[Audit] BUSINESS_DAY_OPENED failed:', err));

    return businessDay;
  }

  static async closeBusinessDay(input: {
    branchId: string;
    closedBy: string;
    closedByName: string;
    notes?: string;
  }) {
    const businessDay = await prisma.businessDay.findFirst({
      where: { branchId: toBigInt(input.branchId), status: 'open' },
    });
    if (!businessDay) throw new Error('BUSINESS_DAY_NOT_OPEN');

    const [openShifts, activeTills] = await Promise.all([
      prisma.shiftSession.count({
        where: { businessDayId: businessDay.id, status: 'open' },
      }),
      prisma.tillSession.count({
        where: { businessDayId: businessDay.id, status: { in: ACTIVE_TILL_STATUSES }, isActive: true },
      }),
    ]);
    if (activeTills > 0) throw new Error('ACTIVE_TILLS_EXIST');
    if (openShifts > 0) throw new Error('OPEN_SHIFTS_EXIST');

    const closed = await prisma.businessDay.update({
      where: { id: businessDay.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closedBy: input.closedBy,
        closedByName: input.closedByName,
        notes: input.notes ?? businessDay.notes,
      },
    });
    this.audit({
      orgId: closed.orgId, cityId: closed.cityId, branchId: closed.branchId,
      businessDayId: closed.id, action: 'BUSINESS_DAY_CLOSED',
      actorId: input.closedBy, actorName: input.closedByName, notes: input.notes,
    }).catch((err) => console.error('[Audit] BUSINESS_DAY_CLOSED failed:', err));
    return closed;
  }

  static async openShift(input: {
    branchId: string;
    shiftTemplateId?: string;
    openedBy: string;
    openedByName: string;
    notes?: string;
  }) {
    const branchBigInt = toBigInt(input.branchId);

    // Phase 1 — open-day check and open-shift check run in parallel.
    const [businessDay, openExisting] = await Promise.all([
      prisma.businessDay.findFirst({ where: { branchId: branchBigInt, status: 'open' } }),
      prisma.shiftSession.findFirst({
        where:   { branchId: branchBigInt, status: 'open' },
        include: { shiftTemplate: true },
      }),
    ]);
    if (!businessDay)  throw new Error('BUSINESS_DAY_NOT_OPEN');
    if (openExisting)  return openExisting;

    // Phase 2 — fetch usedSessions + allTemplates in parallel.
    // When shiftTemplateId is provided by the client (the normal path — the
    // frontend always sends suggestedShift.id) we skip resolveCurrent entirely,
    // saving 2 extra roundtrips (branch→orgConfig + shiftTemplates).
    const preferredBigInt = input.shiftTemplateId ? toBigInt(input.shiftTemplateId) : null;

    const [usedSessions, allTemplates, schedule] = await Promise.all([
      prisma.shiftSession.findMany({
        where:  { businessDayId: businessDay.id },
        select: { shiftTemplateId: true },
      }),
      prisma.shiftTemplate.findMany({
        where:   { branchId: businessDay.branchId, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
      }),
      // Only call resolveCurrent when shiftTemplateId is absent — it needs
      // timezone+templates and is redundant when the client already sent the ID.
      preferredBigInt
        ? Promise.resolve(null)
        : ShiftScheduleService.resolveCurrent(businessDay.branchId, new Date(), businessDay.orgId),
    ]);
    const usedIds = new Set(usedSessions.map((s) => s.shiftTemplateId));

    const effectivePreferredId = preferredBigInt ?? schedule?.shift?.id ?? null;

    const template =
      (effectivePreferredId && !usedIds.has(effectivePreferredId) && allTemplates.find((t) => t.id === effectivePreferredId)) ||
      allTemplates.find((t) => !usedIds.has(t.id)) ||
      null;

    if (!template) throw new Error('NO_REMAINING_SHIFTS');

    // Phase 3 — create the shift session.
    const shiftSession = await prisma.shiftSession.create({
      data: {
        businessDayId:   businessDay.id,
        branchId:        businessDay.branchId,
        shiftTemplateId: template.id,
        name:            template.name,
        startTime:       template.startTime,
        endTime:         template.endTime,
        openedBy:        input.openedBy,
        openedByName:    input.openedByName,
        notes:           input.notes,
      },
      include: { shiftTemplate: true },
    });

    // Audit is fire-and-forget.
    this.audit({
      orgId: businessDay.orgId, cityId: businessDay.cityId, branchId: businessDay.branchId,
      businessDayId: businessDay.id, shiftSessionId: shiftSession.id,
      action: 'SHIFT_OPENED', actorId: input.openedBy, actorName: input.openedByName,
      notes: input.notes, metadata: { shiftName: shiftSession.name },
    }).catch((err) => console.error('[Audit] SHIFT_OPENED failed:', err));

    return shiftSession;
  }

  static async closeShift(input: {
    branchId: string;
    closedBy: string;
    closedByName: string;
    notes?: string;
  }) {
    const shiftSession = await prisma.shiftSession.findFirst({
      where: { branchId: toBigInt(input.branchId), status: 'open' },
    });
    if (!shiftSession) throw new Error('SHIFT_NOT_OPEN');

    const activeTills = await prisma.tillSession.count({
      where: { shiftSessionId: shiftSession.id, status: { in: ACTIVE_TILL_STATUSES }, isActive: true },
    });
    if (activeTills > 0) throw new Error('ACTIVE_TILLS_EXIST');

    const closed = await prisma.shiftSession.update({
      where: { id: shiftSession.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closedBy: input.closedBy,
        closedByName: input.closedByName,
        notes: input.notes ?? shiftSession.notes,
      },
    });
    // Fetch businessDay for audit enrichment asynchronously — fire-and-forget
    prisma.businessDay.findUnique({ where: { id: closed.businessDayId } }).then((businessDay) => {
      if (!businessDay) return;
      this.audit({
        orgId: businessDay.orgId, cityId: businessDay.cityId, branchId: closed.branchId,
        businessDayId: closed.businessDayId, shiftSessionId: closed.id,
        action: 'SHIFT_CLOSED', actorId: input.closedBy, actorName: input.closedByName,
        notes: input.notes, metadata: { shiftName: closed.name },
      }).catch((err) => console.error('[Audit] SHIFT_CLOSED failed:', err));
    }).catch((err) => console.error('[Audit] businessDay lookup for SHIFT_CLOSED failed:', err));
    return closed;
  }

  static async currentShiftSummary(branchId: string) {
    const shiftSession = await prisma.shiftSession.findFirst({
      where: { branchId: toBigInt(branchId), status: 'open' },
    });
    if (!shiftSession) throw new Error('SHIFT_NOT_OPEN');

    const tillSessions = await prisma.tillSession.findMany({
      where:   { shiftSessionId: shiftSession.id, isActive: true },
      include: { terminal: true },
      orderBy: { openedAt: 'asc' },
    });

    return {
      shift: {
        id:          shiftSession.id.toString(),
        name:        shiftSession.name,
        startTime:   shiftSession.startTime,
        endTime:     shiftSession.endTime,
        status:      shiftSession.status,
        openedAt:    shiftSession.openedAt,
        openedByName: shiftSession.openedByName,
      },
      ...(await dbSummarizeTills(tillSessions)),
    };
  }

  static async currentBusinessDaySummary(branchId: string) {
    const businessDay = await prisma.businessDay.findFirst({
      where:   { branchId: toBigInt(branchId), status: 'open' },
      include: { shiftSessions: { orderBy: { openedAt: 'asc' } } },
    });
    if (!businessDay) throw new Error('BUSINESS_DAY_NOT_OPEN');

    // Fetch all till sessions for the day — no invoices included (DB aggregations below)
    const tillSessions = await prisma.tillSession.findMany({
      where:   { businessDayId: businessDay.id, isActive: true },
      include: { terminal: true },
      orderBy: { openedAt: 'asc' },
    });

    // Run day-level and per-shift aggregations in parallel
    const shiftTillGroups = businessDay.shiftSessions.map((shift) =>
      tillSessions.filter((t) => t.shiftSessionId === shift.id),
    );
    const [daySummary, ...shiftSummaries] = await Promise.all([
      dbSummarizeTills(tillSessions),
      ...shiftTillGroups.map((shiftTills) => dbSummarizeTills(shiftTills)),
    ]);

    return {
      businessDay: {
        id:           businessDay.id.toString(),
        businessDate: businessDay.businessDate,
        status:       businessDay.status,
        openedAt:     businessDay.openedAt,
        openedByName: businessDay.openedByName,
      },
      ...daySummary,
      shifts: businessDay.shiftSessions.map((shift, i) => ({
        shift: {
          id:        shift.id.toString(),
          name:      shift.name,
          startTime: shift.startTime,
          endTime:   shift.endTime,
          status:    shift.status,
          openedAt:  shift.openedAt,
          closedAt:  shift.closedAt,
        },
        ...shiftSummaries[i],
      })),
    };
  }

  static async approveTillClose(input: {
    sessionId: string;
    approvedBy: string;
    approvedByName: string;
    notes?: string;
  }) {
    const session = await prisma.tillSession.findUnique({
      where: { id: toBigInt(input.sessionId) },
    });
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.status !== 'pending_close_approval') throw new Error('TILL_NOT_PENDING_APPROVAL');

    const closed = await prisma.tillSession.update({
      where: { id: session.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closedBy: session.closeSubmittedBy ?? session.closedBy,
        approvedAt: new Date(),
        approvedBy: input.approvedBy,
        approvedByName: input.approvedByName,
        notes: input.notes ?? session.notes,
      },
    });

    prisma.tillSessionLog.create({
      data: {
        tillSessionId: closed.id,
        terminalId: closed.terminalId,
        userId: input.approvedBy,
        userName: input.approvedByName,
        action: 'CLOSE_APPROVED',
        notes: input.notes,
        metadata: toJsonText({
          closingCashAmount: closed.closingCashPaisa,
          cashVarianceAmount: closed.variance,
        }),
      },
    }).catch((err) => console.warn('[TillSessionLog] CLOSE_APPROVED write failed:', err));

    this.audit({
      orgId: closed.orgId, cityId: closed.cityId, branchId: closed.branchId,
      businessDayId: closed.businessDayId, shiftSessionId: closed.shiftSessionId,
      tillSessionId: closed.id, action: 'TILL_CLOSE_APPROVED',
      actorId: input.approvedBy, actorName: input.approvedByName, notes: input.notes,
      metadata: { closingCashAmount: closed.closingCashPaisa, cashVarianceAmount: closed.variance },
    }).catch((err) => console.error('[Audit] TILL_CLOSE_APPROVED failed:', err));

    return closed;
  }

  static async rejectTillClose(input: {
    sessionId: string;
    rejectedBy: string;
    rejectedByName: string;
    notes?: string;
  }) {
    const session = await prisma.tillSession.findUnique({
      where: { id: toBigInt(input.sessionId) },
    });
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.status !== 'pending_close_approval') throw new Error('TILL_NOT_PENDING_APPROVAL');

    const reopened = await prisma.tillSession.update({
      where: { id: session.id },
      data: {
        status: 'open',
        closeSubmittedAt: null,
        closeSubmittedBy: null,
        closedBy: null,
        closedByName: null,
        closingCashPaisa: null,
        closingDenom: null,
        variance: null,
        notes: input.notes ?? session.notes,
      },
    });

    prisma.tillSessionLog.create({
      data: {
        tillSessionId: reopened.id,
        terminalId: reopened.terminalId,
        userId: input.rejectedBy,
        userName: input.rejectedByName,
        action: 'CLOSE_REJECTED',
        notes: input.notes,
        metadata: toJsonText({
          previousClosingCashAmount: session.closingCashPaisa,
          previousCashVarianceAmount: session.variance,
        }),
      },
    }).catch((err) => console.warn('[TillSessionLog] CLOSE_REJECTED write failed:', err));

    this.audit({
      orgId: reopened.orgId, cityId: reopened.cityId, branchId: reopened.branchId,
      businessDayId: reopened.businessDayId, shiftSessionId: reopened.shiftSessionId,
      tillSessionId: reopened.id, action: 'TILL_CLOSE_REJECTED',
      actorId: input.rejectedBy, actorName: input.rejectedByName, notes: input.notes,
    }).catch((err) => console.error('[Audit] TILL_CLOSE_REJECTED failed:', err));

    return reopened;
  }

  static async forceCloseTill(input: {
    sessionId: string;
    closedBy: string;
    closedByName: string;
    notes?: string;
  }) {
    const session = await prisma.tillSession.findUnique({
      where: { id: toBigInt(input.sessionId) },
    });
    if (!session) throw new Error('SESSION_NOT_FOUND');
    if (session.status === 'closed') return session;

    const closed = await prisma.tillSession.update({
      where: { id: session.id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closedBy: input.closedBy,
        closedByName: input.closedByName,
        approvedAt: new Date(),
        approvedBy: input.closedBy,
        approvedByName: input.closedByName,
        notes: input.notes ?? session.notes,
      },
    });

    prisma.tillSessionLog.create({
      data: {
        tillSessionId: closed.id,
        terminalId: closed.terminalId,
        userId: input.closedBy,
        userName: input.closedByName,
        action: 'FORCE_CLOSED',
        notes: input.notes,
        metadata: toJsonText({ previousStatus: session.status }),
      },
    }).catch((err) => console.warn('[TillSessionLog] FORCE_CLOSED write failed:', err));

    this.audit({
      orgId: closed.orgId, cityId: closed.cityId, branchId: closed.branchId,
      businessDayId: closed.businessDayId, shiftSessionId: closed.shiftSessionId,
      tillSessionId: closed.id, action: 'TILL_FORCE_CLOSED',
      actorId: input.closedBy, actorName: input.closedByName, notes: input.notes,
      metadata: { previousStatus: session.status },
    }).catch((err) => console.error('[Audit] TILL_FORCE_CLOSED failed:', err));

    return closed;
  }
}
