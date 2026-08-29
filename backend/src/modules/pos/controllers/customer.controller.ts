import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

export class CustomerController {

  static async list(req: Request, res: Response) {
    try {
      const page  = parseInt(req.query.page  as string ?? '1',  10);
      const limit = parseInt(req.query.limit as string ?? '20', 10);
      const phone = req.query.phone as string | undefined;
      const name  = req.query.name  as string | undefined;

      const where: Record<string, unknown> = { orgId: Number(req.auth!.orgId), isActive: true };
      if (phone) where.phone = { contains: phone };
      if (name)  where.name  = { contains: name };

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
        prisma.customer.count({ where }),
      ]);

      R.ok(res, customers, { total, page, pages: Math.ceil(total / limit) });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async getById(req: Request, res: Response) {
    const customer = await prisma.customer.findUnique({ where: { id: Number(req.params.id) } });
    if (!customer) return R.notFound(res, 'Customer');
    R.ok(res, customer);
  }

  static async getByPhone(req: Request, res: Response) {
    const customer = await prisma.customer.findFirst({
      where: { phone: req.params.phone, orgId: Number(req.auth!.orgId), isActive: true },
    });
    if (!customer) return R.notFound(res, 'Customer');
    R.ok(res, customer);
  }

  static async create(req: Request, res: Response) {
    try {
      const customer = await prisma.customer.create({
        data: { ...req.body, orgId: Number(req.auth!.orgId), createdBy: req.auth!.userId },
      });
      R.created(res, customer);
    } catch (err: any) {
      if (err.code === 'P2002') return R.conflict(res, 'Phone number already registered');
      R.badRequest(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const customer = await prisma.customer.update({
        where: { id: Number(req.params.id) },
        data:  { ...req.body, updatedAt: new Date() },
      });
      R.ok(res, customer);
    } catch {
      R.notFound(res, 'Customer');
    }
  }

  static async loyaltyHistory(req: Request, res: Response) {
    try {
      const customerId = Number(req.params.id);
      const [customer, transactions] = await Promise.all([
        prisma.customer.findUnique({ where: { id: customerId } }),
        prisma.loyaltyTransaction.findMany({
          where:   { customerId, isActive: true },
          orderBy: { createdAt: 'desc' },
          take:    50,
        }),
      ]);
      if (!customer) return R.notFound(res, 'Customer');
      R.ok(res, { customer, transactions });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }
}
