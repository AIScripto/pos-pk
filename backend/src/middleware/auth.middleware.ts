// =============================================================================
// Auth Middleware — JWT verification + role guard + permission guard
// =============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env }                   from '../config/env';
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

// Role hierarchy — higher = more access
const ROLE_RANK: Record<string, number> = {
  super_admin:    100,
  org_admin:       80,
  admin:           80,
  city_manager:    60,
  branch_manager:  40,
  manager:         40,
  cashier:         20,
  kitchen:         10,
};

// ── Middleware: verify JWT ─────────────────────────────────────────────────────

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return unauthorised(res, 'No token provided');

  try {
    const decoded = jwt.verify(header.slice(7), env.JWT_SECRET, { algorithms: ['HS256'] }) as AuthToken;
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
