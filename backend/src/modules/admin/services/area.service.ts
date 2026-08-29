// =============================================================================
// Area Service — business logic for area CRUD operations
// =============================================================================

import prisma from '../../../shared/lib/prisma';
import { toDecimal } from '../../../shared/utils/decimal';

interface CreateAreaInput {
  cityId: number;
  tag: string;
  name: string;
  details: string | null;
  latitude: number | null;
  longitude: number | null;
  isActive?: boolean;
}

interface UpdateAreaInput {
  tag?: string;
  name?: string;
  details?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive?: boolean;
}

export class AreaService {

  static async list(orgId: number, cityId: number, search?: string) {
    const city = await prisma.city.findFirst({
      where: { id: cityId, orgId, isActive: true },
    });
    if (!city) throw new Error('CITY_NOT_FOUND');

    return prisma.area.findMany({
      where: {
        cityId,
        orgId,
        ...(search ? {
          OR: [
            { tag:  { contains: search } },
            { name: { contains: search } },
          ],
        } : {}),
      },
      orderBy: { tag: 'asc' },
    });
  }

  static async get(orgId: number, id: number) {
    return prisma.area.findFirst({
      where: { id, orgId },
    });
  }

  static async create(orgId: number, input: CreateAreaInput) {
    const city = await prisma.city.findFirst({
      where: { id: input.cityId, orgId, isActive: true },
    });
    if (!city) throw new Error('CITY_NOT_FOUND');

    const existing = await prisma.area.findFirst({
      where: {
        cityId: input.cityId,
        tag: { equals: input.tag },
      },
    });
    if (existing) throw new Error('DUPLICATE_TAG');

    return prisma.area.create({
      data: {
        orgId,
        cityId:    input.cityId,
        tag:       input.tag,
        name:      input.name,
        details:   input.details,
        latitude:  toDecimal(input.latitude),
        longitude: toDecimal(input.longitude),
        isActive:  input.isActive ?? true,
        createdBy: 'system',
      },
    });
  }

  static async update(orgId: number, id: number, input: UpdateAreaInput) {
    const area = await prisma.area.findFirst({
      where: { id, orgId },
    });
    if (!area) throw new Error('NOT_FOUND');

    if (input.tag && input.tag !== area.tag) {
      const existing = await prisma.area.findFirst({
        where: {
          cityId: area.cityId,
          tag: { equals: input.tag },
          id: { not: id },
        },
      });
      if (existing) throw new Error('DUPLICATE_TAG');
    }

    return prisma.area.update({
      where: { id },
      data: {
        tag:       input.tag,
        name:      input.name,
        details:   input.details !== undefined ? input.details : undefined,
        latitude:  input.latitude  !== undefined ? toDecimal(input.latitude)  : undefined,
        longitude: input.longitude !== undefined ? toDecimal(input.longitude) : undefined,
        isActive:  input.isActive  !== undefined ? input.isActive             : undefined,
      },
    });
  }

  static async delete(orgId: number, id: number) {
    const area = await prisma.area.findFirst({
      where: { id, orgId },
    });
    if (!area) throw new Error('NOT_FOUND');

    const activeBranches = await prisma.branch.findFirst({
      where: { areaId: id, isActive: true },
    });
    if (activeBranches) throw new Error('HAS_ACTIVE_BRANCHES');

    return prisma.area.update({
      where: { id },
      data: { isActive: false },
    });
  }

}
