import { Router } from 'express';
import { auth } from '../../../middleware/auth.middleware';
import { RoleController } from '../controllers/role.controller';

const router = Router();

/**
 * GET /admin/roles
 * List all roles for the organization
 */
router.get('/', auth('org_admin'), RoleController.list);

/**
 * GET /admin/roles/:id
 * Get a single role by ID
 */
router.get('/:id', auth('org_admin'), RoleController.get);

/**
 * POST /admin/roles
 * Create a new role
 */
router.post('/', auth('org_admin'), RoleController.create);

/**
 * PATCH /admin/roles/:id
 * Update an existing role
 */
router.patch('/:id', auth('org_admin'), RoleController.update);

/**
 * DELETE /admin/roles/:id
 * Delete a role (soft delete)
 */
router.delete('/:id', auth('org_admin'), RoleController.delete);

export const roleRoutes = router;
