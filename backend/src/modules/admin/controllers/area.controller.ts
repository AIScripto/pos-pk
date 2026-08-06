// =============================================================================
// Area Controller — CRUD for geographic/operational zones within cities
// =============================================================================

import { Request, Response } from 'express';
import '../../../shared/middleware/auth.middleware';  // For Request.auth type extension
import { AreaService } from '../services/area.service';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';
import prisma from '../../../shared/lib/prisma';

export class AreaController {

  static async list(req: Request, res: Response) {
    try {
      const { cityId, search } = req.query;
      const auth = req.auth!;

      if (!cityId) return R.badRequest(res, 'cityId required');

      const cityIdBigInt = toBigInt(String(cityId));
      const results = await AreaService.list(
        BigInt(auth.orgId),
        cityIdBigInt,
        search ? String(search) : undefined
      );

      const mapped = results.map((a) => ({
        id: toStringId(a.id),
        cityId: toStringId(a.cityId),
        orgId: toStringId(a.orgId) || 1,
        tag: a.tag,
        name: a.name,
        details: a.details,
        latitude: a.latitude ? parseFloat(a.latitude.toString()) : null,
        longitude: a.longitude ? parseFloat(a.longitude.toString()) : null,
        isActive: a.isActive,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));

      R.ok(res, mapped);
    } catch (err: any) {
      if (err.message === 'CITY_NOT_FOUND') return R.notFound(res, 'City not found');
      R.serverError(res, err.message);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = req.auth!;

      const area = await AreaService.get(BigInt(auth.orgId), toBigInt(id));
      if (!area) return R.notFound(res, 'Area not found');

      const mapped = {
        id: toStringId(area.id),
        cityId: toStringId(area.cityId),
        orgId: toStringId(area.orgId),
        tag: area.tag,
        name: area.name,
        details: area.details,
        latitude: area.latitude ? parseFloat(area.latitude.toString()) : null,
        longitude: area.longitude ? parseFloat(area.longitude.toString()) : null,
        isActive: area.isActive,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt,
      };

      R.ok(res, mapped);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { cityId, tag, name, details, latitude, longitude, isActive } = req.body;
      const auth = req.auth!;

      // Validation
      if (!cityId || !tag || !name) {
        return R.badRequest(res, 'cityId, tag, and name required');
      }

      if (tag.length > 20) {
        return R.badRequest(res, 'tag must be 20 characters or less');
      }

      if (latitude && (latitude < -90 || latitude > 90)) {
        return R.badRequest(res, 'latitude must be between -90 and 90');
      }

      if (longitude && (longitude < -180 || longitude > 180)) {
        return R.badRequest(res, 'longitude must be between -180 and 180');
      }

      const result = await AreaService.create(BigInt(auth.orgId), {
        cityId: toBigInt(cityId),
        tag: String(tag).toUpperCase().trim(),
        name: String(name).trim(),
        details: details ? String(details).trim() : null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      });

      const mapped = {
        id: toStringId(result.id),
        cityId: toStringId(result.cityId),
        orgId: toStringId(result.orgId),
        tag: result.tag,
        name: result.name,
        details: result.details,
        latitude: result.latitude ? parseFloat(result.latitude.toString()) : null,
        longitude: result.longitude ? parseFloat(result.longitude.toString()) : null,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      R.created(res, mapped);
    } catch (err: any) {
      if (err.message === 'CITY_NOT_FOUND') return R.notFound(res, 'City not found');
      if (err.message === 'CITY_NOT_IN_ORG') return R.notFound(res, 'City not found');
      if (err.message === 'DUPLICATE_TAG') {
        return R.conflict(res, `Area with tag "${req.body.tag}" already exists in this city`);
      }
      R.serverError(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tag, name, details, latitude, longitude, isActive } = req.body;
      const auth = req.auth!;

      // Validation
      if (tag && tag.length > 20) {
        return R.badRequest(res, 'tag must be 20 characters or less');
      }

      if (latitude && (latitude < -90 || latitude > 90)) {
        return R.badRequest(res, 'latitude must be between -90 and 90');
      }

      if (longitude && (longitude < -180 || longitude > 180)) {
        return R.badRequest(res, 'longitude must be between -180 and 180');
      }

      const result = await AreaService.update(BigInt(auth.orgId), toBigInt(id), {
        tag: tag ? String(tag).toUpperCase().trim() : undefined,
        name: name ? String(name).trim() : undefined,
        details: details !== undefined ? (details ? String(details).trim() : null) : undefined,
        latitude: latitude !== undefined ? (latitude ? Number(latitude) : null) : undefined,
        longitude: longitude !== undefined ? (longitude ? Number(longitude) : null) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      });

      if (!result) return R.notFound(res, 'Area not found');

      const mapped = {
        id: toStringId(result.id),
        cityId: toStringId(result.cityId),
        orgId: toStringId(result.orgId),
        tag: result.tag,
        name: result.name,
        details: result.details,
        latitude: result.latitude ? parseFloat(result.latitude.toString()) : null,
        longitude: result.longitude ? parseFloat(result.longitude.toString()) : null,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };

      R.ok(res, mapped);
    } catch (err: any) {
      if (err.message === 'DUPLICATE_TAG') {
        return R.conflict(res, `Area with tag "${req.body.tag}" already exists in this city`);
      }
      if (err.message === 'NOT_FOUND') return R.notFound(res, 'Area not found');
      R.serverError(res, err.message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = req.auth!;

      const deleted = await AreaService.delete(BigInt(auth.orgId), toBigInt(id));
      if (!deleted) return R.notFound(res, 'Area not found');

      R.noContent(res);
    } catch (err: any) {
      if (err.message === 'HAS_ACTIVE_BRANCHES') {
        return R.conflict(res, 'Cannot delete area with active branches');
      }
      if (err.message === 'NOT_FOUND') return R.notFound(res, 'Area not found');
      R.serverError(res, err.message);
    }
  }

}
