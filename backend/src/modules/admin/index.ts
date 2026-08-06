// =============================================================================
// Admin Module — mounts all Admin routes
// =============================================================================

import { Router } from 'express';
import * as adminRoutes from './routes';

export function mountAdminModule(apiRouter: Router) {
  apiRouter.use('/admin/products', adminRoutes.productRoutes);
  apiRouter.use('/admin/deals', adminRoutes.dealRoutes);
  apiRouter.use('/admin/config', adminRoutes.configRoutes);
  apiRouter.use('/admin', adminRoutes.brandRoutes);
  apiRouter.use('/admin/roles', adminRoutes.roleRoutes);
  apiRouter.use('/admin/users', adminRoutes.userRoutes);
  apiRouter.use('/admin/states', adminRoutes.stateRoutes);
  apiRouter.use('/admin/cities', adminRoutes.cityRoutes);
  apiRouter.use('/admin/areas', adminRoutes.areaRoutes);
  apiRouter.use('/admin/food-types', adminRoutes.foodTypeRoutes);
  apiRouter.use('/admin/categories', adminRoutes.categoryRoutes);
  apiRouter.use('/admin', adminRoutes.branchRoutes);
  apiRouter.use('/admin/uploads', adminRoutes.uploadRoutes);
  apiRouter.use('/admin/organisation', adminRoutes.organisationRoutes);
  apiRouter.use('/admin/ai-sales',     adminRoutes.aiSalesRoutes);
  apiRouter.use('/admin/manager',      adminRoutes.managerOverviewRoutes);
  apiRouter.use('/admin/manager',      adminRoutes.businessDayRoutes);
  apiRouter.use('/admin',              adminRoutes.tillConfigRoutes);
}
