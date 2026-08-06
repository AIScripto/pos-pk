// =============================================================================
// Area Routes — REST API endpoints for area management
// =============================================================================

import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { AreaController } from '../controllers/area.controller';

const router = Router();

// All routes require org_admin role
router.get('/', auth('org_admin'), AreaController.list);
router.get('/:id', auth('org_admin'), AreaController.get);
router.post('/', auth('org_admin'), AreaController.create);
router.patch('/:id', auth('org_admin'), AreaController.update);
router.delete('/:id', auth('org_admin'), AreaController.delete);

export default router;
