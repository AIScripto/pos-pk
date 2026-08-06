import { Router }             from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.get('/',                      auth('cashier'), ProductController.list);
router.get('/sku/next/:categoryId',  auth('org_admin'), ProductController.nextSku);
router.get('/:id',                   auth('org_admin'), ProductController.get);
router.post('/',    auth('org_admin'),  ProductController.create);
router.patch('/:id', auth('org_admin'), ProductController.update);
router.delete('/:id', auth('org_admin'), ProductController.remove);

export default router;
