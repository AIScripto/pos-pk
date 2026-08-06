// =============================================================================
// POS Module — mounts all POS routes
// =============================================================================

import { Router } from 'express';
import * as posRoutes from './routes';
import { kitchenRoutes } from '../kitchen';

export function mountPosModule(apiRouter: Router) {
  apiRouter.use('/invoices', posRoutes.invoiceRoutes);
  apiRouter.use('/inventory', posRoutes.inventoryRoutes);
  apiRouter.use('/customers', posRoutes.customerRoutes);
  apiRouter.use('/till', posRoutes.tillRoutes);
  apiRouter.use('/tables', posRoutes.tableRoutes);
  apiRouter.use('/held-orders', posRoutes.heldOrderRoutes);
  apiRouter.use('/payment', posRoutes.paymentRoutes);
  apiRouter.use('/sync', posRoutes.syncRoutes);
  apiRouter.use('/kitchen', kitchenRoutes);
}
