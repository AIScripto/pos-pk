import prisma from '../../../shared/lib/prisma';

export interface CreateRoleInput {
  name: string;
  tag: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class RoleService {
  static async list(orgId: number) {
    const roles = await prisma.role.findMany({
      where: { orgId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return roles;
  }

  static async getById(orgId: number, roleId: number) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role || role.orgId !== orgId) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return role;
  }

  static async getByTag(orgId: number, tag: string) {
    const role = await prisma.role.findUnique({
      where: { orgId_tag: { orgId, tag } },
    });

    if (!role) {
      throw new Error('ROLE_NOT_FOUND');
    }

    return role;
  }

  static async create(orgId: number, input: CreateRoleInput) {
    // Check if tag already exists for this org
    const existingRole = await prisma.role.findUnique({
      where: { orgId_tag: { orgId, tag: input.tag.toLowerCase().trim() } },
    });

    if (existingRole) {
      throw new Error('DUPLICATE_TAG');
    }

    const role = await prisma.role.create({
      data: {
        orgId,
        name: input.name.trim(),
        tag: input.tag.toLowerCase().trim(),
        description: input.description?.trim(),
        createdBy: 'system',
      },
    });

    return role;
  }

  static async update(orgId: number, roleId: number, input: UpdateRoleInput) {
    const role = await this.getById(orgId, roleId);

    // Prevent editing system roles
    const systemRoles = ['admin', 'manager', 'cashier', 'kitchen'];
    if (systemRoles.includes(role.tag)) {
      throw new Error('CANNOT_EDIT_SYSTEM_ROLE');
    }

    const updated = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: input.name?.trim() || role.name,
        description: input.description?.trim() || role.description,
        isActive: input.isActive !== undefined ? input.isActive : role.isActive,
      },
    });

    return updated;
  }

  static async delete(orgId: number, roleId: number) {
    const role = await this.getById(orgId, roleId);

    // Prevent deleting system roles
    const systemRoles = ['admin', 'manager', 'cashier', 'kitchen'];
    if (systemRoles.includes(role.tag)) {
      throw new Error('CANNOT_DELETE_SYSTEM_ROLE');
    }

    // Check if any users are assigned this role
    const assignmentCount = await prisma.userRoleAssignment.count({
      where: { roleId, isActive: true },
    });

    if (assignmentCount > 0) {
      throw new Error('ROLE_IN_USE');
    }

    return await prisma.role.update({
      where: { id: roleId },
      data: { isActive: false },
    });
  }
}
