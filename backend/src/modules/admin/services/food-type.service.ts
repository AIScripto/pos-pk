// =============================================================================
// FoodType Service — business logic for food type CRUD operations
// =============================================================================

import { Prisma } from '@prisma/client';
import prisma from '../../../shared/lib/prisma';
import { assertUnique } from '../../../shared/utils/validation';

interface CreateFoodTypeInput {
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface UpdateFoodTypeInput {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class FoodTypeService {

  static async list(orgId: bigint, search?: string) {
    const where: Prisma.FoodTypeWhereInput = {
      orgId,
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    return prisma.foodType.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async get(orgId: bigint, id: bigint) {
    // Get single food type with org validation
    const foodType = await prisma.foodType.findFirst({
      where: { id, orgId, isActive: true },
    });
    if (!foodType) throw new Error('NOT_FOUND');

    return foodType;
  }

  static async create(orgId: bigint, input: CreateFoodTypeInput) {
    // Validate required fields
    if (!input.name?.trim()) throw new Error('INVALID_NAME');
    if (!input.slug?.trim()) throw new Error('INVALID_SLUG');

    // Validate slug length (exactly 3 characters)
    const normalizedSlug = input.slug.toUpperCase().trim();
    if (!/^[A-Z0-9]{3}$/.test(normalizedSlug)) {
      throw new Error('INVALID_SLUG_FORMAT');
    }

    // Validate name length
    if (input.name.length > 50) throw new Error('NAME_TOO_LONG');

    await assertUnique(
      prisma.foodType.findFirst({ where: { orgId, name: input.name.trim() } }),
      'DUPLICATE_NAME',
    );
    await assertUnique(
      prisma.foodType.findFirst({ where: { orgId, slug: normalizedSlug } }),
      'DUPLICATE_SLUG',
    );

    // Create food type
    return prisma.foodType.create({
      data: {
        orgId,
        name: input.name.trim(),
        slug: normalizedSlug,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        createdBy: 'system',
      },
    });
  }

  static async update(orgId: bigint, id: bigint, input: UpdateFoodTypeInput) {
    // Verify food type exists and belongs to org
    const existing = await prisma.foodType.findFirst({
      where: { id, orgId },
    });
    if (!existing) throw new Error('NOT_FOUND');

    const updateData: Prisma.FoodTypeUpdateInput = {};

    if (input.name !== undefined) {
      if (!input.name?.trim()) throw new Error('INVALID_NAME');
      if (input.name.length > 50) throw new Error('NAME_TOO_LONG');

      if (input.name.trim() !== existing.name) {
        await assertUnique(
          prisma.foodType.findFirst({ where: { orgId, name: input.name.trim(), id: { not: id } } }),
          'DUPLICATE_NAME',
        );
      }
      updateData.name = input.name.trim();
    }

    if (input.slug !== undefined) {
      const normalizedSlug = input.slug.toUpperCase().trim();
      if (!/^[A-Z0-9]{3}$/.test(normalizedSlug)) {
        throw new Error('INVALID_SLUG_FORMAT');
      }

      if (normalizedSlug !== existing.slug) {
        await assertUnique(
          prisma.foodType.findFirst({ where: { orgId, slug: normalizedSlug, id: { not: id } } }),
          'DUPLICATE_SLUG',
        );
      }
      updateData.slug = normalizedSlug;
    }

    if (input.sortOrder !== undefined) {
      if (input.sortOrder < 0) throw new Error('INVALID_SORT_ORDER');
      updateData.sortOrder = input.sortOrder;
    }

    if (input.isActive !== undefined) {
      updateData.isActive = input.isActive;
    }

    // Update food type
    return prisma.foodType.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(orgId: bigint, id: bigint) {
    // Verify food type exists and belongs to org
    const foodType = await prisma.foodType.findFirst({
      where: { id, orgId },
    });
    if (!foodType) throw new Error('NOT_FOUND');

    // Check if food type has categories
    const categoryCount = await prisma.category.count({
      where: {
        foodTypeId: id,
        isActive: true,
      },
    });

    if (categoryCount > 0) {
      throw new Error('FOODTYPE_HAS_CATEGORIES');
    }

    // Soft delete
    return prisma.foodType.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
