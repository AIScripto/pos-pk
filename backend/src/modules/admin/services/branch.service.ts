// =============================================================================
// Branch Service — Business logic for branch management
// =============================================================================

import prisma from '../../../shared/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface CreateBranchInput {
  brandId: number;
  cityId: number;
  areaId?: number;
  label: string;
  name: string;
  phone?: string;
  email?: string;
  managerId?: string;
  openTime?: string;
  closeTime?: string;
  addrLine1?: string;
  addrLine2?: string;
  addrArea?: string;
  addrCity?: string;
  addrState?: string;
  addrCountry?: string;
  addrPostCode?: string;
  addrLat?: number;
  addrLng?: number;
}

interface UpdateBranchInput {
  label?: string;
  name?: string;
  areaId?: number | null;
  phone?: string;
  email?: string;
  managerId?: string;
  openTime?: string;
  closeTime?: string;
  addrLine1?: string;
  addrLine2?: string;
  addrArea?: string;
  addrCity?: string;
  addrState?: string;
  addrCountry?: string;
  addrPostCode?: string;
  addrLat?: number;
  addrLng?: number;
  isActive?: boolean;
}

export class BranchService {
  static async create(orgId: number, data: CreateBranchInput) {
    // Verify brand exists
    const brand = await prisma.brand.findFirst({
      where: { id: data.brandId, orgId },
    });

    if (!brand) {
      throw new Error('BRAND_NOT_FOUND');
    }

    // Verify city exists
    const city = await prisma.city.findFirst({
      where: { id: data.cityId, orgId },
    });

    if (!city) {
      throw new Error('CITY_NOT_FOUND');
    }

    // Verify area exists if provided (and belongs to the city)
    if (data.areaId) {
      const area = await prisma.area.findFirst({
        where: { id: data.areaId, cityId: data.cityId, orgId },
      });

      if (!area) {
        throw new Error('AREA_NOT_FOUND_FOR_CITY');
      }
    }

    // Check label uniqueness per organization
    const existingLabel = await prisma.branch.findFirst({
      where: { orgId, label: data.label },
    });

    if (existingLabel) {
      throw new Error('DUPLICATE_LABEL');
    }

    // Create the branch
    const branch = await prisma.branch.create({
      data: {
        orgId,
        brandId: data.brandId,
        cityId: data.cityId,
        areaId: data.areaId,
        label: data.label,
        name: data.name,
        phone: data.phone,
        email: data.email,
        managerId: data.managerId,
        openTime: data.openTime || '09:00',
        closeTime: data.closeTime || '23:00',
        addrLine1: data.addrLine1 || '',
        addrLine2: data.addrLine2,
        addrArea: data.addrArea || '',
        addrCity: data.addrCity || '',
        addrState: data.addrState || '',
        addrCountry: data.addrCountry || 'PK',
        addrPostCode: data.addrPostCode || '',
        addrLat: data.addrLat,
        addrLng: data.addrLng,
      },
      include: {
        brand: true,
        city: true,
        area: true,
      },
    });

    // Auto-create default terminal for the new branch
    try {
      await prisma.terminal.create({
        data: {
          branchId: branch.id,
          name: 'Counter 01',
          code: 'TILL-01',
          type: 'counter',
          description: 'Main Register Counter',
          isActive: true,
          createdBy: 'system',
        },
      });
    } catch (_err) {
      /* ignore if already exists */
    }

    return branch;
  }

  static async update(orgId: number, branchId: number, data: UpdateBranchInput) {
    // Verify branch exists
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, orgId },
    });

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // If area is being updated, verify it exists and belongs to the city
    if (data.areaId !== undefined && data.areaId !== null) {
      const area = await prisma.area.findFirst({
        where: { id: data.areaId, cityId: branch.cityId, orgId },
      });

      if (!area) {
        throw new Error('AREA_NOT_FOUND_FOR_CITY');
      }
    }

    // Check label uniqueness if changing label
    if (data.label && data.label !== branch.label) {
      const existingLabel = await prisma.branch.findFirst({
        where: { orgId, label: data.label, id: { not: branchId } },
      });

      if (existingLabel) {
        throw new Error('DUPLICATE_LABEL');
      }
    }

    // Update the branch
    const updated = await prisma.branch.update({
      where: { id: branchId },
      data: {
        ...(data.label && { label: data.label }),
        ...(data.name && { name: data.name }),
        ...(data.areaId !== undefined && { areaId: data.areaId }),
        ...(data.phone && { phone: data.phone }),
        ...(data.email && { email: data.email }),
        ...(data.managerId && { managerId: data.managerId }),
        ...(data.openTime && { openTime: data.openTime }),
        ...(data.closeTime && { closeTime: data.closeTime }),
        ...(data.addrLine1 && { addrLine1: data.addrLine1 }),
        ...(data.addrLine2 && { addrLine2: data.addrLine2 }),
        ...(data.addrArea && { addrArea: data.addrArea }),
        ...(data.addrCity && { addrCity: data.addrCity }),
        ...(data.addrState && { addrState: data.addrState }),
        ...(data.addrCountry && { addrCountry: data.addrCountry }),
        ...(data.addrPostCode && { addrPostCode: data.addrPostCode }),
        ...(data.addrLat !== undefined && { addrLat: data.addrLat }),
        ...(data.addrLng !== undefined && { addrLng: data.addrLng }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        brand: true,
        city: true,
        area: true,
      },
    });

    return updated;
  }

  static async delete(orgId: number, branchId: number) {
    // Verify branch exists
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, orgId },
    });

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    // Check if branch has active terminals
    const activeTerminals = await prisma.terminal.findFirst({
      where: { branchId, isActive: true },
    });

    if (activeTerminals) {
      throw new Error('HAS_ACTIVE_TERMINALS');
    }

    // Soft delete the branch
    const updated = await prisma.branch.update({
      where: { id: branchId },
      data: { isActive: false },
    });

    return updated;
  }

  static async getById(orgId: number, branchId: number) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, orgId },
      include: {
        brand: true,
        city: true,
        area: true,
      },
    });

    if (!branch) {
      throw new Error('BRANCH_NOT_FOUND');
    }

    return branch;
  }

  static async listByCity(orgId: number, cityId: number) {
    const branches = await prisma.branch.findMany({
      where: { orgId, cityId, isActive: true },
      include: {
        brand: true,
        city: true,
        area: true,
      },
      orderBy: { label: 'asc' },
    });

    return branches;
  }

  static async list(orgId: number, cityId?: number, search?: string) {
    const branches = await prisma.branch.findMany({
      where: {
        orgId,
        isActive: true,
        ...(cityId && { cityId }),
        ...(search && {
          OR: [{ label: { contains: search } }, { name: { contains: search } }],
        }),
      },
      include: {
        brand: true,
        city: true,
        area: true,
      },
      orderBy: { label: 'asc' },
    });

    return branches;
  }
}
