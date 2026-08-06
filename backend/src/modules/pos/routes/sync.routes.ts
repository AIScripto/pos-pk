import { Router } from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { SyncController } from '../controllers/sync.controller';

const router = Router();

router.post('/batch', auth('cashier'), SyncController.batchSync);
router.post('/batch-seq', auth('cashier'), SyncController.batchSyncSequential);

export default router;
