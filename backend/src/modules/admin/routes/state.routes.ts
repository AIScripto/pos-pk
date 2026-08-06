import { Router } from 'express';
import { auth } from '../../../middleware/auth.middleware';
import { StateController } from '../controllers/state.controller';

const router = Router();

/**
 * GET /admin/states
 * List all states for the organization
 */
router.get('/', auth('org_admin'), StateController.list);

/**
 * GET /admin/states/:id
 * Get a single state by ID
 */
router.get('/:id', auth('org_admin'), StateController.get);

/**
 * POST /admin/states
 * Create a new state
 */
router.post('/', auth('org_admin'), StateController.create);

/**
 * PATCH /admin/states/:id
 * Update an existing state
 */
router.patch('/:id', auth('org_admin'), StateController.update);

/**
 * DELETE /admin/states/:id
 * Soft delete a state
 */
router.delete('/:id', auth('org_admin'), StateController.delete);

export const stateRoutes = router;
