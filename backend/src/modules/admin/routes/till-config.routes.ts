import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { TillConfigController } from '../controllers/till-config.controller';

const router = Router();

router.get('/tills', auth('org_admin'), TillConfigController.listTills);
router.post('/tills', auth('org_admin'), TillConfigController.createTill);
router.patch('/tills/:id', auth('org_admin'), TillConfigController.updateTill);

router.get('/shifts', auth('org_admin'), TillConfigController.listShifts);
router.post('/shifts', auth('org_admin'), TillConfigController.createShift);
router.patch('/shifts/:id', auth('org_admin'), TillConfigController.updateShift);
router.get('/shifts/current', auth('cashier'), TillConfigController.currentShift);

export default router;
