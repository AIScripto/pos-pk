import { Request, Response } from 'express';
import { badRequest, conflict, forbidden, notFound, ok, serverError } from '../../../shared/lib/response';
import { BusinessDayService } from '../services/business-day.service';

function branchIdFrom(req: Request): string {
  return ((req.body.branchId as string | undefined) || (req.query.branchId as string | undefined) || req.auth!.branchId || '').trim();
}

function isBranchAllowed(req: Request, branchId: string): boolean {
  const { branchId: tokenBranchId, branchIds = [] } = req.auth!;
  // Single-branch token (manager/cashier) — must match exactly
  if (tokenBranchId) return tokenBranchId === branchId;
  // Multi-branch token — must be in the explicit list
  if (branchIds.length > 0) return branchIds.includes(branchId);
  // Org-wide token (org_admin, super_admin) — allow any branch
  return true;
}

function guardBranch(req: Request, res: Response): string | null {
  const branchId = branchIdFrom(req);
  if (!branchId) {
    badRequest(res, 'branchId required');
    return null;
  }
  if (!isBranchAllowed(req, branchId)) {
    forbidden(res, 'You are not allowed to operate this branch');
    return null;
  }
  return branchId;
}

function handleError(res: Response, err: unknown) {
  const message = err instanceof Error ? err.message : 'Operation failed';
  if (message === 'BRANCH_NOT_FOUND' || message === 'SESSION_NOT_FOUND' || message === 'SHIFT_TEMPLATE_NOT_FOUND') {
    return notFound(res, message.replaceAll('_', ' ').toLowerCase());
  }
  if ([
    'BUSINESS_DAY_NOT_OPEN',
    'BUSINESS_DAY_ALREADY_CLOSED',
    'PREVIOUS_DAY_NOT_CLOSED',
    'SHIFT_NOT_OPEN',
    'NO_ACTIVE_SHIFT',
    'NO_REMAINING_SHIFTS',
    'ACTIVE_TILLS_EXIST',
    'OPEN_SHIFTS_EXIST',
    'TILL_NOT_PENDING_APPROVAL',
  ].includes(message)) {
    return conflict(res, message);
  }
  return serverError(res, message);
}

export async function currentOperations(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.current(branchId));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function openBusinessDay(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.openBusinessDay({
      branchId,
      openedBy: req.auth!.userId,
      openedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function closeBusinessDay(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.closeBusinessDay({
      branchId,
      closedBy: req.auth!.userId,
      closedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function businessDaySummary(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.currentBusinessDaySummary(branchId));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function openShift(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.openShift({
      branchId,
      shiftTemplateId: req.body.shiftTemplateId,
      openedBy: req.auth!.userId,
      openedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function closeShift(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.closeShift({
      branchId,
      closedBy: req.auth!.userId,
      closedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function shiftSummary(req: Request, res: Response) {
  const branchId = guardBranch(req, res);
  if (!branchId) return;
  try {
    return ok(res, await BusinessDayService.currentShiftSummary(branchId));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function approveTillClose(req: Request, res: Response) {
  try {
    return ok(res, await BusinessDayService.approveTillClose({
      sessionId: req.params.sessionId,
      approvedBy: req.auth!.userId,
      approvedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function rejectTillClose(req: Request, res: Response) {
  try {
    return ok(res, await BusinessDayService.rejectTillClose({
      sessionId: req.params.sessionId,
      rejectedBy: req.auth!.userId,
      rejectedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}

export async function forceCloseTill(req: Request, res: Response) {
  try {
    return ok(res, await BusinessDayService.forceCloseTill({
      sessionId: req.params.sessionId,
      closedBy: req.auth!.userId,
      closedByName: req.auth!.name,
      notes: req.body.notes,
    }));
  } catch (err) {
    return handleError(res, err);
  }
}
