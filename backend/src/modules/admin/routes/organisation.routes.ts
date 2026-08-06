import { Router } from 'express';
import { z } from 'zod';
import { auth, validateBody } from '../../../shared/middleware';
import { OrganisationController } from '../controllers/organisation.controller';

const router = Router();

const updateOrganisationSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().url().nullable().optional(),
  website: z.string().url().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  addrLine1: z.string().optional(),
  addrLine2: z.string().nullable().optional(),
  addrCity: z.string().optional(),
  addrState: z.string().optional(),
  addrCountry: z.string().optional(),
  addrPostCode: z.string().optional(),
}).strict();

router.get('/',   auth('cashier'),   OrganisationController.getOrg);
router.patch('/', auth('org_admin'), validateBody(updateOrganisationSchema), OrganisationController.updateOrg);

export default router;
