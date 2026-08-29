// =============================================================================
// Auth Service — login, PIN login, token generation, permission resolution
// =============================================================================

import bcrypt from 'bcryptjs';
import { ROLE_RANK } from '../shared/constants/roles';
import jwt    from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { env } from '../config/env';

type UserRole = 'super_admin'|'org_admin'|'city_manager'|'branch_manager'|'cashier'|'kitchen';
type RoleScopeType = 'platform' | 'organisation' | 'city' | 'branch' | string;
type ManagerApprovalAction = 'discount.override';

// ── Default permissions per role (mirrors packages/shared/src/types/permissions.ts) ──

const KITCHEN:        string[] = ['invoice.view','product.view','table.view'];
const CASHIER:        string[] = [...KITCHEN,'till.open','till.close','till.view','invoice.create','invoice.list','customer.view','customer.create','discount.apply','table.assign'];
const BRANCH_MANAGER: string[] = [...CASHIER,'invoice.void','product.create','product.edit','inventory.view','inventory.adjust','customer.edit','discount.override','report.view','table.manage','user.view'];
const CITY_MANAGER:   string[] = [...BRANCH_MANAGER,'product.delete','report.export','user.create'];
const ORG_ADMIN:      string[] = [...CITY_MANAGER,'user.edit','config.view','config.edit'];
const SUPER_ADMIN:    string[] = [...ORG_ADMIN,'till.open','till.close','till.view','invoice.create','invoice.void','invoice.view','invoice.list','product.view','product.create','product.edit','product.delete','inventory.view','inventory.adjust','customer.view','customer.create','customer.edit','discount.apply','discount.override','report.view','report.export','config.view','config.edit','user.view','user.create','user.edit','table.view','table.assign','table.manage'];

const DEFAULT_PERMISSIONS: Record<UserRole, string[]> = {
  kitchen:        KITCHEN,
  cashier:        CASHIER,
  branch_manager: BRANCH_MANAGER,
  city_manager:   CITY_MANAGER,
  org_admin:      ORG_ADMIN,
  super_admin:    SUPER_ADMIN,
};


export class AuthService {

