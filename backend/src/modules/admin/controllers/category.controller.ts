// =============================================================================
// Category Controller — CRUD for product categories
// =============================================================================

import { Request, Response } from 'express';
import '../../../shared/middleware/auth.middleware';  // For Request.auth type extension
import { CategoryService } from '../services/category.service';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';

export class CategoryController {

  static async list(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const auth = req.auth!;

      const results = await CategoryService.list(
        toBigInt(auth.orgId),
        search ? String(search) : undefined
      );

      const mapped = results.map((c) => ({
        id: toStringId(c.id),
        orgId: toStringId(c.orgId),
        foodTypeId: c.foodTypeId ? toStringId(c.foodTypeId) : null,
        name: c.name,
        tag: c.tag,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      R.ok(res, mapped);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = req.auth!;

      const category = await CategoryService.get(toBigInt(auth.orgId), toBigInt(id));

      const mapped = {
        id: toStringId(category.id),
        orgId: toStringId(category.orgId),
        name: category.name,
        tag: category.tag,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      R.ok(res, mapped);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') return R.notFound(res, 'Category not found');
      R.serverError(res, err.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, tag, foodTypeId, sortOrder, isActive } = req.body;
      const auth = req.auth!;

      // Validate required fields
      if (!name || !tag || !foodTypeId) {
        return R.badRequest(res, 'name, tag, and foodTypeId are required');
      }

      const category = await CategoryService.create(toBigInt(auth.orgId), {
        name,
        tag,
        foodTypeId: toBigInt(foodTypeId),
        sortOrder,
        isActive,
      });

      const mapped = {
        id: toStringId(category.id),
        orgId: toStringId(category.orgId),
        foodTypeId: category.foodTypeId ? toStringId(category.foodTypeId) : null,
        name: category.name,
        tag: category.tag,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      R.created(res, mapped);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_NAME') {
        return R.conflict(res, 'Category name already exists in this organization');
      }
      if (err.message === 'DUPLICATE_TAG') {
        return R.conflict(res, 'Tag already exists in this organization');
      }
      if (err.message === 'INVALID_NAME') {
        return R.badRequest(res, 'Name is required');
      }
      if (err.message === 'INVALID_TAG') {
        return R.badRequest(res, 'Tag is required');
      }
      if (err.message === 'INVALID_TAG_FORMAT') {
        return R.badRequest(res, 'Tag must be exactly 3 characters (letters/numbers, uppercase)');
      }
      if (err.message === 'NAME_TOO_LONG') {
        return R.badRequest(res, 'Name must be 50 characters or less');
      }
      if (err.message === 'FOOD_TYPE_NOT_FOUND') {
        return R.notFound(res, 'Food type not found or does not belong to this organization');
      }
      R.serverError(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, tag, sortOrder, isActive } = req.body;
      const auth = req.auth!;

      const category = await CategoryService.update(toBigInt(auth.orgId), toBigInt(id), {
        name,
        tag,
        sortOrder,
        isActive,
      });

      const mapped = {
        id: toStringId(category.id),
        orgId: toStringId(category.orgId),
        name: category.name,
        tag: category.tag,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      R.ok(res, mapped);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return R.notFound(res, 'Category not found');
      }
      if (err.message === 'DUPLICATE_NAME') {
        return R.conflict(res, 'Category name already exists in this organization');
      }
      if (err.message === 'DUPLICATE_TAG') {
        return R.conflict(res, 'Tag already exists in this organization');
      }
      if (err.message === 'INVALID_NAME') {
        return R.badRequest(res, 'Name is required');
      }
      if (err.message === 'INVALID_TAG_FORMAT') {
        return R.badRequest(res, 'Tag must be exactly 3 characters (letters/numbers, uppercase)');
      }
      if (err.message === 'NAME_TOO_LONG') {
        return R.badRequest(res, 'Name must be 50 characters or less');
      }
      if (err.message === 'INVALID_SORT_ORDER') {
        return R.badRequest(res, 'Sort order must be 0 or greater');
      }
      R.serverError(res, err.message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = req.auth!;

      const category = await CategoryService.delete(toBigInt(auth.orgId), toBigInt(id));

      const mapped = {
        id: toStringId(category.id),
        orgId: toStringId(category.orgId),
        name: category.name,
        tag: category.tag,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };

      R.ok(res, mapped);
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return R.notFound(res, 'Category not found');
      }
      if (err.message === 'CATEGORY_HAS_PRODUCTS') {
        return R.badRequest(res, 'Cannot delete category with active products');
      }
      R.serverError(res, err.message);
    }
  }
}
