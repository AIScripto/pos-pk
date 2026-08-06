// =============================================================================
// Category Service — business logic for category CRUD operations
// =============================================================================

import { Prisma } from '@prisma/client';
import prisma from '../../../shared/lib/prisma';
import { assertUnique } from '../../../shared/utils/validation';

interface CreateCategoryInput {
  name: string;
  tag: string;
  foodTypeId: bigint;
  sortOrder?: number;
  isActive?: boolean;
}

interface UpdateCategoryInput {
  name?: string;
  tag?: string;
  foodTypeId?: bigint;
  sortOrder?: number;
  isActive?: boolean;
}

export class CategoryService {

  static async list(orgId: bigint, search?: string) {
    const where: Prisma.CategoryWhereInput = {
      orgId,
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { tag:  { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    return prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async get(orgId: bigint, id: bigint) {
    // Get single category with org validation
    const category = await prisma.category.findFirst({
      where: { id, orgId, isActive: true },
    });
    if (!category) throw new Error('NOT_FOUND');

    return category;
  }

  static async create(orgId: bigint, input: CreateCategoryInput) {
    // Validate required fields
    if (!input.name?.trim()) throw new Error('INVALID_NAME');
    if (!input.tag?.trim()) throw new Error('INVALID_TAG');

    // Normalize and validate tag (exactly 3 characters, uppercase)
    const normalizedTag = input.tag.toUpperCase().trim();
    if (!/^[A-Z0-9]{3}$/.test(normalizedTag)) {
      throw new Error('INVALID_TAG_FORMAT');
    }

    // Validate name length
    if (input.name.length > 50) throw new Error('NAME_TOO_LONG');

    await assertUnique(
      prisma.category.findFirst({ where: { orgId, name: input.name.trim() } }),
      'DUPLICATE_NAME',
    );
    await assertUnique(
      prisma.category.findFirst({ where: { orgId, tag: normalizedTag } }),
      'DUPLICATE_TAG',
    );

    // Validate foodType exists and belongs to this org
    const foodType = await prisma.foodType.findFirst({
      where: { id: input.foodTypeId, orgId, isActive: true },
    });
    if (!foodType) throw new Error('FOOD_TYPE_NOT_FOUND');

    return prisma.category.create({
      data: {
        orgId,
        foodTypeId: input.foodTypeId,
        name: input.name.trim(),
        tag: normalizedTag,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        createdBy: 'system',
      },
    });
  }

  static async update(orgId: bigint, id: bigint, input: UpdateCategoryInput) {
    // Verify category exists and belongs to org
    const existing = await prisma.category.findFirst({
      where: { id, orgId },
    });
    if (!existing) throw new Error('NOT_FOUND');

    const updateData: Prisma.CategoryUpdateInput = {};

    if (input.name !== undefined) {
      if (!input.name?.trim()) throw new Error('INVALID_NAME');
      if (input.name.length > 50) throw new Error('NAME_TOO_LONG');

      if (input.name.trim() !== existing.name) {
        await assertUnique(
          prisma.category.findFirst({ where: { orgId, name: input.name.trim(), id: { not: id } } }),
          'DUPLICATE_NAME',
        );
      }
      updateData.name = input.name.trim();
    }

    if (input.tag !== undefined) {
      const normalizedTag = input.tag.toUpperCase().trim();
      if (!/^[A-Z0-9]{3}$/.test(normalizedTag)) {
        throw new Error('INVALID_TAG_FORMAT');
      }

      if (normalizedTag !== existing.tag) {
        await assertUnique(
          prisma.category.findFirst({ where: { orgId, tag: normalizedTag, id: { not: id } } }),
          'DUPLICATE_TAG',
        );
      }
      updateData.tag = normalizedTag;
    }

    if (input.sortOrder !== undefined) {
      if (input.sortOrder < 0) throw new Error('INVALID_SORT_ORDER');
      updateData.sortOrder = input.sortOrder;
    }

    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    // Update category
    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(orgId: bigint, id: bigint) {
    // Verify category exists and belongs to org
    const category = await prisma.category.findFirst({
      where: { id, orgId },
    });
    if (!category) throw new Error('NOT_FOUND');

    // Check if category has active products
    const productCount = await prisma.product.count({
      where: {
        categoryId: id,
        isActive: true,
      },
    });

    if (productCount > 0) {
      throw new Error('CATEGORY_HAS_PRODUCTS');
    }

    // Soft delete
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
