import { Router } from 'express';
import { auth } from '../../../middleware/auth.middleware';
import { UserController } from '../controllers/user.controller';

const router = Router();

/**
 * GET /admin/users
 * List all users for the organization
 */
router.get('/', auth('org_admin'), UserController.list);

/**
 * GET /admin/users/suggest-username?roleTag=manager
 * Return the next available username for a role tag
 */
router.get('/suggest-username', auth('org_admin'), UserController.suggestUsername);

/**
 * GET /admin/users/:id
 * Get a single user by ID
 */
router.get('/:id', auth('org_admin'), UserController.get);

/**
 * POST /admin/users
 * Create a new user
 */
router.post('/', auth('org_admin'), UserController.create);

/**
 * PATCH /admin/users/:id
 * Update an existing user
 */
router.patch('/:id', auth('org_admin'), UserController.update);

/**
 * DELETE /admin/users/:id
 * Delete a user (soft delete)
 */
router.delete('/:id', auth('org_admin'), UserController.delete);

/**
 * PATCH /admin/users/:id/pin
 * Set or update a user's 4-digit PIN
 */
router.patch('/:id/pin', auth('org_admin'), UserController.setPin);

/**
 * DELETE /admin/users/:id/pin
 * Remove a user's PIN (disables PIN login)
 */
router.delete('/:id/pin', auth('org_admin'), UserController.clearPin);

export const userRoutes = router;
