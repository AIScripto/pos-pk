import { Router }              from 'express';
import { auth }               from '../../../shared/middleware/auth.middleware';
import { validateBody }       from '../../../shared/middleware/validation.middleware';
import { CustomerController } from '../controllers/customer.controller';
import { CreateCustomerSchema, UpdateCustomerSchema } from '../../../shared/schemas';

const router = Router();

router.get('/',                  auth('cashier'), CustomerController.list);
router.get('/phone/:phone',      auth('cashier'), CustomerController.getByPhone);
router.get('/:id',               auth('cashier'), CustomerController.getById);
router.post('/',                 auth('cashier'), validateBody(CreateCustomerSchema), CustomerController.create);
router.patch('/:id',             auth('cashier'), validateBody(UpdateCustomerSchema), CustomerController.update);
router.get('/:id/loyalty',       auth('cashier'), CustomerController.loyaltyHistory);

export default router;
