import { Router }               from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/',                     auth('cashier'),         InventoryController.list);
router.get('/low-stock',            auth('branch_manager'),  InventoryController.lowStock);
router.put('/:productId',           auth('branch_manager'),  InventoryController.setStock);
router.patch('/:productId/adjust',  auth('branch_manager'),  InventoryController.adjust);

export default router;
