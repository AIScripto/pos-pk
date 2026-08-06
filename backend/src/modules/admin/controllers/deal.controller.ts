import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

export class DealController {
  static async list(req: Request, res: Response) {
    try {
      const orgIdStr = (req.query.orgId as string) ?? req.auth?.orgId;
      if (!orgIdStr) {
        return R.ok(res, []);
      }
      const orgId = BigInt(orgIdStr);

      const deals = await prisma.deal.findMany({
        where: { orgId },
        include: { category: true },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      });

      // Convert BigInt to string for JSON serialization
      const resolved = deals.map(d => {
        let productIds: string[] = [];
        try {
          productIds = JSON.parse(d.productIdsJson || '[]');
        } catch {}
        return {
          ...d,
          id: d.id.toString(),
          orgId: d.orgId.toString(),
          categoryId: d.categoryId ? d.categoryId.toString() : null,
          categoryName: d.category?.name || null,
          productIds,
        };
      });

      R.ok(res, resolved);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const orgId = BigInt(req.auth!.orgId);
      const deal = await prisma.deal.findFirst({
        where: { id: BigInt(req.params.id), orgId },
        include: { category: true },
      });

      if (!deal) {
        return R.notFound(res, 'Deal');
      }

      let productIds: string[] = [];
      try {
        productIds = JSON.parse(deal.productIdsJson || '[]');
      } catch {}

      const resolved = {
        ...deal,
        id: deal.id.toString(),
        orgId: deal.orgId.toString(),
        categoryId: deal.categoryId ? deal.categoryId.toString() : null,
        categoryName: deal.category?.name || null,
        productIds,
      };

      R.ok(res, resolved);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const {
        name,
        tag,
        description,
        categoryId,
        basePricePaisa,
        salePricePaisa,
        discountPercentage,
        availabilityType,
        availableDays,
        startTime,
        endTime,
        productIds,
      } = req.body;

      const orgId = BigInt(req.auth!.orgId);
      const userId = req.auth!.userId;

      // Validation
      if (!name?.trim()) {
        return R.badRequest(res, 'Deal name is required');
      }
      if (!tag?.trim()) {
        return R.badRequest(res, 'Deal tag is required');
      }
      if (basePricePaisa === undefined || basePricePaisa === null || Number.isNaN(Number(basePricePaisa))) {
        return R.badRequest(res, 'Base price is required and must be numeric');
      }
      if (salePricePaisa !== undefined && salePricePaisa !== null && Number.isNaN(Number(salePricePaisa))) {
        return R.badRequest(res, 'Sale price must be numeric');
      }
      if (discountPercentage !== undefined && discountPercentage !== null) {
        const discount = Number(discountPercentage);
        if (Number.isNaN(discount) || discount < 0 || discount > 100) {
          return R.badRequest(res, 'Discount percentage must be between 0 and 100');
        }
      }

      // Check for duplicate tag within organization
      const existingTag = await prisma.deal.findFirst({
        where: { orgId, tag: tag.toLowerCase() },
      });

      if (existingTag) {
        return R.badRequest(res, 'Deal tag already exists in this organization');
      }

      let parsedCategoryId: bigint | null = null;
      if (categoryId) {
        parsedCategoryId = BigInt(categoryId);
      }

      const deal = await prisma.deal.create({
        data: {
          orgId,
          categoryId: parsedCategoryId,
          name: name.trim(),
          tag: tag.toLowerCase(),
          description: description?.trim() || null,
          productIdsJson: Array.isArray(productIds) ? JSON.stringify(productIds) : null,
          basePricePaisa: Math.round(basePricePaisa),
          salePricePaisa: salePricePaisa ? Math.round(salePricePaisa) : null,
          discountPercentage: discountPercentage || null,
          availabilityType: availabilityType === 'scheduled' ? 'scheduled' : 'all_time',
          availableDays: availableDays?.trim() || null,
          startTime: startTime?.trim() || null,
          endTime: endTime?.trim() || null,
          createdBy: userId,
        },
        include: { category: true },
      });

      let resolvedProductIds: string[] = [];
      try {
        resolvedProductIds = JSON.parse(deal.productIdsJson || '[]');
      } catch {}

      const resolved = {
        ...deal,
        id: deal.id.toString(),
        orgId: deal.orgId.toString(),
        categoryId: deal.categoryId ? deal.categoryId.toString() : null,
        categoryName: deal.category?.name || null,
        productIds: resolvedProductIds,
      };

      R.created(res, resolved);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        categoryId,
        basePricePaisa,
        salePricePaisa,
        discountPercentage,
        availabilityType,
        availableDays,
        startTime,
        endTime,
        isActive,
        productIds,
      } = req.body;

      const orgId = BigInt(req.auth!.orgId);
      const dealId = BigInt(req.params.id);

      // Validation
      if (name !== undefined && !name?.trim()) {
        return R.badRequest(res, 'Deal name cannot be empty');
      }
      if (basePricePaisa !== undefined && (basePricePaisa === null || Number.isNaN(Number(basePricePaisa)))) {
        return R.badRequest(res, 'Base price must be numeric');
      }
      if (salePricePaisa !== undefined && salePricePaisa !== null && Number.isNaN(Number(salePricePaisa))) {
        return R.badRequest(res, 'Sale price must be numeric');
      }
      if (discountPercentage !== undefined && discountPercentage !== null) {
        const discount = Number(discountPercentage);
        if (Number.isNaN(discount) || discount < 0 || discount > 100) {
          return R.badRequest(res, 'Discount percentage must be between 0 and 100');
        }
      }

      const existingDeal = await prisma.deal.findFirst({
        where: { id: dealId, orgId },
        select: { id: true },
      });
      if (!existingDeal) {
        return R.notFound(res, 'Deal');
      }

      let parsedCategoryId: bigint | null | undefined = undefined;
      if (categoryId === null) {
        parsedCategoryId = null;
      } else if (categoryId !== undefined) {
        parsedCategoryId = BigInt(categoryId);
      }

      const deal = await prisma.deal.update({
        where: { id: dealId },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(parsedCategoryId !== undefined && { categoryId: parsedCategoryId }),
          ...(productIds !== undefined && { productIdsJson: Array.isArray(productIds) ? JSON.stringify(productIds) : null }),
          ...(basePricePaisa !== undefined && { basePricePaisa: Math.round(basePricePaisa) }),
          ...(salePricePaisa !== undefined && { salePricePaisa: salePricePaisa ? Math.round(salePricePaisa) : null }),
          ...(discountPercentage !== undefined && { discountPercentage: discountPercentage || null }),
          ...(availabilityType !== undefined && { availabilityType: availabilityType === 'scheduled' ? 'scheduled' : 'all_time' }),
          ...(availableDays !== undefined && { availableDays: availableDays?.trim() || null }),
          ...(startTime !== undefined && { startTime: startTime?.trim() || null }),
          ...(endTime !== undefined && { endTime: endTime?.trim() || null }),
          ...(isActive !== undefined && { isActive }),
          updatedAt: new Date(),
        },
        include: { category: true },
      });

      let resolvedProductIds: string[] = [];
      try {
        resolvedProductIds = JSON.parse(deal.productIdsJson || '[]');
      } catch {}

      const resolved = {
        ...deal,
        id: deal.id.toString(),
        orgId: deal.orgId.toString(),
        categoryId: deal.categoryId ? deal.categoryId.toString() : null,
        categoryName: deal.category?.name || null,
        productIds: resolvedProductIds,
      };

      R.ok(res, resolved);
    } catch (err: any) {
      if (err.code === 'P2025') {
        return R.notFound(res, 'Deal');
      }
      R.badRequest(res, err.message);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const dealId = BigInt(req.params.id);
      const orgId = BigInt(req.auth!.orgId);

      const existingDeal = await prisma.deal.findFirst({
        where: { id: dealId, orgId },
        select: { id: true },
      });
      if (!existingDeal) {
        return R.notFound(res, 'Deal');
      }

      await prisma.deal.update({
        where: { id: dealId },
        data: { isActive: false },
      });

      R.noContent(res);
    } catch (err: any) {
      if (err.code === 'P2025') {
        return R.notFound(res, 'Deal');
      }
      R.badRequest(res, err.message);
    }
  }
}
