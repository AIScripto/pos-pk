import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

export class InventoryController {

  static async list(req: Request, res: Response) {
    const branchId = BigInt((req.query.branchId as string) ?? req.auth!.branchId);

    const inventory = await prisma.inventory.findMany({
      where:   { branchId },
      include: { product: { select: { id: true, name: true, sku: true, category: true } } },
      orderBy: { product: { name: 'asc' } },
    });

    R.ok(res, inventory);
  }

  static async lowStock(req: Request, res: Response) {
    const branchId = BigInt((req.query.branchId as string) ?? req.auth!.branchId);

    const all   = await prisma.inventory.findMany({
      where:   { branchId },
      include: { product: { select: { id: true, name: true, sku: true } } },
    });
    const items = all.filter((i) => i.quantity <= i.minThreshold);

    R.ok(res, items);
  }

  static async setStock(req: Request, res: Response) {
    try {
      const { quantity, minThreshold } = req.body;
      const branchId = BigInt(req.body.branchId ?? req.auth!.branchId);
      const productId = BigInt(req.params.productId);

      const record = await prisma.inventory.upsert({
        where:  { productId_branchId: { productId, branchId } },
        update: { quantity, minThreshold, updatedAt: new Date() },
        create: {
          productId,
          branchId,
          quantity,
          minThreshold: minThreshold ?? 5,
          createdBy:    req.auth!.userId,
        },
      });

      R.ok(res, record);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async adjust(req: Request, res: Response) {
    try {
      const { delta, branchId: bodyBranchId } = req.body;
      if (delta === undefined) return R.badRequest(res, 'delta required');

      const branchId = BigInt(bodyBranchId ?? req.auth!.branchId);
      const productId = BigInt(req.params.productId);

      const existing = await prisma.inventory.findUnique({
        where: { productId_branchId: { productId, branchId } },
      });

      const newQty = (existing?.quantity ?? 0) + delta;
      if (newQty < 0) return R.badRequest(res, 'Adjustment would result in negative stock');

      const record = await prisma.inventory.upsert({
        where:  { productId_branchId: { productId, branchId } },
        update: { quantity: newQty, updatedAt: new Date() },
        create: {
          productId,
          branchId,
          quantity:     newQty,
          minThreshold: 5,
          createdBy:    req.auth!.userId,
        },
      });

      R.ok(res, record);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }
}
