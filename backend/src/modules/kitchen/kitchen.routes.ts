// =============================================================================
// Kitchen Routes — REST endpoints for the KDS
// GET  /kitchen/orders        → active orders for the authenticated branch
// PATCH /kitchen/orders/:id   → update status (acknowledge / start / ready / served)
// =============================================================================

import { Router }          from 'express';
import { auth }            from '../../shared/middleware/auth.middleware';
import { ok, serverError, badRequest, forbidden } from '../../shared/lib/response';
import { KitchenService, KitchenStatus } from './kitchen.service';
import { getIO }           from '../../lib/socket';

/** Convert BigInt fields to strings so JSON serialisation doesn't crash. */
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? String(value) : value
  ));
}

const router = Router();

const VALID_STATUSES: KitchenStatus[] = ['acknowledged', 'in_progress', 'ready', 'served'];

function resolveBranchId(req: import('express').Request): string {
  const queryBranchId = typeof req.query.branchId === 'string' ? req.query.branchId.trim() : '';
  const bodyBranchId  = typeof req.body?.branchId === 'string' ? req.body.branchId.trim() : '';
  return queryBranchId || bodyBranchId || req.auth!.branchId || '';
}

function isBranchAllowed(req: import('express').Request, branchId: string): boolean {
  const tokenBranchId = req.auth!.branchId;
  const tokenBranchIds = req.auth!.branchIds ?? [];

  // Branch-scoped JWT (PIN login) can only access its own branch.
  if (tokenBranchId && tokenBranchId !== branchId) return false;

  // Multi-branch-scoped JWT must stay within assigned branches.
  if (tokenBranchIds.length > 0 && !tokenBranchIds.includes(branchId)) return false;

  // Org-level JWTs with no branch scope are allowed.
  return true;
}

// GET /kitchen/orders — kitchen screen initial load
router.get('/orders', ...auth('kitchen'), async (req, res) => {
  try {
    const branchId = resolveBranchId(req);
    if (!branchId) {
      return badRequest(res, 'branchId required — select a branch for Kitchen Display');
    }
    if (!isBranchAllowed(req, branchId)) {
      return forbidden(res, 'You are not allowed to access this branch');
    }

    const orders   = await KitchenService.activeOrders(branchId);
    return ok(res, serialize(orders));
  } catch (err) {
    return serverError(res, String(err));
  }
});

// PATCH /kitchen/orders/:id — update status via REST (fallback for non-WS clients)
router.patch('/orders/:id', ...auth('kitchen'), async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body as { status: KitchenStatus };

    if (!VALID_STATUSES.includes(status)) {
      return badRequest(res, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const branchId = resolveBranchId(req);
    if (!branchId) {
      return badRequest(res, 'branchId required — select a branch for Kitchen Display');
    }
    if (!isBranchAllowed(req, branchId)) {
      return forbidden(res, 'You are not allowed to update this branch');
    }

    const updated  = await KitchenService.updateStatus(id, status);

    // Broadcast via socket so all KDS screens update instantly
    getIO().to(`kitchen:${branchId}`).emit('kitchen:order:updated', serialize(updated));

    return ok(res, serialize(updated));
  } catch (err) {
    return serverError(res, String(err));
  }
});

export { router as kitchenRoutes };
