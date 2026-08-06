// =============================================================================
// Branch Controller — CRUD endpoints for branch management
// =============================================================================

import { Request, Response } from 'express';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';
import { BranchService } from '../services/branch.service';

export class BranchController {
  // ── List branches ────────────────────────────────────────────────────────

  static async list(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const { cityId: cityIdStr, search } = req.query;

      const cityId = cityIdStr ? toBigInt(String(cityIdStr)) : undefined;

      const branches = await BranchService.list(orgId, cityId, search as string | undefined);

      const result = branches.map((branch) => ({
        id: toStringId(branch.id),
        orgId: toStringId(branch.orgId),
        brandId: toStringId(branch.brandId),
        cityId: toStringId(branch.cityId),
        areaId: branch.areaId ? toStringId(branch.areaId) : null,
        label: branch.label,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        addrLine1: branch.addrLine1,
        addrLine2: branch.addrLine2,
        addrArea: branch.addrArea,
        addrCity: branch.addrCity,
        addrState: branch.addrState,
        addrCountry: branch.addrCountry,
        addrPostCode: branch.addrPostCode,
        addrLat: branch.addrLat,
        addrLng: branch.addrLng,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        brand: branch.brand,
        city: branch.city,
        area: branch.area,
      }));

      R.ok(res, result, { total: result.length });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Get single branch by ID ──────────────────────────────────────────────

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const branchId = toBigInt(id);

      const branch = await BranchService.getById(orgId, branchId);

      const result = {
        id: toStringId(branch.id),
        orgId: toStringId(branch.orgId),
        brandId: toStringId(branch.brandId),
        cityId: toStringId(branch.cityId),
        areaId: branch.areaId ? toStringId(branch.areaId) : null,
        label: branch.label,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        addrLine1: branch.addrLine1,
        addrLine2: branch.addrLine2,
        addrArea: branch.addrArea,
        addrCity: branch.addrCity,
        addrState: branch.addrState,
        addrCountry: branch.addrCountry,
        addrPostCode: branch.addrPostCode,
        addrLat: branch.addrLat,
        addrLng: branch.addrLng,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        brand: branch.brand,
        city: branch.city,
        area: branch.area,
      };

      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'BRANCH_NOT_FOUND') {
        R.notFound(res, 'Branch');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  // ── Create new branch ────────────────────────────────────────────────────

  static async create(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const { brandId, cityId, areaId, label, name, phone, email, managerId, openTime, closeTime, addrLine1, addrLine2, addrArea, addrCity, addrState, addrCountry, addrPostCode, addrLat, addrLng } = req.body;

      // Validate required fields
      if (!brandId || !cityId || !label || !name) {
        return R.badRequest(res, 'Missing required fields: brandId, cityId, label, name');
      }

      const branch = await BranchService.create(orgId, {
        brandId: toBigInt(brandId),
        cityId: toBigInt(cityId),
        areaId: areaId ? toBigInt(areaId) : undefined,
        label,
        name,
        phone,
        email,
        managerId,
        openTime,
        closeTime,
        addrLine1,
        addrLine2,
        addrArea,
        addrCity,
        addrState,
        addrCountry,
        addrPostCode,
        addrLat,
        addrLng,
      });

      const result = {
        id: toStringId(branch.id),
        orgId: toStringId(branch.orgId),
        brandId: toStringId(branch.brandId),
        cityId: toStringId(branch.cityId),
        areaId: branch.areaId ? toStringId(branch.areaId) : null,
        label: branch.label,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        addrLine1: branch.addrLine1,
        addrLine2: branch.addrLine2,
        addrArea: branch.addrArea,
        addrCity: branch.addrCity,
        addrState: branch.addrState,
        addrCountry: branch.addrCountry,
        addrPostCode: branch.addrPostCode,
        addrLat: branch.addrLat,
        addrLng: branch.addrLng,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        brand: branch.brand,
        city: branch.city,
        area: branch.area,
      };

      R.created(res, result);
    } catch (err: any) {
      if (err.message === 'BRAND_NOT_FOUND') {
        R.badRequest(res, 'Brand not found');
      } else if (err.message === 'CITY_NOT_FOUND') {
        R.badRequest(res, 'City not found');
      } else if (err.message === 'AREA_NOT_FOUND_FOR_CITY') {
        R.badRequest(res, 'Area not found for the selected city');
      } else if (err.message === 'DUPLICATE_LABEL') {
        R.conflict(res, 'Branch label already exists');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  // ── Update branch ───────────────────────────────────────────────────────

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const branchId = toBigInt(id);
      const { areaId, ...data } = req.body;

      const branch = await BranchService.update(orgId, branchId, {
        ...data,
        areaId: areaId ? toBigInt(areaId) : areaId === null ? null : undefined,
      });

      const result = {
        id: toStringId(branch.id),
        orgId: toStringId(branch.orgId),
        brandId: toStringId(branch.brandId),
        cityId: toStringId(branch.cityId),
        areaId: branch.areaId ? toStringId(branch.areaId) : null,
        label: branch.label,
        name: branch.name,
        phone: branch.phone,
        email: branch.email,
        managerId: branch.managerId,
        openTime: branch.openTime,
        closeTime: branch.closeTime,
        addrLine1: branch.addrLine1,
        addrLine2: branch.addrLine2,
        addrArea: branch.addrArea,
        addrCity: branch.addrCity,
        addrState: branch.addrState,
        addrCountry: branch.addrCountry,
        addrPostCode: branch.addrPostCode,
        addrLat: branch.addrLat,
        addrLng: branch.addrLng,
        isActive: branch.isActive,
        createdAt: branch.createdAt,
        updatedAt: branch.updatedAt,
        brand: branch.brand,
        city: branch.city,
        area: branch.area,
      };

      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'BRANCH_NOT_FOUND') {
        R.notFound(res, 'Branch');
      } else if (err.message === 'AREA_NOT_FOUND_FOR_CITY') {
        R.badRequest(res, 'Area not found for the selected city');
      } else if (err.message === 'DUPLICATE_LABEL') {
        R.conflict(res, 'Branch label already exists');
      } else {
        R.serverError(res, err.message);
      }
    }
  }

  // ── Delete (soft delete) branch ──────────────────────────────────────────

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const branchId = toBigInt(id);

      const branch = await BranchService.delete(orgId, branchId);

      const result = {
        id: toStringId(branch.id),
        isActive: branch.isActive,
      };

      R.ok(res, result, { message: 'Branch deleted successfully' });
    } catch (err: any) {
      if (err.message === 'BRANCH_NOT_FOUND') {
        R.notFound(res, 'Branch');
      } else if (err.message === 'HAS_ACTIVE_TERMINALS') {
        R.conflict(res, 'Cannot delete branch with active terminals');
      } else {
        R.serverError(res, err.message);
      }
    }
  }
}
