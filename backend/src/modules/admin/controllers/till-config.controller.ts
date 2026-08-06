import { Request, Response } from 'express';
import prisma from '../../../shared/lib/prisma';
import * as R from '../../../shared/lib/response';
import { toBigInt } from '../../../shared/utils/bigint';
import { ShiftScheduleService } from '../../pos/services/shift-schedule.service';

function serialize(value: any): any {
  return JSON.parse(JSON.stringify(value, (_key, item) =>
    typeof item === 'bigint' ? item.toString() : item,
  ));
}

function requireTime(value: unknown, label: string): string {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
    throw new Error(`${label} must be HH:mm`);
  }
  return value;
}

export class TillConfigController {
  static async listTills(req: Request, res: Response) {
    const branchId = String(req.query.branchId ?? '');
    if (!branchId) return R.badRequest(res, 'branchId required');

    const tills = await prisma.terminal.findMany({
      where: { branchId: toBigInt(branchId) },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    R.ok(res, serialize(tills));
  }

  static async createTill(req: Request, res: Response) {
    try {
      const { branchId, name, code, type, description, sortOrder } = req.body;
      if (!branchId || !name) return R.badRequest(res, 'branchId and name required');

      const till = await prisma.terminal.create({
        data: {
          branchId: toBigInt(branchId),
          name: String(name).trim(),
          code: code ? String(code).trim() : null,
          type: type ? String(type) : 'counter',
          description: description ? String(description) : '',
          sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
          createdBy: req.auth!.userId,
        },
      });
      R.created(res, serialize(till));
    } catch (err: any) {
      R.conflict(res, err.message);
    }
  }

  static async updateTill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, code, type, description, sortOrder, isActive } = req.body;

      const till = await prisma.terminal.update({
        where: { id: toBigInt(id) },
        data: {
          ...(name !== undefined ? { name: String(name).trim() } : {}),
          ...(code !== undefined ? { code: code ? String(code).trim() : null } : {}),
          ...(type !== undefined ? { type: String(type) } : {}),
          ...(description !== undefined ? { description: String(description) } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
      });
      R.ok(res, serialize(till));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async listShifts(req: Request, res: Response) {
    const branchId = String(req.query.branchId ?? '');
    if (!branchId) return R.badRequest(res, 'branchId required');

    const shifts = await prisma.shiftTemplate.findMany({
      where: { branchId: toBigInt(branchId) },
      orderBy: [{ sortOrder: 'asc' }, { startTime: 'asc' }],
    });
    R.ok(res, serialize(shifts));
  }

  static async createShift(req: Request, res: Response) {
    try {
      const { branchId, name, startTime, endTime, sortOrder } = req.body;
      if (!branchId || !name) return R.badRequest(res, 'branchId and name required');

      const shift = await prisma.shiftTemplate.create({
        data: {
          branchId: toBigInt(branchId),
          name: String(name).trim(),
          startTime: requireTime(startTime, 'startTime'),
          endTime: requireTime(endTime, 'endTime'),
          sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
          createdBy: req.auth!.userId,
        },
      });
      R.created(res, serialize(shift));
    } catch (err: any) {
      R.conflict(res, err.message);
    }
  }

  static async updateShift(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, startTime, endTime, sortOrder, isActive } = req.body;

      const shift = await prisma.shiftTemplate.update({
        where: { id: toBigInt(id) },
        data: {
          ...(name !== undefined ? { name: String(name).trim() } : {}),
          ...(startTime !== undefined ? { startTime: requireTime(startTime, 'startTime') } : {}),
          ...(endTime !== undefined ? { endTime: requireTime(endTime, 'endTime') } : {}),
          ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
      });
      R.ok(res, serialize(shift));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async currentShift(req: Request, res: Response) {
    const branchId = String(req.query.branchId ?? '');
    if (!branchId) return R.badRequest(res, 'branchId required');

    const current = await ShiftScheduleService.resolveCurrent(branchId);
    R.ok(res, serialize({
      shift: current.shift,
      businessDate: current.businessDateKey,
      timezone: current.timeZone,
    }));
  }
}
