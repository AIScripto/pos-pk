import { Router }           from 'express';
import { auth } from '../../../shared/middleware/auth.middleware';
import { TableController } from '../controllers/table.controller';

const router = Router();

// Sections
router.get('/sections',        auth('cashier'),        TableController.listSections);
router.post('/sections',       auth('branch_manager'), TableController.createSection);
router.patch('/sections/:id',  auth('branch_manager'), TableController.updateSection);
router.delete('/sections/:id', auth('branch_manager'), TableController.removeSection);

// Tables
router.get('/',              auth('cashier'),        TableController.list);
router.post('/',             auth('branch_manager'), TableController.create);
router.patch('/:id',         auth('cashier'),        TableController.update);
router.patch('/:id/status',  auth('cashier'),        TableController.updateStatus);
router.delete('/:id',        auth('branch_manager'), TableController.remove);

export default router;
