import { Router }               from 'express';
import { auth }                from '../../../shared/middleware/auth.middleware';
import { validateBody }        from '../../../shared/middleware/validation.middleware';
import { HeldOrderController } from '../controllers/held-order.controller';
import { CreateHeldOrderSchema } from '../../../shared/schemas';

const router = Router();

router.post('/',      auth('cashier'), validateBody(CreateHeldOrderSchema), HeldOrderController.create);
router.get('/',       auth('cashier'), HeldOrderController.list);
router.delete('/:id', auth('cashier'), HeldOrderController.remove);

export default router;
