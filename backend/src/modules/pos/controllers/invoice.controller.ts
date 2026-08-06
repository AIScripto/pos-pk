import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoice.service';
import { TillService } from '../services/till.service';
import { AuthService } from '../../../services/auth.service';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';
import { safeJsonParse } from '../../../shared/utils/json';
import { parsePagination } from '../../../shared/utils/pagination';
import { DISCOUNT_LIMITS } from '../../../config/discount';

function requiresDiscountOverride(items: { unitPricePaisa: number; quantity: number; discountPercent?: number; lumpDiscountPaisa?: number }[] = []) {
  return items.some((item) => {
    const gross = item.unitPricePaisa * item.quantity;
    const lumpPercent = gross > 0 ? ((item.lumpDiscountPaisa ?? 0) / gross) * 100 : 0;
    return (item.discountPercent ?? 0) > DISCOUNT_LIMITS.CASHIER_PERCENT || lumpPercent > DISCOUNT_LIMITS.CASHIER_PERCENT;
  });
}

export class InvoiceController {

  static async create(req: Request, res: Response) {
    try {
      let branchId   = (req.body.branchId  as string) || req.auth!.branchId  || '';
      let terminalId = (req.auth!.terminalId ?? req.body.terminalId ?? '') as string;
      let cityId     = (req.body.cityId    as string) || req.auth!.cityId    || '';

      // For email-login users (org_admin, branch_manager) who have no branchId/terminalId
      // in their JWT, derive them from the open till session — safe because it's server data.
      const tillId = req.body.tillSessionId as string | undefined;
      const isNumericTillId = tillId && /^\d+$/.test(tillId);
      if ((!branchId || !terminalId) && isNumericTillId) {
        const session = await prisma.tillSession.findUnique({
          where:  { id: BigInt(tillId!) },
          select: { branchId: true, terminalId: true, cityId: true },
        });
        if (session) {
          if (!branchId)   branchId   = session.branchId.toString();
          if (!terminalId) terminalId = session.terminalId.toString();
          if (!cityId)     cityId     = session.cityId.toString();
        }
      }

      if (!branchId)   return R.badRequest(res, 'branchId required — open a till or log in via PIN');
      if (!terminalId) return R.badRequest(res, 'terminalId not found — open a till or log in via PIN');

      if (requiresDiscountOverride(req.body.items) && !req.auth!.permissions?.includes('discount.override')) {
        try {
          const approval = AuthService.verifyManagerApproval(req.body.managerApprovalToken, 'discount.override', branchId);
          const discounts = safeJsonParse<unknown[]>(req.body.discountsJson, []);
          req.body.discountsJson = JSON.stringify([
            ...discounts,
            {
              type: 'manager_override',
              action: 'discount.override',
              amountPaisa: 0,
              approvedBy: approval.approvedBy,
              approvedByName: approval.approvedByName,
              reason: approval.reason,
              approvedAt: new Date().toISOString(),
            },
          ]);
        } catch {
          return R.forbidden(res, 'Manager approval required for discount override');
        }
      }

      // Resolve cityId from branch if still missing
      if (!cityId) {
        const branch = await prisma.branch.findUnique({ where: { id: BigInt(branchId) }, select: { cityId: true } });
        cityId = branch?.cityId.toString() ?? '';
      }

      const invoice = await InvoiceService.create({
        ...req.body,
        cashierId:  req.auth!.userId,
        orgId:      req.auth!.orgId,
        cityId,
        branchId,
        terminalId,
      });
      R.created(res, invoice);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { page, limit } = parsePagination(req.query);
      const branchId  = (req.query.branchId as string) ?? req.auth!.branchId;
      const sessionId = req.query.tillSessionId as string | undefined;

      // Cashiers and kitchen staff only see invoices from their own terminal
      const SCOPED_ROLES = new Set(['cashier', 'kitchen']);
      const terminalId = SCOPED_ROLES.has(req.auth!.role) ? req.auth!.terminalId : null;

      const result = await InvoiceService.list({ branchId, tillSessionId: sessionId, terminalId, page, limit });
      R.ok(res, result.invoices, { total: result.total, page: result.page, pages: result.pages });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async tillSummary(req: Request, res: Response) {
    try {
      const summary = await TillService.summary(req.params.sessionId);
      R.ok(res, summary);
    } catch {
      R.notFound(res, 'Till session');
    }
  }

  static async categorySummary(req: Request, res: Response) {
    try {
      const cats = await InvoiceService.categorySummary(req.params.sessionId);
      R.ok(res, cats);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async voidInvoice(req: Request, res: Response) {
    try {
      const { reason } = req.body;
      if (!reason) return R.badRequest(res, 'Void reason required');

      const invoice = await prisma.invoice.update({
        where: { id: BigInt(req.params.id) },
        data:  {
          paymentStatus: 'voided',
          voidReason:    reason,
          voidedBy:      req.auth!.userId,
          isActive:      false,
        },
      });
      R.ok(res, invoice);
    } catch {
      R.notFound(res, 'Invoice');
    }
  }
}
