// =============================================================================
// OrganisationController — get & update the current organisation
// Single-org mode: always resolves via req.auth.orgId
// =============================================================================

import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

function serialize(obj: any): any {
  if (!obj) return obj;
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    // Ids are numbers now; keep them strings on the wire (see id-serializer.ts).
    if (typeof result[key] === 'bigint') result[key] = result[key].toString();
    else if (typeof result[key] === 'number' && /^id$|Id$/.test(key)) result[key] = String(result[key]);
    else if (result[key] instanceof Date) result[key] = result[key].toISOString();
    else if (Array.isArray(result[key])) result[key] = result[key].map(serialize);
    else if (result[key] !== null && typeof result[key] === 'object') {
      result[key] = serialize(result[key]);
    }
  }
  return result;
}

export class OrganisationController {

  // GET /admin/organisation
  static async getOrg(req: Request, res: Response) {
    const org = await prisma.organisation.findUnique({
      where: { id: Number(req.auth!.orgId) },
      select: {
        id:           true,
        name:         true,
        slug:         true,
        logo:         true,
        website:      true,
        email:        true,
        phone:        true,
        isActive:     true,
        addrLine1:    true,
        addrLine2:    true,
        addrCity:     true,
        addrState:    true,
        addrCountry:  true,
        addrPostCode: true,
        createdAt:    true,
        updatedAt:    true,
      },
    });
    if (!org) return R.notFound(res, 'Organisation not found');
    R.ok(res, serialize(org));
  }

  // PATCH /admin/organisation
  static async updateOrg(req: Request, res: Response) {
    try {
      const orgId = Number(req.auth!.orgId);
      const allowedFields = [
        'name', 'logo', 'website', 'email', 'phone', 'isActive',
        'addrLine1', 'addrLine2', 'addrCity', 'addrState', 'addrCountry', 'addrPostCode',
      ];
      const data = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key)),
      );

      const org = await prisma.organisation.update({
        where: { id: orgId },
        data:  { ...data, updatedAt: new Date() },
        select: {
          id:           true,
          name:         true,
          slug:         true,
          logo:         true,
          website:      true,
          email:        true,
          phone:        true,
          isActive:     true,
          addrLine1:    true,
          addrLine2:    true,
          addrCity:     true,
          addrState:    true,
          addrCountry:  true,
          addrPostCode: true,
          createdAt:    true,
          updatedAt:    true,
        },
      });
      R.ok(res, serialize(org));
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }
}
