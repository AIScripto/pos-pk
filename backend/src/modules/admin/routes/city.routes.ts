// =============================================================================
// City Routes — CRUD endpoints for city management
// =============================================================================

import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { CityController } from '../controllers/city.controller';

const router = Router();

// All city operations require org_admin role
router.get('/', auth('org_admin'), CityController.list);
router.get('/:id', auth('org_admin'), CityController.get);
router.post('/', auth('org_admin'), CityController.create);
router.patch('/:id', auth('org_admin'), CityController.update);
router.delete('/:id', auth('org_admin'), CityController.delete);

export default router;
