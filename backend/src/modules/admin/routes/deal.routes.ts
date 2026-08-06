import { Router } from 'express';
import { z } from 'zod';
import { auth, validateBody } from '../../../shared/middleware';
import { DealController } from '../controllers/deal.controller';

const router = Router();

const createDealSchema = z.object({
  name: z.string().min(1),
  tag: z.string().min(1).regex(/^[a-z0-9-]+$/i),
  description: z.string().nullable().optional(),
  basePricePaisa: z.number().nonnegative(),
  salePricePaisa: z.number().nonnegative().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).nullable().optional(),
});

const updateDealSchema = createDealSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get('/', auth('cashier'), DealController.list);
router.get('/:id', auth('org_admin'), DealController.get);
router.post('/', auth('org_admin'), validateBody(createDealSchema), DealController.create);
router.patch('/:id', auth('org_admin'), validateBody(updateDealSchema), DealController.update);
router.delete('/:id', auth('org_admin'), DealController.delete);

export default router;
