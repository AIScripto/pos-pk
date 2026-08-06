import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StateService {
  /**
   * List all active states for an organization
   */
  static async list(orgId: bigint) {
    const states = await prisma.state.findMany({
      where: { orgId, isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        tag: true,
        name: true,
        code: true,
        zipCode: true,
        country: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });
    return states;
  }

  /**
   * Get a single state by ID
   */
  static async getById(orgId: bigint, stateId: bigint) {
    const state = await prisma.state.findUnique({
      where: { id: stateId },
      select: {
        id: true,
        orgId: true,
        tag: true,
        name: true,
        code: true,
        zipCode: true,
        country: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!state || state.orgId !== orgId) {
      return null;
    }

    return state;
  }

  /**
   * Get state by tag
   */
  static async getByTag(orgId: bigint, tag: string) {
    const state = await prisma.state.findUnique({
      where: { orgId_tag: { orgId, tag } },
      select: {
        id: true,
        tag: true,
        name: true,
        code: true,
        zipCode: true,
        country: true,
        region: true,
        isActive: true,
      },
    });

    return state;
  }

  /**
   * Create a new state
   */
  static async create(orgId: bigint, data: any) {
    // Check if tag already exists for this org
    const existing = await prisma.state.findUnique({
      where: { orgId_tag: { orgId, tag: data.tag.toUpperCase() } },
    });

    if (existing) {
      throw new Error('DUPLICATE_TAG');
    }

    const state = await prisma.state.create({
      data: {
        orgId,
        tag: data.tag.toUpperCase(),
        name: data.name,
        code: data.code,
        zipCode: data.zipCode,
        country: data.country || 'PK',
        region: data.region,
        isActive: data.isActive !== false,
        createdBy: 'admin',
      },
      select: {
        id: true,
        tag: true,
        name: true,
        code: true,
        zipCode: true,
        country: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });

    return state;
  }

  /**
   * Update an existing state
   */
  static async update(orgId: bigint, stateId: bigint, data: any) {
    const state = await prisma.state.findUnique({
      where: { id: stateId },
    });

    if (!state || state.orgId !== orgId) {
      throw new Error('STATE_NOT_FOUND');
    }

    // Check if new tag already exists (if tag is being changed)
    if (data.tag && data.tag.toUpperCase() !== state.tag) {
      const existing = await prisma.state.findUnique({
        where: { orgId_tag: { orgId, tag: data.tag.toUpperCase() } },
      });

      if (existing) {
        throw new Error('DUPLICATE_TAG');
      }
    }

    const updated = await prisma.state.update({
      where: { id: stateId },
      data: {
        ...(data.tag && { tag: data.tag.toUpperCase() }),
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.zipCode && { zipCode: data.zipCode }),
        ...(data.country && { country: data.country }),
        ...(data.region && { region: data.region }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        tag: true,
        name: true,
        code: true,
        zipCode: true,
        country: true,
        region: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updated;
  }

  /**
   * Soft delete a state
   */
  static async delete(orgId: bigint, stateId: bigint) {
    const state = await prisma.state.findUnique({
      where: { id: stateId },
    });

    if (!state || state.orgId !== orgId) {
      throw new Error('STATE_NOT_FOUND');
    }

    // Check if state has active cities
    const activeCities = await prisma.city.findFirst({
      where: { stateId, isActive: true },
    });

    if (activeCities) {
      throw new Error('HAS_ACTIVE_CITIES');
    }

    const updated = await prisma.state.update({
      where: { id: stateId },
      data: { isActive: false },
    });

    return updated;
  }
}
