// =============================================================================
// Category Routes — REST API endpoints for category management
// =============================================================================

import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { CategoryController } from '../controllers/category.controller';

const router = Router();

// All routes require org_admin role
router.get('/', auth('cashier'), CategoryController.list);
router.get('/:id', auth('org_admin'), CategoryController.get);
router.post('/', auth('org_admin'), CategoryController.create);
router.patch('/:id', auth('org_admin'), CategoryController.update);
router.delete('/:id', auth('org_admin'), CategoryController.delete);

export default router;
