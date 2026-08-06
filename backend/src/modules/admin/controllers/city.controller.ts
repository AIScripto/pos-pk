// =============================================================================
// City Controller — CRUD operations for cities
// =============================================================================

import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';

export class CityController {

  // ── List cities for the organisation ────────────────────────────────────

  static async list(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);

      const cities = await prisma.city.findMany({
        where: { orgId, isActive: true },
        orderBy: [{ code: 'asc' }],
      });

      const result = cities.map((city) => ({
        id: toStringId(city.id),
        orgId: toStringId(city.orgId),
        name: city.name,
        code: city.code,
        stateId: city.stateId ? toStringId(city.stateId) : null,
        latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
        longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
        country: city.country,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      }));

      R.ok(res, result, { total: result.length });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Get single city by ID ──────────────────────────────────────────────────

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const cityId = toBigInt(id);

      const city = await prisma.city.findFirst({
        where: { id: cityId, orgId },
      });

      if (!city) return R.notFound(res, 'City');

      const result = {
        id: toStringId(city.id),
        orgId: toStringId(city.orgId),
        name: city.name,
        code: city.code,
        stateId: city.stateId ? toStringId(city.stateId) : null,
        latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
        longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
        country: city.country,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      };

      R.ok(res, result);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Create new city ─────────────────────────────────────────────────────────

  static async create(req: Request, res: Response) {
    try {
      const { name, code, stateId, country, latitude, longitude } = req.body;
      const orgId = toBigInt(req.auth!.orgId);

      // Validation
      if (!name || !code) return R.badRequest(res, 'name and code are required');
      if (code.length !== 3) return R.badRequest(res, 'code must be exactly 3 letters');
      if (latitude && (latitude < -90 || latitude > 90)) {
        return R.badRequest(res, 'latitude must be between -90 and 90');
      }
      if (longitude && (longitude < -180 || longitude > 180)) {
        return R.badRequest(res, 'longitude must be between -180 and 180');
      }

      // Check for duplicates
      const existing = await prisma.city.findFirst({
        where: {
          orgId,
          OR: [{ name }, { code: code.toUpperCase() }],
        },
      });
      if (existing) {
        return R.conflict(res, `City with name "${name}" or code "${code}" already exists`);
      }

      const city = await prisma.city.create({
        data: {
          orgId,
          name,
          code: code.toUpperCase(),
          stateId: stateId ? toBigInt(stateId) : null,
          country: country || 'PK',
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          createdBy: req.auth!.userId,
        },
      });

      const result = {
        id: toStringId(city.id),
        orgId: toStringId(city.orgId),
        name: city.name,
        code: city.code,
        stateId: city.stateId ? toStringId(city.stateId) : null,
        latitude: city.latitude ? parseFloat(city.latitude.toString()) : null,
        longitude: city.longitude ? parseFloat(city.longitude.toString()) : null,
        country: city.country,
        isActive: city.isActive,
        createdAt: city.createdAt,
        updatedAt: city.updatedAt,
      };

      R.created(res, result);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Update city ────────────────────────────────────────────────────────────

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, stateId, country, latitude, longitude, isActive } = req.body;
      const orgId = toBigInt(req.auth!.orgId);
      const cityId = toBigInt(id);

      const city = await prisma.city.findFirst({
        where: { id: cityId, orgId },
      });
      if (!city) return R.notFound(res, 'City');

      // Validation
      if (code && code.length !== 3) {
        return R.badRequest(res, 'code must be exactly 3 letters');
      }
      if (latitude && (latitude < -90 || latitude > 90)) {
        return R.badRequest(res, 'latitude must be between -90 and 90');
      }
      if (longitude && (longitude < -180 || longitude > 180)) {
        return R.badRequest(res, 'longitude must be between -180 and 180');
      }

      // Check for duplicate code or name (excluding current city)
      if (name || code) {
        const existing = await prisma.city.findFirst({
          where: {
            orgId,
            id: { not: cityId },
            OR: [
              ...(name ? [{ name }] : []),
              ...(code ? [{ code: code.toUpperCase() }] : []),
            ],
          },
        });
        if (existing) {
          return R.conflict(
            res,
            `City with name "${name}" or code "${code}" already exists`,
          );
        }
      }

      const updated = await prisma.city.update({
        where: { id: cityId },
        data: {
          ...(name && { name }),
          ...(code && { code: code.toUpperCase() }),
          ...(stateId !== undefined && { stateId: stateId ? toBigInt(stateId) : null }),
          ...(country && { country }),
          ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
          ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      const result = {
        id: toStringId(updated.id),
        orgId: toStringId(updated.orgId),
        name: updated.name,
        code: updated.code,
        stateId: updated.stateId ? toStringId(updated.stateId) : null,
        latitude: updated.latitude ? parseFloat(updated.latitude.toString()) : null,
        longitude: updated.longitude ? parseFloat(updated.longitude.toString()) : null,
        country: updated.country,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      R.ok(res, result);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // ── Delete (soft delete) city ────────────────────────────────────────────────

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orgId = toBigInt(req.auth!.orgId);
      const cityId = toBigInt(id);

      const city = await prisma.city.findFirst({
        where: { id: cityId, orgId },
      });
      if (!city) return R.notFound(res, 'City');

      // Check if city has active branches
      const activeBranches = await prisma.branch.findFirst({
        where: { cityId, isActive: true },
      });
      if (activeBranches) {
        return R.badRequest(res, 'Cannot delete city with active branches');
      }

      await prisma.city.update({
        where: { id: cityId },
        data: { isActive: false },
      });

      R.noContent(res);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }
}
