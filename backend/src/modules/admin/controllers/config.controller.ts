import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

// Helper — serialize BigInt fields
function serializeConfig(obj: any): any {
  if (!obj) return obj;
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    // Ids are numbers now; keep them strings on the wire (see id-serializer.ts).
    if (typeof result[key] === 'bigint') result[key] = result[key].toString();
    else if (typeof result[key] === 'number' && /^id$|Id$/.test(key)) result[key] = String(result[key]);
    else if (Array.isArray(result[key])) result[key] = result[key].map(serializeConfig);
    else if (result[key] !== null && typeof result[key] === 'object' && !(result[key] instanceof Date)) {
      result[key] = serializeConfig(result[key]);
    }
  }
  return result;
}

export class ConfigController {

  // ═══════════════════════════════════════════════════════
  // SECTION 1 — Organisation Profile + Currency + Locale + Receipt
  // ═══════════════════════════════════════════════════════

  static async getOrgConfig(req: Request, res: Response) {
    try {
      const config = await prisma.orgConfig.findFirst({
        where:   { orgId: Number(req.auth!.orgId), isActive: true },
        include: {
          defaultBranch: {
            include: {
              city: { select: { id: true, name: true, code: true } },
              area: { select: { id: true, name: true, tag:  true } },
            },
          },
        },
      });
      R.ok(res, serializeConfig(config));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async upsertOrgConfig(req: Request, res: Response) {
    try {
      const orgId = Number(req.auth!.orgId);
      // Strip read-only / relation fields
      const { id, createdAt, updatedAt, createdBy, orgId: _oid, org, defaultBranch, ...rest } = req.body;
      const data = { ...rest };
      if (data.defaultBranchId && data.defaultBranchId !== '') {
        data.defaultBranchId = Number(data.defaultBranchId);
      } else {
        data.defaultBranchId = null;
      }
      const config = await prisma.orgConfig.upsert({
        where:  { orgId },
        update: { ...data, updatedAt: new Date() },
        create: { ...data, orgId, createdBy: req.auth!.userId },
      });
      R.ok(res, serializeConfig(config));
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  // ═══════════════════════════════════════════════════════
  // SECTION 2 — Tax Configuration
  // ═══════════════════════════════════════════════════════

  static async listTaxConfigs(req: Request, res: Response) {
    try {
      const configs = await prisma.taxConfig.findMany({
        where:   { orgId: Number(req.auth!.orgId), isActive: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      });
      R.ok(res, configs.map(serializeConfig));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  // GET /config/tax/resolve?paymentMethod=card|cash|wallet
  // Used by POS at checkout to get the applicable tax for a given payment method.
  // Resolution order: exact paymentMethod match → "all" fallback → org default
  static async getTaxConfig(req: Request, res: Response) {
    try {
      const orgId         = Number(req.auth!.orgId);
      const paymentMethod = (req.query.paymentMethod as string) || 'all';

      // 1. Try exact payment method match (e.g. "card" → Card WHT 5%)
      let config = await prisma.taxConfig.findFirst({
        where: { orgId, isActive: true, paymentMethod },
        orderBy: { branchId: 'desc' },
      });

      // 2. Fallback to "all" (standard GST 16%)
      if (!config) {
        config = await prisma.taxConfig.findFirst({
          where: { orgId, isActive: true, paymentMethod: 'all', isDefault: true },
        });
      }

      R.ok(res, serializeConfig(config));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async createTaxConfig(req: Request, res: Response) {
    try {
      const orgId = Number(req.auth!.orgId);
      const data  = { ...req.body };
      if (data.branchId) data.branchId = Number(data.branchId);
      if (data.isDefault) {
        await prisma.taxConfig.updateMany({ where: { orgId, isDefault: true }, data: { isDefault: false } });
      }
      const config = await prisma.taxConfig.create({
        data: { ...data, orgId, createdBy: req.auth!.userId },
      });
      R.created(res, serializeConfig(config));
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async updateTaxConfig(req: Request, res: Response) {
    try {
      const orgId = Number(req.auth!.orgId);
      const data  = { ...req.body };
      if (data.isDefault) {
        await prisma.taxConfig.updateMany({ where: { orgId, isDefault: true }, data: { isDefault: false } });
      }
      const config = await prisma.taxConfig.update({
        where: { id: Number(req.params.id) },
        data:  { ...data, updatedAt: new Date() },
      });
      R.ok(res, serializeConfig(config));
    } catch {
      R.notFound(res, 'TaxConfig');
    }
  }

  static async deleteTaxConfig(req: Request, res: Response) {
    await prisma.taxConfig.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    R.noContent(res);
  }

  // ═══════════════════════════════════════════════════════
  // SECTION 3 — Discount Presets
  // ═══════════════════════════════════════════════════════

  static async listDiscounts(req: Request, res: Response) {
    try {
      const presets = await prisma.discountPreset.findMany({
        where:   { orgId: Number(req.auth!.orgId), isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      R.ok(res, presets.map(serializeConfig));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async createDiscount(req: Request, res: Response) {
    try {
      const preset = await prisma.discountPreset.create({
        data: { ...req.body, orgId: Number(req.auth!.orgId), createdBy: req.auth!.userId },
      });
      R.created(res, serializeConfig(preset));
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async updateDiscount(req: Request, res: Response) {
    try {
      const preset = await prisma.discountPreset.update({
        where: { id: Number(req.params.id) },
        data:  { ...req.body, updatedAt: new Date() },
      });
      R.ok(res, serializeConfig(preset));
    } catch {
      R.notFound(res, 'DiscountPreset');
    }
  }

  static async removeDiscount(req: Request, res: Response) {
    await prisma.discountPreset.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    R.noContent(res);
  }

  // ═══════════════════════════════════════════════════════
  // SECTION 4 — Loyalty Program
  // ═══════════════════════════════════════════════════════

  static async getLoyaltyConfig(req: Request, res: Response) {
    try {
      const config = await prisma.loyaltyConfig.findFirst({
        where:   { orgId: Number(req.auth!.orgId), isActive: true },
        include: { tiers: { where: { isActive: true }, orderBy: { minPoints: 'asc' } } },
      });
      R.ok(res, serializeConfig(config));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async upsertLoyaltyConfig(req: Request, res: Response) {
    try {
      const orgId = Number(req.auth!.orgId);
      // Strip read-only / relation fields that Prisma rejects on update
      const { id, tiers, createdAt, updatedAt, createdBy, orgId: _oid, org, ...data } = req.body;
      const config = await prisma.loyaltyConfig.upsert({
        where:  { orgId },
        update: { ...data, updatedAt: new Date() },
        create: { ...data, orgId, createdBy: req.auth!.userId },
      });
      R.ok(res, serializeConfig(config));
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  // ═══════════════════════════════════════════════════════
  // SECTION 5 — Branch Settings
  // ═══════════════════════════════════════════════════════

  static async getBranch(req: Request, res: Response) {
    const branch = await prisma.branch.findUnique({
      where:   { id: Number(req.params.branchId) },
      include: { city: true, area: true },
    });
    if (!branch) return R.notFound(res, 'Branch');
    R.ok(res, serializeConfig(branch));
  }

  static async updateBranch(req: Request, res: Response) {
    try {
      const branch = await prisma.branch.update({
        where: { id: Number(req.params.branchId) },
        data:  { ...req.body, updatedAt: new Date() },
      });
      R.ok(res, serializeConfig(branch));
    } catch {
      R.notFound(res, 'Branch');
    }
  }
}
