// =============================================================================
// Auth Middleware — JWT verification + role guard + permission guard
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import { ROLE_RANK } from '../constants/roles';
import jwt from 'jsonwebtoken';
import { env }                   from '../../config/env';
import { unauthorised, forbidden } from '../lib/response';

export interface AuthToken {
  userId:      string;
  name:        string;
  email:       string;
  role:        string;
  scopeType:   string;
  scopeId:     string;
  branchId:    string;
  branchIds:   string[];
  cityId:      string;
  orgId:       string;
  terminalId:   string | null;
  terminalName: string | null;
  permissions: string[];
  iat:         number;
  exp:         number;
}

declare global {
  namespace Express {
    interface Request { auth?: AuthToken; }
  }
}


// ── Middleware: verify JWT ─────────────────────────────────────────────────────

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Cookie takes priority; Authorization header kept for backward compatibility
  const cookieToken  = req.cookies?.['pos-auth'] as string | undefined;
  const headerToken  = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;

  const token = cookieToken ?? headerToken;
  if (!token) return unauthorised(res, 'No token provided');

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthToken;
    req.auth      = decoded;
    next();
  } catch {
    return unauthorised(res, 'Invalid or expired token');
  }
}

// ── Middleware: require minimum role ──────────────────────────────────────────

export function requireRole(minRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return unauthorised(res);
    const rank    = ROLE_RANK[req.auth.role] ?? 0;
    const minRank = ROLE_RANK[minRole]       ?? 0;
    if (rank < minRank) return forbidden(res, `Requires role: ${minRole} or above`);
    next();
  };
}

// ── Middleware: require specific permission ────────────────────────────────────

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return unauthorised(res);
    if (!req.auth.permissions?.includes(permission)) {
      return forbidden(res, `Missing permission: ${permission}`);
    }
    next();
  };
}

// ── Factories ─────────────────────────────────────────────────────────────────

/** authenticate + minimum role check in one step */
export const auth = (minRole = 'cashier') => [authenticate, requireRole(minRole)];

/** authenticate + specific permission check in one step */
export const can = (permission: string) => [authenticate, requirePermission(permission)];
