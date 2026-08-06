import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { FoodTypeController } from '../controllers/food-type.controller';

const router = Router();

router.get('/', auth('org_admin'), FoodTypeController.list);
router.get('/:id', auth('org_admin'), FoodTypeController.get);
router.post('/', auth('org_admin'), FoodTypeController.create);
router.patch('/:id', auth('org_admin'), FoodTypeController.update);
router.delete('/:id', auth('org_admin'), FoodTypeController.remove);

export default router;
