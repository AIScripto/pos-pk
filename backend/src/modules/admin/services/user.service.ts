import prisma from '../../../shared/lib/prisma';
import bcrypt from 'bcryptjs';
import { userSelect } from '../../../shared/lib/selects';
import { toBigInt } from '../../../shared/utils/bigint';

// Role tags that require a branch assignment
const BRANCH_SCOPED_TAGS = new Set(['manager', 'branch_manager', 'cashier', 'pos_operator', 'kitchen', 'kitchen_operator']);

// Role tags that use PIN login (PIN required on create)
const PIN_REQUIRED_TAGS = new Set(['cashier', 'pos_operator', 'kitchen', 'kitchen_operator']);

// Map role tag → short prefix used in auto-generated usernames
const USERNAME_PREFIX: Record<string, string> = {
  admin:          'admin',
  org_admin:      'admin',
  super_admin:    'admin',
  city_manager:   'manager',
  branch_manager: 'manager',
  manager:        'manager',
  cashier:        'cashier',
  pos_operator:   'cashier',
  kitchen:        'kitchen',
  kitchen_operator: 'kitchen',
};

/** Determine the correct scopeType and scopeId for a role assignment. */
function resolveScope(
  roleTag:  string,
  orgId:    bigint,
  branchId?: string,
): { scopeType: string; scopeId: string } {
  const normalizedTag = roleTag.toLowerCase().trim();
  if (BRANCH_SCOPED_TAGS.has(normalizedTag)) {
    if (!branchId?.trim()) throw new Error('BRANCH_REQUIRED');
    return { scopeType: 'branch', scopeId: branchId.trim() };
  }
  if (branchId?.trim()) {
    return { scopeType: 'branch', scopeId: branchId.trim() };
  }
  return { scopeType: 'organisation', scopeId: orgId.toString() };
}

/** Validate PIN: exactly 4 digits. */
function validatePin(pin: string): void {
  if (!/^\d{4}$/.test(pin)) throw new Error('INVALID_PIN_FORMAT');
}

export interface CreateUserInput {
  username:  string;
  name:      string;
  email:     string;
  phone?:    string;
  roleId:    bigint;
  branchId?: string;
  /** 4-digit PIN — required for cashier/kitchen, optional for manager */
  pin?:      string;
  password?: string;
}

export interface UpdateUserInput {
  username?: string;
  name?:     string;
  phone?:    string;
  roleId?:   bigint;
  branchId?: string;
  isActive?: boolean;
  /** Provide to change the PIN; omit to leave unchanged */
  pin?:      string;
  password?: string;
}

export class UserService {

  static async list(orgId: bigint) {
    const users = await prisma.user.findMany({
      where:   { orgId, isActive: true },
      orderBy: { name: 'asc' },
      select:  { ...userSelect, pinHash: true },
    });
    return users.map((u) => ({ ...u, hasPin: u.pinHash !== null, pinHash: undefined }));
  }

