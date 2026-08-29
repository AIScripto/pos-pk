import { Request, Response } from 'express';
import { UserService, CreateUserInput, UpdateUserInput } from '../services/user.service';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';

/** Extract the first branch assignment from a user's active roles. */
function extractBranchId(roles: { scopeType: string; scopeId: string }[]): string | null {
  return roles.find((r) => r.scopeType === 'branch')?.scopeId ?? null;
}

function mapUser(user: {
  id: number; orgId: number; username: string; name: string;
  email: string | null; phone: string | null; isActive: boolean;
  createdAt: Date; updatedAt: Date;
  hasPin?: boolean;
  pinHash?: string | null;
  role?: { id: number; name: string; tag: string } | null;
  roles?: { scopeType: string; scopeId: string; role: { id: number; name: string; tag: string } }[];
}) {
  return {
    id:        toStringId(user.id),
    orgId:     toStringId(user.orgId),
    username:  user.username,
    name:      user.name,
    email:     user.email,
    phone:     user.phone,
    role:      user.role?.name ?? null,
    roleTag:   user.role?.tag  ?? null,
    roleId:    user.role ? toStringId(user.role.id) : null,
    branchId:  user.roles ? extractBranchId(user.roles) : null,
    hasPin:    user.hasPin ?? !!user.pinHash,
    isActive:  user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserController {

  static async list(req: Request, res: Response) {
    try {
      const users = await UserService.list(toBigInt(req.auth!.orgId));
      R.ok(res, users.map(mapUser), { total: users.length });
    } catch (err: unknown) {
      R.serverError(res, err instanceof Error ? err.message : 'Failed to list users');
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const user = await UserService.getById(toBigInt(req.auth!.orgId), toBigInt(req.params.id));
      R.ok(res, mapUser(user));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'USER_NOT_FOUND') return R.notFound(res, 'User');
      R.serverError(res, msg);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { username, name, email, phone, roleId, branchId, pin, password } = req.body;
      if (!username?.trim()) return R.badRequest(res, 'username required');
      if (!name?.trim())     return R.badRequest(res, 'name required');
      if (!email?.trim())    return R.badRequest(res, 'email required');
      if (!roleId)           return R.badRequest(res, 'roleId required');

      const input: CreateUserInput = {
        username: username.trim(),
        name:     name.trim(),
        email:    email.trim(),
        phone:    phone?.trim(),
        roleId:   toBigInt(roleId),
        branchId: branchId?.trim() || undefined,
        pin:      pin?.trim()      || undefined,
        password: password?.trim() || undefined,
      };

      const result = await UserService.create(toBigInt(req.auth!.orgId), input);
      R.created(res, {
        id:           toStringId(result.id),
        orgId:        toStringId(result.orgId),
        username:     result.username,
        name:         result.name,
        email:        result.email,
        phone:        result.phone,
        hasPin:       result.hasPin,
        isActive:     result.isActive,
        tempPassword: result.tempPassword,
        createdAt:    result.createdAt,
        updatedAt:    result.updatedAt,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'DUPLICATE_USERNAME')  return R.conflict(res, 'Username already exists');
      if (msg === 'DUPLICATE_EMAIL')     return R.conflict(res, 'Email already exists');
      if (msg === 'ROLE_NOT_FOUND')      return R.notFound(res, 'Role');
      if (msg === 'BRANCH_NOT_FOUND')    return R.notFound(res, 'Branch');
      if (msg === 'BRANCH_REQUIRED')     return R.badRequest(res, 'A branch must be selected for this role');
      if (msg === 'PIN_REQUIRED')        return R.badRequest(res, 'A 4-digit PIN is required for cashier and kitchen roles');
      if (msg === 'INVALID_PIN_FORMAT')  return R.badRequest(res, 'PIN must be exactly 4 digits');
      R.serverError(res, msg);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { name, phone, roleId, branchId, isActive, pin, password } = req.body;

      const input: UpdateUserInput = {
        name:     name?.trim(),
        phone:    phone?.trim(),
        roleId:   roleId ? toBigInt(roleId) : undefined,
        branchId: branchId?.trim() || undefined,
        isActive,
        pin:      pin?.trim()      || undefined,
        password: password?.trim() || undefined,
      };

      const user = await UserService.update(toBigInt(req.auth!.orgId), toBigInt(req.params.id), input);
      R.ok(res, {
        id:        toStringId(user.id),
        orgId:     toStringId(user.orgId),
        name:      user.name,
        email:     user.email,
        phone:     user.phone,
        hasPin:    user.hasPin,
        isActive:  user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'USER_NOT_FOUND')   return R.notFound(res, 'User');
      if (msg === 'ROLE_NOT_FOUND')   return R.notFound(res, 'Role');
      if (msg === 'BRANCH_NOT_FOUND') return R.notFound(res, 'Branch');
      if (msg === 'BRANCH_REQUIRED')     return R.badRequest(res, 'A branch must be selected for this role');
      if (msg === 'DUPLICATE_USERNAME')  return R.conflict(res, 'Username already exists');
      if (msg === 'INVALID_PIN_FORMAT')  return R.badRequest(res, 'PIN must be exactly 4 digits');
      R.serverError(res, msg);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await UserService.delete(toBigInt(req.auth!.orgId), toBigInt(req.params.id));
      R.ok(res, null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'USER_NOT_FOUND') return R.notFound(res, 'User');
      R.serverError(res, msg);
    }
  }

  static async setPin(req: Request, res: Response) {
    try {
      const { pin } = req.body;
      if (!pin?.trim()) return R.badRequest(res, 'pin required');
      await UserService.setPin(toBigInt(req.auth!.orgId), toBigInt(req.params.id), pin.trim());
      R.ok(res, { message: 'PIN updated' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'USER_NOT_FOUND')    return R.notFound(res, 'User');
      if (msg === 'INVALID_PIN_FORMAT') return R.badRequest(res, 'PIN must be exactly 4 digits');
      R.serverError(res, msg);
    }
  }

  static async clearPin(req: Request, res: Response) {
    try {
      await UserService.clearPin(toBigInt(req.auth!.orgId), toBigInt(req.params.id));
      R.ok(res, { message: 'PIN removed' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'USER_NOT_FOUND') return R.notFound(res, 'User');
      R.serverError(res, msg);
    }
  }

  static async suggestUsername(req: Request, res: Response) {
    try {
      const roleTag = (req.query.roleTag as string)?.trim();
      if (!roleTag) return R.badRequest(res, 'roleTag query param required');
      const username = await UserService.suggestUsername(toBigInt(req.auth!.orgId), roleTag);
      R.ok(res, { username });
    } catch (err: unknown) {
      R.serverError(res, err instanceof Error ? err.message : 'Failed to suggest username');
    }
  }
}
