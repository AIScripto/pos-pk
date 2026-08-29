import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';

export class TableController {

  // ── Sections ──────────────────────────────────────────────────────────────

  static async listSections(req: Request, res: Response) {
    const branchId = Number((req.query.branchId as string) ?? req.auth!.branchId);

    const sections = await prisma.tableSection.findMany({
      where:   { branchId, isActive: true },
      include: { tables: { where: { isActive: true }, orderBy: { number: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    R.ok(res, sections);
  }

  static async createSection(req: Request, res: Response) {
    try {
      const section = await prisma.tableSection.create({
        data: { ...req.body, branchId: Number(req.body.branchId ?? req.auth!.branchId), createdBy: req.auth!.userId },
      });
      R.created(res, section);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async updateSection(req: Request, res: Response) {
    try {
      const section = await prisma.tableSection.update({
        where: { id: Number(req.params.id) },
        data:  { ...req.body, updatedAt: new Date() },
      });
      R.ok(res, section);
    } catch {
      R.notFound(res, 'Section');
    }
  }

  static async removeSection(req: Request, res: Response) {
    await prisma.tableSection.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    R.noContent(res);
  }

  // ── Tables ────────────────────────────────────────────────────────────────

  static async list(req: Request, res: Response) {
    const branchId = Number((req.query.branchId as string) ?? req.auth!.branchId);
    const status   = req.query.status as string | undefined;

    const tables = await prisma.table.findMany({
      where:   { branchId, isActive: true, ...(status ? { status } : {}) },
      include: { section: { select: { id: true, name: true } } },
      orderBy: [{ sectionId: 'asc' }, { number: 'asc' }],
    });
    R.ok(res, tables);
  }

  static async create(req: Request, res: Response) {
    try {
      const table = await prisma.table.create({
        data: { ...req.body, createdBy: req.auth!.userId },
      });
      R.created(res, table);
    } catch (err: any) {
      R.badRequest(res, err.message);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const table = await prisma.table.update({
        where: { id: Number(req.params.id) },
        data:  { ...req.body, updatedAt: new Date() },
      });
      R.ok(res, table);
    } catch {
      R.notFound(res, 'Table');
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status, assignedTo, covers } = req.body;
      if (!status) return R.badRequest(res, 'status required');

      const base: Prisma.TableUpdateInput = { status };
      const data: Prisma.TableUpdateInput =
        status === 'occupied'
          ? { ...base, occupiedAt: new Date(), assignedTo: assignedTo ?? req.auth!.userId, ...(covers !== undefined ? { covers } : {}) }
          : status === 'available'
            ? { ...base, occupiedAt: null, assignedTo: null }
            : base;

      const table = await prisma.table.update({ where: { id: Number(req.params.id) }, data });
      R.ok(res, table);
    } catch {
      R.notFound(res, 'Table');
    }
  }

  static async remove(req: Request, res: Response) {
    await prisma.table.update({ where: { id: Number(req.params.id) }, data: { isActive: false } });
    R.noContent(res);
  }
}
