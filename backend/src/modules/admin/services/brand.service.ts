// =============================================================================
// Brand Service — Business logic for brand management
// =============================================================================

import prisma from '../../../shared/lib/prisma';

export class BrandService {
  static async list(orgId: bigint) {
    const brands = await prisma.brand.findMany({
      where: { orgId, isActive: true },
      orderBy: { tag: 'asc' },
    });

    return brands;
  }

  static async getById(orgId: bigint, brandId: bigint) {
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, orgId },
    });

    if (!brand) {
      throw new Error('BRAND_NOT_FOUND');
    }

    return brand;
  }

  static async getByTag(orgId: bigint, tag: string) {
    const brand = await prisma.brand.findFirst({
      where: { orgId, tag },
    });

    if (!brand) {
      throw new Error('BRAND_NOT_FOUND');
    }

    return brand;
  }

  static async create(orgId: bigint, data: { name: string; tag: string; tagline?: string; primaryColor?: string; logo?: string; createdBy?: string }) {
    const tagUpper = data.tag.trim().toUpperCase();
    const existing = await prisma.brand.findFirst({
      where: { orgId, tag: tagUpper },
    });
    if (existing) {
      throw new Error('BRAND_TAG_EXISTS');
    }

    return prisma.brand.create({
      data: {
        orgId,
        tag: tagUpper,
        name: data.name.trim(),
        tagline: data.tagline?.trim(),
        primaryColor: data.primaryColor || '#F97316',
        logo: data.logo,
        createdBy: data.createdBy || 'admin',
      },
    });
  }

  static async update(orgId: bigint, brandId: bigint, data: { name?: string; tagline?: string; primaryColor?: string; logo?: string; isActive?: boolean }) {
    const brand = await this.getById(orgId, brandId);
    return prisma.brand.update({
      where: { id: brand.id },
      data: {
        name: data.name ? data.name.trim() : brand.name,
        tagline: data.tagline !== undefined ? data.tagline?.trim() : brand.tagline,
        primaryColor: data.primaryColor ?? brand.primaryColor,
        logo: data.logo !== undefined ? data.logo : brand.logo,
        isActive: data.isActive ?? brand.isActive,
      },
    });
  }

  static async delete(orgId: bigint, brandId: bigint) {
    const brand = await this.getById(orgId, brandId);
    return prisma.brand.update({
      where: { id: brand.id },
      data: { isActive: false },
    });
  }
}
