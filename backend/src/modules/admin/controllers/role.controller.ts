import { Request, Response } from 'express';
import { RoleService, CreateRoleInput, UpdateRoleInput } from '../services/role.service';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';

export class RoleController {
  static async list(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const roles = await RoleService.list(orgId);

      const result = roles.map((role) => ({
        id: toStringId(role.id),
        orgId: toStringId(role.orgId),
        name: role.name,
        tag: role.tag,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      }));

      R.ok(res, result, { total: result.length });
    } catch (error) {
      console.error('[RoleController.list]', error);
      R.serverError(res, 'Failed to list roles');
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const roleId = toBigInt(req.params.id);

      const role = await RoleService.getById(orgId, roleId);

      const result = {
        id: toStringId(role.id),
        orgId: toStringId(role.orgId),
        name: role.name,
        tag: role.tag,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };

      R.ok(res, result);
    } catch (error: any) {
      console.error('[RoleController.get]', error);
      if (error.message === 'ROLE_NOT_FOUND') {
        R.notFound(res, 'Role');
      } else {
        R.serverError(res, error.message);
      }
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const { name, tag, description } = req.body;

      // Validation
      if (!name?.trim()) {
        R.badRequest(res, 'Role name is required');
        return;
      }
      if (!tag?.trim()) {
        R.badRequest(res, 'Role tag is required');
        return;
      }

      const input: CreateRoleInput = {
        name: name.trim(),
        tag: tag.trim(),
        description: description?.trim(),
      };

      const role = await RoleService.create(orgId, input);

      const result = {
        id: toStringId(role.id),
        orgId: toStringId(role.orgId),
        name: role.name,
        tag: role.tag,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };

      R.created(res, result);
    } catch (error: any) {
      console.error('[RoleController.create]', error);
      if (error.message === 'DUPLICATE_TAG') {
        R.conflict(res, 'Role tag already exists');
      } else {
        R.serverError(res, error.message);
      }
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const roleId = toBigInt(req.params.id);
      const { name, description, isActive } = req.body;

      const input: UpdateRoleInput = {
        name: name?.trim(),
        description: description?.trim(),
        isActive,
      };

      const role = await RoleService.update(orgId, roleId, input);

      const result = {
        id: toStringId(role.id),
        orgId: toStringId(role.orgId),
        name: role.name,
        tag: role.tag,
        description: role.description,
        isActive: role.isActive,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      };

      R.ok(res, result);
    } catch (error: any) {
      console.error('[RoleController.update]', error);
      if (error.message === 'ROLE_NOT_FOUND') {
        R.notFound(res, 'Role');
      } else if (error.message === 'CANNOT_EDIT_SYSTEM_ROLE') {
        R.forbidden(res, 'Cannot edit system roles');
      } else {
        R.serverError(res, error.message);
      }
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth!.orgId);
      const roleId = toBigInt(req.params.id);

      await RoleService.delete(orgId, roleId);

      R.ok(res, null);
    } catch (error: any) {
      console.error('[RoleController.delete]', error);
      if (error.message === 'ROLE_NOT_FOUND') {
        R.notFound(res, 'Role');
      } else if (error.message === 'CANNOT_DELETE_SYSTEM_ROLE') {
        R.forbidden(res, 'Cannot delete system roles');
      } else if (error.message === 'ROLE_IN_USE') {
        R.conflict(res, 'Role is assigned to users');
      } else {
        R.serverError(res, error.message);
      }
    }
  }
}
