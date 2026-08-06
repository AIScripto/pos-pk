import { Router }              from 'express';
import { auth }               from '../../../shared/middleware/auth.middleware';
import { validateBody }       from '../../../shared/middleware/validation.middleware';
import { InvoiceController }  from '../controllers/invoice.controller';
import { CreateInvoiceSchema, VoidInvoiceSchema } from '../../../shared/schemas';

const router = Router();

router.post('/',                               auth('cashier'),        validateBody(CreateInvoiceSchema), InvoiceController.create);
router.get('/',                                auth('cashier'),        InvoiceController.list);
router.get('/till/:sessionId/summary',         auth('cashier'),        InvoiceController.tillSummary);
router.get('/till/:sessionId/categories',      auth('cashier'),        InvoiceController.categorySummary);
router.delete('/:id',                          auth('branch_manager'), validateBody(VoidInvoiceSchema),   InvoiceController.voidInvoice);

export default router;
