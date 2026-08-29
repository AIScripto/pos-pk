import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

// ---------------------------------------------------------------------------
// Shared helper — computes the next SKU for a given category within an org.
// Format: <TAG>-<5-digit sequence>  e.g. CHK-00001 … CHK-00099 → CHK-00100
// Uses the numeric suffix of ALL existing SKUs (including soft-deleted) so
// sequence numbers are never reused.
// ---------------------------------------------------------------------------
async function computeNextSku(orgId: number, categoryId: number, categoryTag: string): Promise<string> {
  const existing = await prisma.product.findMany({
    where: { orgId, categoryId },   // includes soft-deleted (isActive: false)
    select: { sku: true },
  });

  let nextSeq = 1;
  if (existing.length > 0) {
    const sequences = existing
      .map(p => p.sku.match(/(\d+)$/))
      .filter(Boolean)
      .map(m => parseInt(m![1], 10));
    if (sequences.length > 0) nextSeq = Math.max(...sequences) + 1;
  }

  // padStart(5) → 00001 … 00099 → 00100 → 10000 (grows beyond 5 naturally)
  return `${categoryTag}-${String(nextSeq).padStart(5, '0')}`;
}

export class ProductController {

  static async list(req: Request, res: Response) {
    const orgId    = Number((req.query.orgId as string) ?? req.auth!.orgId);
    const branchId = Number((req.query.branchId as string) ?? req.auth!.branchId);

    const products = await prisma.product.findMany({
      where:   { orgId, isActive: true },
      include: {
        category:      { select: { tag: true, name: true } },
        branchConfigs: { where: { branchId, isActive: true } },
        inventory:     { where: { branchId } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const resolved = products.map((p) => {
      const cfg = p.branchConfigs[0];
      return {
        id: p.id.toString(),
        orgId: p.orgId.toString(),
        categoryId: p.categoryId?.toString() || null,
        categoryTag: p.category?.tag || null,
        categoryName: p.category?.name || null,
        name: p.name,
        sku: p.sku,
        basePricePaisa: p.basePricePaisa,
        salePricePaisa: p.salePricePaisa,
        imageUrl: p.imageUrl,
        description: p.description,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        createdBy: p.createdBy,
        effectivePricePaisa:     cfg?.pricePaisa     ?? p.basePricePaisa,
        effectiveSalePricePaisa: cfg?.salePricePaisa ?? p.salePricePaisa,
        stockQty:     p.inventory[0]?.quantity     ?? 0,
        minThreshold: p.inventory[0]?.minThreshold ?? 5,
      };
    });

    R.ok(res, resolved);
  }

  static async get(req: Request, res: Response) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          branchConfigs: true,
          inventory: true,
        },
      });

      if (!product) return R.notFound(res, 'Product');

      R.ok(res, {
        ...product,
        id: product.id.toString(),
        orgId: product.orgId.toString(),
      });
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  // GET /admin/products/sku/next/:categoryId
  // Returns the SKU that will be assigned to the next product in this category.
  static async nextSku(req: Request, res: Response) {
    try {
      const orgId      = Number(req.auth!.orgId);
      const categoryId = Number(req.params.categoryId);

      const category = await prisma.category.findFirst({
        where: { id: categoryId, orgId, isActive: true },
      });
      if (!category) return R.badRequest(res, 'CATEGORY_NOT_FOUND');

      const sku = await computeNextSku(orgId, categoryId, category.tag);
      R.ok(res, { sku });
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { categoryId, name, basePricePaisa, salePricePaisa, description, imageUrl, sortOrder } = req.body;
      const orgId = Number(req.auth!.orgId);

      if (!categoryId)                                                   return R.badRequest(res, 'CATEGORY_REQUIRED');
      if (!name?.trim())                                                 return R.badRequest(res, 'NAME_REQUIRED');
      if (typeof basePricePaisa !== 'number' || basePricePaisa < 0)     return R.badRequest(res, 'INVALID_PRICE');

      const category = await prisma.category.findFirst({
        where: { id: Number(categoryId), orgId, isActive: true },
      });
      if (!category) return R.badRequest(res, 'CATEGORY_NOT_FOUND');

      // Generate SKU using the shared helper (same logic as nextSku endpoint)
      const sku = await computeNextSku(orgId, Number(categoryId), category.tag);

      const product = await prisma.product.create({
        data: {
          org:      { connect: { id: orgId } },
          category: { connect: { id: Number(categoryId) } },
          name:           name.trim(),
          sku,
          basePricePaisa,
          salePricePaisa: salePricePaisa ?? null,
          description:    description?.trim() || '',
          imageUrl:       imageUrl?.trim()    || '',
          sortOrder:      sortOrder           ?? 0,
          createdBy:      req.auth!.userId,
        },
      });

      R.created(res, {
        ...product,
        id:         product.id.toString(),
        orgId:      product.orgId.toString(),
        categoryId: product.categoryId?.toString() || null,
      });
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id, ...data } = req.body;
      const product = await prisma.product.update({
        where: { id: Number(req.params.id) },
        data:  { ...data, updatedAt: new Date() },
      });

      R.ok(res, {
        ...product,
        id:    product.id.toString(),
        orgId: product.orgId.toString(),
      });
    } catch {
      R.notFound(res, 'Product');
    }
  }

  static async remove(req: Request, res: Response) {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data:  { isActive: false },
    });
    R.noContent(res);
  }
}
