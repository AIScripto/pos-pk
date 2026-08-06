import { Request, Response } from 'express';
import { TillService } from '../services/till.service';
import { BusinessDayService } from '../../admin/services/business-day.service';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

function withGenericTillAmounts(session: any) {
  if (!session) return session;
  return {
    ...session,
    openingCashAmount: session.openingCashPaisa,
    closingCashAmount: session.closingCashPaisa,
    cashVarianceAmount: session.variance,
  };
}

function withGenericSummaryAmounts(summary: any) {
  if (!summary) return summary;
  return {
    ...summary,
    session: withGenericTillAmounts(summary.session),
    openingCashAmount: summary.openingCashPaisa,
    expectedCashAmount: summary.expectedCashPaisa,
    actualCashAmount: summary.actualCashPaisa,
    cashVarianceAmount: summary.variance,
  };
}

export class TillController {

  static async current(req: Request, res: Response) {
    try {
      const terminalId = (req.query.terminalId as string) ?? req.auth!.terminalId ?? '';
      if (!terminalId) return R.badRequest(res, 'terminalId required');

      const session = await TillService.current(terminalId);
      R.ok(res, withGenericTillAmounts(session));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async open(req: Request, res: Response) {
    try {
      let branchId   = (req.body.branchId  as string) || req.auth!.branchId  || '';
      let cityId     = (req.body.cityId    as string) || req.auth!.cityId    || '';
      const terminalId = (req.body.terminalId ?? req.auth!.terminalId ?? '') as string;
      if (!terminalId) return R.badRequest(res, 'terminalId required — select a terminal when opening the till');

      // The selected till is the source of truth for branch/city during POS opening.
      const terminal = await prisma.terminal.findUnique({
        where:  { id: BigInt(terminalId) },
        select: { branchId: true, branch: { select: { cityId: true } } },
      });
      if (!terminal) return R.badRequest(res, 'Terminal not found');
      branchId = terminal.branchId.toString();
      cityId = terminal.branch.cityId.toString();

      if (!branchId) return R.badRequest(res, 'branchId required');

      const session = await TillService.open({
        orgId:            req.auth!.orgId,
        cityId,
        branchId,
        terminalId,
        openedBy:         req.auth!.userId,
        openedByName:     req.auth!.name,
        openingCashAmount: req.body.openingCashAmount ?? req.body.openingCashPaisa ?? 0,
        openingDenomJson: JSON.stringify(req.body.denominations ?? []),
        notes:            req.body.notes,
      });
      R.created(res, withGenericTillAmounts(session));
    } catch (err: any) {
      if (err.message === 'TILL_ALREADY_OPEN')
        return R.conflict(res, 'A till session is already open on this terminal');
      if (err.message === 'TILL_DISABLED')
        return R.badRequest(res, 'This till is disabled or does not belong to the selected branch');
      if (err.message === 'BUSINESS_DAY_NOT_OPEN')
        return R.conflict(res, 'Business day is not open. Ask the manager to open the day first.');
      if (err.message === 'SHIFT_NOT_OPEN')
        return R.conflict(res, 'Shift is not open. Ask the manager to open the shift first.');
      R.serverError(res, err.message);
    }
  }

  static async close(req: Request, res: Response) {
    try {
      const session = await TillService.close({
        sessionId:        req.body.sessionId,
        closedBy:         req.auth!.userId,
        closedByName:     req.auth!.name,
        closingDenomJson: JSON.stringify(req.body.denominations ?? []),
        closingCashAmount: req.body.closingCashAmount ?? req.body.closingCashPaisa ?? 0,
        notes:            req.body.notes,
      });
      R.ok(res, withGenericTillAmounts(session));
    } catch (err: any) {
      if (err.message === 'TILL_NOT_OPEN')
        return R.conflict(res, 'This till session is not open');
      if (err.message === 'ACTIVE_ORDERS_IN_QUEUE')
        return R.conflict(res, 'Cannot close till. There are still active or pending orders in the kitchen queue. Please complete or void them first.');
      R.serverError(res, err.message);
    }
  }

  static async summary(req: Request, res: Response) {
    try {
      const summary = await TillService.summary(req.params.sessionId);
      R.ok(res, withGenericSummaryAmounts(summary));
    } catch {
      R.notFound(res, 'Till session');
    }
  }

  static async history(req: Request, res: Response) {
    try {
      const branchId = ((req.query.branchId as string) ?? req.auth!.branchId).toString();
      const limit    = parseInt(req.query.limit as string ?? '20', 10);
      const history  = await TillService.history(branchId, limit);
      R.ok(res, history.map(withGenericTillAmounts));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  /**
   * Lightweight status check for the cashier's "Waiting for Manager" screen.
   * Returns whether the business day and shift are currently open.
   * Accessible by cashier role — no manager permissions required.
   */
  static async opsStatus(req: Request, res: Response) {
    try {
      const branchId = (req.query.branchId as string) || req.auth!.branchId || '';
      if (!branchId) return R.badRequest(res, 'branchId required');

      const ops = await BusinessDayService.current(branchId);
      R.ok(res, {
        businessDayOpen: ops.businessDay?.status === 'open',
        shiftOpen:       ops.shiftSession?.status === 'open',
        businessDate:    ops.businessDay?.businessDate ?? ops.suggestedBusinessDate,
        shiftName:       ops.shiftSession?.name ?? null,
        shiftStartTime:  ops.shiftSession?.startTime ?? ops.suggestedShift?.startTime ?? null,
        shiftEndTime:    ops.shiftSession?.endTime   ?? ops.suggestedShift?.endTime   ?? null,
        suggestedShift:  ops.suggestedShift
          ? { name: ops.suggestedShift.name, startTime: ops.suggestedShift.startTime, endTime: ops.suggestedShift.endTime }
          : null,
      });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }
}
