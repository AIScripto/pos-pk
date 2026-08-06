import { Request, Response } from 'express';
import * as R from '../../../shared/lib/response';
import { FoodTypeService } from '../services/food-type.service';

export class FoodTypeController {

  static async list(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      const search = (req.query.search as string) || undefined;

      const foodTypes = await FoodTypeService.list(orgId, search);

      const resolved = foodTypes.map((ft) => ({
        ...ft,
        id: ft.id.toString(),
        orgId: ft.orgId.toString(),
      }));

      R.ok(res, resolved);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      const foodType = await FoodTypeService.get(orgId, BigInt(req.params.id));

      const resolved = {
        ...foodType,
        id: foodType.id.toString(),
        orgId: foodType.orgId.toString(),
      };

      R.ok(res, resolved);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return R.notFound(res, 'FoodType');
      }
      R.badRequest(res, err.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      const { name, slug, sortOrder, isActive } = req.body;

      const foodType = await FoodTypeService.create(orgId, {
        name,
        slug,
        sortOrder,
        isActive,
      });

      const resolved = {
        ...foodType,
        id: foodType.id.toString(),
        orgId: foodType.orgId.toString(),
      };

      R.created(res, resolved);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_NAME') {
        return R.conflict(res, 'Food Type name already exists in this organization');
      }
      if (err.message === 'DUPLICATE_SLUG') {
        return R.conflict(res, 'Food Type slug already exists in this organization');
      }
      R.badRequest(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      const { name, slug, sortOrder, isActive } = req.body;

      const foodType = await FoodTypeService.update(orgId, BigInt(req.params.id), {
        name,
        slug,
        sortOrder,
        isActive,
      });

      const resolved = {
        ...foodType,
        id: foodType.id.toString(),
        orgId: foodType.orgId.toString(),
      };

      R.ok(res, resolved);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return R.notFound(res, 'FoodType');
      }
      if (err.message === 'DUPLICATE_NAME') {
        return R.conflict(res, 'Food Type name already exists in this organization');
      }
      if (err.message === 'DUPLICATE_SLUG') {
        return R.conflict(res, 'Food Type slug already exists in this organization');
      }
      R.badRequest(res, err.message);
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      await FoodTypeService.delete(orgId, BigInt(req.params.id));
      R.noContent(res);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return R.notFound(res, 'FoodType');
      }
      if (err.message === 'FOODTYPE_HAS_CATEGORIES') {
        return R.badRequest(res, 'Cannot delete food type with active categories');
      }
      R.badRequest(res, err.message);
    }
  }
}
