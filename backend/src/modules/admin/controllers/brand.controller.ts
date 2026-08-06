// =============================================================================
// Brand Controller — CRUD endpoints for brand management
// =============================================================================

import { Request, Response } from 'express';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';
import { BrandService } from '../services/brand.service';

export class BrandController {
  // ── List brands for the organisation ────────────────────────────────────

  static async list(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);

      const brands = await BrandService.list(orgId);

      const result = brands.map((brand) => ({
        id: toStringId(brand.id),
        orgId: toStringId(brand.orgId),
        tag: brand.tag,
        name: brand.name,
        logo: brand.logo,
        tagline: brand.tagline,
        primaryColor: brand.primaryColor,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      }));

      R.ok(res, result, { total: result.length });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Get single brand by ID ─────────────────────────────────────────────

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const brandId = toBigInt(id);

      const brand = await BrandService.getById(orgId, brandId);

      const result = {
        id: toStringId(brand.id),
        orgId: toStringId(brand.orgId),
        tag: brand.tag,
        name: brand.name,
        logo: brand.logo,
        tagline: brand.tagline,
        primaryColor: brand.primaryColor,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      };

      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'BRAND_NOT_FOUND') {
        R.notFound(res, 'Brand');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const { name, tag, tagline, primaryColor, logo } = req.body;

      if (!name || !tag) {
        R.badRequest(res, 'Brand name and tag are required');
        return;
      }

      const brand = await BrandService.create(orgId, {
        name,
        tag,
        tagline,
        primaryColor,
        logo,
        createdBy: toStringId(req.auth!.userId),
      });

      R.created(res, {
        id: toStringId(brand.id),
        orgId: toStringId(brand.orgId),
        tag: brand.tag,
        name: brand.name,
        logo: brand.logo,
        tagline: brand.tagline,
        primaryColor: brand.primaryColor,
        isActive: brand.isActive,
      });
    } catch (err: any) {
      if (err.message === 'BRAND_TAG_EXISTS') {
        R.conflict(res, 'Brand tag already exists');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const brandId = toBigInt(id);

      const brand = await BrandService.update(orgId, brandId, req.body);

      R.ok(res, {
        id: toStringId(brand.id),
        orgId: toStringId(brand.orgId),
        tag: brand.tag,
        name: brand.name,
        logo: brand.logo,
        tagline: brand.tagline,
        primaryColor: brand.primaryColor,
        isActive: brand.isActive,
      });
    } catch (err: any) {
      if (err.message === 'BRAND_NOT_FOUND') {
        R.notFound(res, 'Brand');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const brandId = toBigInt(id);

      await BrandService.delete(orgId, brandId);
      R.ok(res, { message: 'Brand deleted successfully' });
    } catch (err: any) {
      if (err.message === 'BRAND_NOT_FOUND') {
        R.notFound(res, 'Brand');
      } else {
        R.serverError(res, err.message);
      }
    }
  }
}