  static async getById(orgId: bigint, userId: bigint) {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { ...userSelect, pinHash: true },
    });
    if (!user || user.orgId !== orgId) throw new Error('USER_NOT_FOUND');
    return { ...user, hasPin: user.pinHash !== null, pinHash: undefined };
  }

  static async create(orgId: bigint, input: CreateUserInput) {
    const [existingUsername, existingEmail, role] = await Promise.all([
      prisma.user.findUnique({
        where: { orgId_username: { orgId, username: input.username.toLowerCase().trim() } },
      }),
      input.email ? prisma.user.findUnique({
        where: { orgId_email: { orgId, email: input.email.toLowerCase().trim() } },
      }) : Promise.resolve(null),
      prisma.role.findUnique({ where: { id: input.roleId } }),
    ]);

    if (existingUsername) throw new Error('DUPLICATE_USERNAME');
    if (existingEmail)    throw new Error('DUPLICATE_EMAIL');
    if (!role || role.orgId !== orgId) throw new Error('ROLE_NOT_FOUND');

    // PIN required for cashier/kitchen
    if (PIN_REQUIRED_TAGS.has(role.tag)) {
      if (!input.pin?.trim()) throw new Error('PIN_REQUIRED');
    }
    if (input.pin) validatePin(input.pin);

    // Branch validation
    const { scopeType, scopeId } = resolveScope(role.tag, orgId, input.branchId);
    if (scopeType === 'branch') {
      const branch = await prisma.branch.findFirst({
        where: { id: BigInt(scopeId), orgId, isActive: true },
      });
      if (!branch) throw new Error('BRANCH_NOT_FOUND');
    }

    const passToHash = input.password?.trim() || Math.random().toString(36).substring(2, 10);
    const [passwordHash, pinHash] = await Promise.all([
      bcrypt.hash(passToHash, 12),
      input.pin ? bcrypt.hash(input.pin, 10) : Promise.resolve(null),
    ]);

    const user = await prisma.user.create({
      data: {
        orgId,
        roleId:       input.roleId,
        username:     input.username.toLowerCase().trim(),
        name:         input.name.trim(),
        email:        input.email?.toLowerCase().trim(),
        phone:        input.phone?.trim(),
        passwordHash,
        pinHash:      pinHash ?? undefined,
        createdBy:    'system',
      },
      select: {
        id: true, orgId: true, username: true, name: true,
        email: true, phone: true, isActive: true, createdAt: true, updatedAt: true,
      },
    });

    await prisma.userRoleAssignment.create({
      data: { userId: user.id, roleId: input.roleId, scopeType, scopeId, createdBy: 'system' },
    });

    return { ...user, tempPassword: passToHash, hasPin: !!input.pin };
  }

  static async update(orgId: bigint, userId: bigint, input: UpdateUserInput) {
    const user = await this.getById(orgId, userId);

    if (input.username && input.username.toLowerCase().trim() !== user.username) {
      const clash = await prisma.user.findUnique({
        where: { orgId_username: { orgId, username: input.username.toLowerCase().trim() } },
      });
      if (clash) throw new Error('DUPLICATE_USERNAME');
    }

    if (input.pin) validatePin(input.pin);
    const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : undefined;
    const passwordHash = input.password?.trim() ? await bcrypt.hash(input.password.trim(), 12) : undefined;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        username:  input.username?.toLowerCase().trim() ?? user.username,
        name:      input.name?.trim() ?? user.name,
        phone:     input.phone !== undefined ? input.phone?.trim() : user.phone,
        isActive:  input.isActive ?? user.isActive,
        roleId:    input.roleId ?? user.role?.id,
        ...(pinHash ? { pinHash } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: {
        id: true, orgId: true, username: true, name: true,
        email: true, phone: true, isActive: true, createdAt: true, updatedAt: true,
        pinHash: true,
      },
    });

    if (input.roleId) {
      const role = await prisma.role.findUnique({ where: { id: input.roleId } });
      if (!role || role.orgId !== orgId) throw new Error('ROLE_NOT_FOUND');

      const { scopeType, scopeId } = resolveScope(role.tag, orgId, input.branchId);
      if (scopeType === 'branch') {
        const branch = await prisma.branch.findFirst({
          where: { id: BigInt(scopeId), orgId, isActive: true },
        });
        if (!branch) throw new Error('BRANCH_NOT_FOUND');
      }

      await prisma.userRoleAssignment.deleteMany({
        where: { userId },
      });

      await prisma.userRoleAssignment.create({
        data: { userId, roleId: input.roleId, scopeType, scopeId, createdBy: 'system' },
      });
    }

    return { ...updated, hasPin: !!updated.pinHash, pinHash: undefined };
  }

  /** Reset a user's PIN independently of other profile data. */
  static async setPin(orgId: bigint, userId: bigint, pin: string) {
    const user = await this.getById(orgId, userId);
    validatePin(pin);
    const pinHash = await bcrypt.hash(pin, 10);
    await prisma.user.update({
      where: { id: user.id },
      data:  { pinHash },
    });
  }

  /** Remove a user's PIN (disable PIN login). */
  static async clearPin(orgId: bigint, userId: bigint) {
    await this.getById(orgId, userId);
    await prisma.user.update({
      where: { id: userId },
      data:  { pinHash: null },
    });
  }

  static async delete(orgId: bigint, userId: bigint) {
    const user = await this.getById(orgId, userId);
    await Promise.all([
      prisma.user.update({ where: { id: userId }, data: { isActive: false } }),
      prisma.userRoleAssignment.updateMany({ where: { userId }, data: { isActive: false } }),
    ]);
    return user;
  }

  static async suggestUsername(orgId: bigint, roleTag: string): Promise<string> {
    const prefix = USERNAME_PREFIX[roleTag] ?? roleTag;
    const existing = await prisma.user.findMany({
      where: { orgId, username: { startsWith: prefix, endsWith: '@pos.com' } },
      select: { username: true },
    });
    const usedNumbers = new Set(
      existing
        .map((u) => parseInt(u.username.replace(prefix, '').replace('@pos.com', ''), 10))
        .filter((n) => !isNaN(n)),
    );
    let n = 1;
    while (usedNumbers.has(n)) n++;
    return `${prefix}${n}@pos.com`;
  }
}

