import { Request, Response } from 'express';
import { AuthService }       from '../../services/auth.service';
import { env }               from '../../config/env';
import * as R from '../lib/response';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'pos-auth';
const COOKIE_OPTS = {
  httpOnly:  true,
  secure:    !env.isDev,  // HTTPS only in production
  sameSite:  'strict' as const,
  maxAge:    12 * 60 * 60 * 1000, // 12 hours
  path:      '/',
};

function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export class AuthController {

  static async login(req: Request, res: Response) {
    try {
      const { email, password, branchId, terminalId } = req.body;
      const result = await AuthService.loginWithPassword(email, password, branchId, terminalId);
      setAuthCookie(res, result.token);
      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'INVALID_CREDENTIALS') return R.unauthorised(res, 'Invalid username or password');
      if (err.message === 'INVALID_TERMINAL')    return R.forbidden(res, 'You are not authorised to use this branch. Please select your assigned branch.');
      if (err.message === 'NO_ROLE_ASSIGNED')    return R.forbidden(res, 'No role assigned to this user. Contact your administrator.');
      if (err.message === 'ONLY_CASHIER_ALLOWED') return R.forbidden(res, 'Only cashiers are allowed to log in to the POS cashier screen.');
      if (err.message === 'CASHIER_NOT_ALLOWED_ON_ADMIN') return R.forbidden(res, 'Cashiers are not allowed to log in to the Admin back office.');
      R.serverError(res, err.message);
    }
  }

  static async pinLogin(req: Request, res: Response) {
    try {
      const { branchId, terminalId, pin } = req.body;
      const result = await AuthService.loginWithPin(pin, branchId, terminalId);
      setAuthCookie(res, result.token);
      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'INVALID_PIN')      return R.unauthorised(res, 'Invalid PIN');
      if (err.message === 'INVALID_TERMINAL') return R.badRequest(res, 'Terminal not found');
      if (err.message === 'ONLY_CASHIER_ALLOWED') return R.forbidden(res, 'Only cashiers are allowed to log in to the POS cashier screen.');
      R.serverError(res, err.message);
    }
  }

  static logout(req: Request, res: Response) {
    clearAuthCookie(res);
    R.ok(res, { message: 'Logged out' });
  }

  static async managerApproval(req: Request, res: Response) {
    try {
      const { branchId, action, reason, email, password, pin } = req.body;
      if (!action) return R.badRequest(res, 'action required');
      if (!email && !pin) return R.badRequest(res, 'manager email/password or PIN required');

      const result = await AuthService.createManagerApproval({ branchId, action, reason, email, password, pin });
      R.ok(res, result);
    } catch (err: any) {
      if (err.message === 'INVALID_MANAGER_APPROVAL') return R.unauthorised(res, 'Invalid manager approval credentials');
      if (err.message === 'MISSING_MANAGER_PERMISSION') return R.forbidden(res, 'Manager does not have approval permission');
      R.serverError(res, err.message);
    }
  }

  static me(req: Request, res: Response) {
    const auth = req.auth!;
    R.ok(res, {
      id:           auth.userId,
      name:         auth.name,
      role:         auth.role,
      branchId:     auth.branchId,
      branchName:   (auth as any).branchName ?? null,
      branchIds:    (auth as any).branchIds  ?? [],
      orgId:        auth.orgId,
      terminalId:   auth.terminalId   ?? null,
      terminalName: auth.terminalName ?? null,
      permissions:  auth.permissions  ?? [],
    });
  }

  static async getBranches(_req: Request, res: Response) {
    try {
      const branches = await prisma.branch.findMany({
        where:   { isActive: true },
        select:  { id: true, name: true, label: true, addrCity: true },
        orderBy: { name: 'asc' },
      });
      R.ok(res, branches);
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async getTerminals(req: Request, res: Response) {
    try {
      const { branchId } = req.query;
      const whereClause: any = { isActive: true };
      const sessionWhere: any = { status: 'open', isActive: true };
      if (branchId) {
        const bId = Number(String(branchId));
        whereClause.branchId = bId;
        sessionWhere.branchId = bId;
      }

      const [terminals, openSessions] = await Promise.all([
        prisma.terminal.findMany({
          where:   whereClause,
          select:  { id: true, name: true, code: true, type: true, description: true, sortOrder: true, branchId: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        }),
        prisma.tillSession.findMany({
          where:  sessionWhere,
          select: { terminalId: true, openedByName: true },
        }),
      ]);

      const occupiedMap = new Map(openSessions.map((s) => [s.terminalId.toString(), s.openedByName]));

      R.ok(res, terminals.map((t) => ({
        id:             t.id.toString(),
        name:           t.name,
        code:           t.code,
        type:           t.type,
        description:    t.description,
        sortOrder:      t.sortOrder,
        branchId:       t.branchId ? t.branchId.toString() : null,
        hasOpenSession: occupiedMap.has(t.id.toString()),
        openedBy:       occupiedMap.get(t.id.toString()) ?? null,
      })));
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }

  static async hashPassword(req: Request, res: Response) {
    const { password } = req.body;
    if (!password) return R.badRequest(res, 'password required');
    const hash = await AuthService.hashPassword(password);
    R.ok(res, { hash });
  }

  /**
   * Verify the current session user's PIN — used by the lock screen to unlock
   * without creating a new JWT. Returns { valid: true/false }.
   * Rate-limited on the route; 5 wrong PINs in quick succession is not possible.
   */
  static async verifyPin(req: Request, res: Response) {
    try {
      const { pin } = req.body;
      if (!pin || !/^\d{4}$/.test(pin)) return R.badRequest(res, 'pin must be 4 digits');

      const user = await prisma.user.findUnique({
        where:  { id: Number(req.auth!.userId) },
        select: { pinHash: true },
      });

      if (!user?.pinHash) {
        return R.ok(res, { valid: false, reason: 'NO_PIN_SET' });
      }

      const valid = await bcrypt.compare(pin, user.pinHash);
      R.ok(res, { valid });
    } catch (err: any) {
      R.serverError(res, err.message);
    }
  }
}
