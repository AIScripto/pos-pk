import { Router } from 'express';
import { auth } from '../../../shared/middleware';
import {
  approveTillClose,
  businessDaySummary,
  closeBusinessDay,
  closeShift,
  currentOperations,
  forceCloseTill,
  openBusinessDay,
  openShift,
  rejectTillClose,
  shiftSummary,
} from '../controllers/business-day.controller';

const router = Router();

router.get('/operations/current', auth('manager'), currentOperations);
router.get('/business-day/summary', auth('manager'), businessDaySummary);
router.post('/business-day/open', auth('manager'), openBusinessDay);
router.post('/business-day/close', auth('manager'), closeBusinessDay);
router.get('/shift/summary', auth('manager'), shiftSummary);
router.post('/shift/open', auth('manager'), openShift);
router.post('/shift/close', auth('manager'), closeShift);
router.post('/tills/:sessionId/approve-close', auth('manager'), approveTillClose);
router.post('/tills/:sessionId/reject-close', auth('manager'), rejectTillClose);
router.post('/tills/:sessionId/force-close', auth('branch_manager'), forceCloseTill);

export { router as businessDayRoutes };
