import { Request, Response }   from 'express';
import { HeldOrderService } from '../services/held-order.service';
import * as R from '../../../shared/lib/response';

export class HeldOrderController {

  static async create(req: Request, res: Response) {
    try {
      const branchId = req.auth!.branchId;
      if (!branchId) return R.badRequest(res, 'branchId required — log in as a branch user');

      const terminalId = req.auth!.terminalId ?? req.body.terminalId;
      if (!terminalId) return R.badRequest(res, 'terminalId required — log in via PIN on a till');

      const { label, itemsJson, activeCustomerJson, orderType,
              tableId, tableName, covers,
              customerId, customerName, customerPhone, orderNotes } = req.body;

      if (!itemsJson) return R.badRequest(res, 'itemsJson required');

      const held = await HeldOrderService.create({
        orgId:     req.auth!.orgId,
        cityId:    req.auth!.cityId,
        branchId,
        terminalId,
        cashierId: req.auth!.userId,
        label:     label || 'Held Order',
        itemsJson,
        activeCustomerJson,
        orderType: orderType || 'dine-in',
        tableId, tableName, covers,
        customerId, customerName, customerPhone, orderNotes,
      });

      R.created(res, held);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const branchId = req.auth!.branchId;
      if (!branchId) return R.badRequest(res, 'branchId required');

      const orders = await HeldOrderService.list(branchId);
      R.ok(res, orders);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      await HeldOrderService.remove(req.params.id);
      R.noContent(res);
    } catch {
      R.notFound(res, 'Held order');
    }
  }
}
