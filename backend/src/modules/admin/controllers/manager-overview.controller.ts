import { Request, Response } from 'express';
import { badRequest, forbidden, notFound, ok, serverError } from '../../../shared/lib/response';
import { ManagerOverviewService } from '../services/manager-overview.service';

function isBranchAllowed(req: Request, branchId: string): boolean {
  const tokenBranchId = req.auth!.branchId;
  const tokenBranchIds = req.auth!.branchIds ?? [];

  if (tokenBranchId && tokenBranchId !== branchId) return false;
  if (tokenBranchIds.length > 0 && !tokenBranchIds.includes(branchId)) return false;
  return true;
}

export async function managerOverview(req: Request, res: Response) {
  const branchId = (req.query.branchId as string | undefined)?.trim() || req.auth!.branchId;
  if (!branchId) return badRequest(res, 'branchId required');
  if (!isBranchAllowed(req, branchId)) return forbidden(res, 'You are not allowed to access this branch');

  try {
    const overview = await ManagerOverviewService.overview(branchId);
    return ok(res, overview);
  } catch (err) {
    if (err instanceof Error && err.message === 'BRANCH_NOT_FOUND') {
      return notFound(res, 'Branch');
    }
    return serverError(res, err instanceof Error ? err.message : 'Failed to load manager overview');
  }
}
