import { Router } from 'express';
import { auth } from '../../../shared/middleware';
import { managerOverview } from '../controllers/manager-overview.controller';

const router = Router();

router.get('/overview', auth('manager'), managerOverview);

export { router as managerOverviewRoutes };