  static async loginWithPassword(emailOrUsername: string, password: string, branchId?: string, terminalId?: string) {
    const normalizedInput = emailOrUsername.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedInput } },
          { username: { equals: normalizedInput } },
        ],
        isActive: true,
      },
      include: {
        roles: {
          where: { isActive: true },
          include: { role: true },
        },
      },
    });
    if (!user || !user.passwordHash) throw new Error('INVALID_CREDENTIALS');
    if (!await bcrypt.compare(password, user.passwordHash)) throw new Error('INVALID_CREDENTIALS');
    const primaryRole = user.roles[0];
    if (!primaryRole) throw new Error('NO_ROLE_ASSIGNED');

    const tokenRole = this.toTokenRole(primaryRole);

    // If user is a cashier/pos_operator or terminal/branch context is supplied
    if (tokenRole.role === 'cashier' || tokenRole.roleTag === 'pos_operator' || terminalId || branchId) {
      const branchAssignment = user.roles.find((r) => r.isActive && r.scopeType === 'branch');
      const resolvedBranchId = branchId?.trim() || branchAssignment?.scopeId || (primaryRole.scopeType === 'branch' ? primaryRole.scopeId : null);
      
      let resolvedTerminalId = terminalId?.trim();
      if (!resolvedTerminalId && resolvedBranchId) {
        const defaultTerminal = await prisma.terminal.findFirst({
          where: { branchId: Number(resolvedBranchId), isActive: true },
          orderBy: { id: 'asc' },
        });
        if (defaultTerminal) resolvedTerminalId = defaultTerminal.id.toString();
      }

      if (resolvedBranchId) {
        return this.buildToken(user, {
          ...tokenRole,
          scopeType: 'branch',
          scopeId: resolvedBranchId,
        }, resolvedTerminalId ?? null);
      }
    }

    // Collect all branch IDs this user is assigned to (multi-branch admin support)
    const allBranchIds = user.roles
      .filter((r) => r.scopeType === 'branch' && r.isActive)
      .map((r) => r.scopeId);
    return this.buildToken(user, tokenRole, null, allBranchIds);
  }

  static async loginWithPin(pin: string, branchId?: string, terminalId?: string) {
    const roles = await prisma.userRoleAssignment.findMany({
      where:   { isActive: true },
      include: { user: true, role: true },
    });

    let matchedRole: typeof roles[0] | null = null;
    for (const r of roles) {
      if (!r.user.pinHash || !r.user.isActive) continue;
      if (branchId?.trim() && r.scopeType === 'branch' && r.scopeId !== branchId.trim()) continue;
      
      if (await bcrypt.compare(pin, r.user.pinHash)) {
        matchedRole = r;
        break;
      }
    }

    if (!matchedRole) throw new Error('INVALID_PIN');

    const tokenRole = this.toTokenRole(matchedRole);
    const resolvedBranchId = matchedRole.scopeType === 'branch' ? matchedRole.scopeId : (branchId?.trim() || '');

    let resolvedTerminalId = terminalId?.trim();
    if (!resolvedTerminalId && resolvedBranchId) {
      const defaultTerminal = await prisma.terminal.findFirst({
        where: { branchId: Number(resolvedBranchId), isActive: true },
        orderBy: { id: 'asc' },
      });
      if (defaultTerminal) resolvedTerminalId = defaultTerminal.id.toString();
    }

    return this.buildToken(matchedRole.user, {
      ...tokenRole,
      scopeType: 'branch',
      scopeId: resolvedBranchId,
    }, resolvedTerminalId ?? null);
  }

  static async createManagerApproval(input: {
    branchId?: string;
    action: ManagerApprovalAction;
    reason?: string;
    email?: string;
    password?: string;
    pin?: string;
  }) {
    const manager = input.email && input.password
      ? await this.findManagerByPassword(input.email, input.password, input.branchId)
      : input.pin && input.branchId
        ? await this.findManagerByPin(input.branchId, input.pin)
        : null;

    if (!manager) throw new Error('INVALID_MANAGER_APPROVAL');

    const permissions = await this.resolvePermissions(
      manager.role.role,
      manager.orgId,
      manager.role.roleId,
      manager.role.roleTag,
    );
    if (!permissions.includes(input.action)) throw new Error('MISSING_MANAGER_PERMISSION');

    const token = jwt.sign({
      type: 'manager_approval',
      action: input.action,
      approvedBy: manager.userId,
      approvedByName: manager.name,
      branchId: input.branchId ?? manager.branchId ?? '',
      reason: input.reason?.trim() ?? '',
      orgId: manager.orgId,
    }, env.JWT_SECRET as jwt.Secret, { expiresIn: '5m' } as jwt.SignOptions);

    return {
      token,
      approvedBy: { id: manager.userId, name: manager.name },
      expiresInSeconds: 300,
    };
  }

  static verifyManagerApproval(token: string | undefined, action: ManagerApprovalAction, branchId: string) {
    if (!token) throw new Error('MANAGER_APPROVAL_REQUIRED');
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        type?: string;
        action?: string;
        approvedBy?: string;
        approvedByName?: string;
        branchId?: string;
        reason?: string;
        orgId?: string;
      };
      if (decoded.type !== 'manager_approval' || decoded.action !== action) {
        throw new Error('INVALID_MANAGER_APPROVAL');
      }
      if (decoded.branchId && decoded.branchId !== branchId) {
        throw new Error('INVALID_MANAGER_APPROVAL_BRANCH');
      }
      return decoded;
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('INVALID_MANAGER_APPROVAL')) throw err;
      throw new Error('INVALID_MANAGER_APPROVAL');
    }
  }

  private static async findManagerByPassword(email: string, password: string, branchId?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail }, isActive: true },
      include: { roles: { where: { isActive: true }, include: { role: true } } },
    });
    if (!user || !user.passwordHash) return null;
    if (!await bcrypt.compare(password, user.passwordHash)) return null;
    return this.pickManagerRole(user, branchId);
  }

  private static async findManagerByPin(branchId: string, pin: string) {
    const assignments = await prisma.userRoleAssignment.findMany({
      where: { scopeType: 'branch', scopeId: branchId, isActive: true },
      include: { user: true, role: true },
    });
    for (const assignment of assignments) {
      if (!assignment.user.pinHash) continue;
      if (!await bcrypt.compare(pin, assignment.user.pinHash)) continue;
      const manager = await this.pickManagerRole({
        ...assignment.user,
        roles: [assignment],
      }, branchId);
      if (manager) return manager;
    }
    return null;
  }

  private static async pickManagerRole(
    user: {
      id: number | string;
      name: string;
      orgId: number | string;
      roles: Array<{
        roleId?: number;
        scopeType: string;
        scopeId: string;
        isActive: boolean;
        role: { tag: string };
      }>;
    },
    branchId?: string,
  ) {
    for (const assignment of user.roles) {
      const tokenRole = this.toTokenRole(assignment);
      const rank = ROLE_RANK[tokenRole.role] ?? 0;
      if (rank < ROLE_RANK.branch_manager) continue;
      const allowed =
        !branchId ||
        assignment.scopeType === 'platform' ||
        assignment.scopeType === 'organisation' ||
        (assignment.scopeType === 'branch' && assignment.scopeId === branchId);
      if (!allowed) continue;
      return {
        userId: user.id.toString(),
        name: user.name,
        orgId: user.orgId.toString(),
        branchId: assignment.scopeType === 'branch' ? assignment.scopeId : branchId,
        role: tokenRole,
      };
    }
    return null;
  }

  private static toTokenRole(assignment: {
    roleId?: number;
    scopeType: string;
    scopeId: string;
    role: { tag: string };
  }) {
    const normalizedRole = this.normalizeRoleTag(assignment.role.tag, assignment.scopeType);
    return {
      role: normalizedRole,
      roleId: assignment.roleId,
      roleTag: assignment.role.tag,
      scopeType: assignment.scopeType,
      scopeId: assignment.scopeId,
    };
  }

  private static normalizeRoleTag(tag: string, scopeType: RoleScopeType): UserRole {
    if (tag === 'admin') {
      return scopeType === 'platform' ? 'super_admin' : 'org_admin';
    }
    if (tag === 'manager') {
      if (scopeType === 'city') return 'city_manager';
      return 'branch_manager';
    }
    if (tag === 'org_admin' || tag === 'city_manager' || tag === 'branch_manager' || tag === 'cashier' || tag === 'kitchen' || tag === 'super_admin') {
      return tag;
    }
    // Safe fallback for unknown custom roles
    return 'cashier';
  }

  private static parseBigInt(value: string, field: string): number {
    try {
      return Number(value);
    } catch {
      throw new Error(`INVALID_${field.toUpperCase()}`);
    }
  }

  // ── Resolve permissions: defaults + org overrides ─────────────────────────

  static async resolvePermissions(roleTag: string, orgId: string, roleId?: number, rawRoleTag?: string): Promise<string[]> {
    const defaults = new Set<string>(DEFAULT_PERMISSIONS[roleTag as UserRole] ?? []);

    const whereByRole =
      roleId !== undefined
        ? { orgId: Number(orgId), roleId, isActive: true }
        : { orgId: Number(orgId), role: { tag: rawRoleTag ?? roleTag }, isActive: true };
    const overrides = await prisma.orgRolePermission.findMany({ where: whereByRole });
    for (const o of overrides) {
      if (o.granted) defaults.add(o.permission);
      else           defaults.delete(o.permission);
    }
    return Array.from(defaults);
  }

  // ── Build JWT with permissions baked in ───────────────────────────────────

  private static async buildToken(
    user: { id: number | string; name: string; email?: string | null; orgId: number | string },
    role: { role: string; roleId?: number; roleTag?: string; scopeType: string; scopeId: string },
    terminalId: string | null = null,
    allBranchIds: string[] = [],
  ) {
    // Ids are numbers now; the token carries them as strings either way.
    const userId = String(user.id);
    const orgId = String(user.orgId);

    let branchId = '', branchName: string | null = null, cityId = '';
    if (role.scopeType === 'branch') {
      const branch = await prisma.branch.findUnique({ where: { id: this.parseBigInt(role.scopeId, 'scopeId') } });
      branchId   = branch?.id.toString() ?? '';
      branchName = branch?.name ?? null;
      cityId     = branch?.cityId.toString() ?? '';
    } else if (role.scopeType === 'city') {
      cityId = role.scopeId;
    }

    let terminalName: string | null = null;
    if (terminalId) {
      const terminal = await prisma.terminal.findUnique({ where: { id: Number(terminalId) } });
      terminalName = terminal?.name ?? null;
    }

    const permissions = await AuthService.resolvePermissions(role.role, orgId, role.roleId, role.roleTag);

    const email = (user as { email?: string | null }).email ?? '';

    // For branch-scoped login (PIN), the single branchId IS the full list.
    // For email login with multiple branch assignments, allBranchIds is passed in.
    const branchIds = allBranchIds.length > 0
      ? allBranchIds
      : branchId ? [branchId] : [];

    const payload = {
      userId, name: user.name, email, role: role.role,
      scopeType: role.scopeType, scopeId: role.scopeId,
      branchId, branchName, branchIds, cityId, orgId, terminalId, terminalName, permissions,
    };

    const token = jwt.sign(payload, env.JWT_SECRET as jwt.Secret, {
      expiresIn: env.JWT_EXPIRES,
    } as jwt.SignOptions);

    return {
      token,
      user: { id: userId, name: user.name, email, role: role.role, branchId, branchName, branchIds, orgId, terminalId, terminalName, permissions },
    };
  }

  static hashPassword(password: string) { return bcrypt.hash(password, 12); }
  static hashPin(pin: string)           { return bcrypt.hash(pin, 10); }
}
