import { Router }           from 'express';
import { auth }              from '../../../shared/middleware/auth.middleware';
import { validateBody }      from '../../../shared/middleware/validation.middleware';
import { TillController }    from '../controllers/till.controller';
import { OpenTillSchema, CloseTillSchema } from '../../../shared/schemas';

const router = Router();

router.get('/ops-status',          auth('cashier'),        TillController.opsStatus);
router.get('/current',             auth('cashier'),        TillController.current);
router.post('/open',               auth('cashier'),        validateBody(OpenTillSchema),  TillController.open);
router.post('/close',              auth('cashier'),        validateBody(CloseTillSchema), TillController.close);
router.get('/summary/:sessionId',  auth('cashier'),        TillController.summary);
router.get('/history',             auth('branch_manager'), TillController.history);

export default router;
