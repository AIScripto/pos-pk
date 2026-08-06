// =============================================================================
// Brand Routes — API endpoints for brand management
// =============================================================================

import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller';
import { auth } from '../../../shared/middleware';

const brandRoutes = Router();

// GET /admin/brands — List all brands
brandRoutes.get('/brands', auth('org_admin'), BrandController.list);

// GET /admin/brands/:id — Get single brand
brandRoutes.get('/brands/:id', auth('org_admin'), BrandController.get);

// POST /admin/brands — Create new brand
brandRoutes.post('/brands', auth('org_admin'), BrandController.create);

// PATCH /admin/brands/:id — Update existing brand
brandRoutes.patch('/brands/:id', auth('org_admin'), BrandController.update);

// DELETE /admin/brands/:id — Soft delete brand
brandRoutes.delete('/brands/:id', auth('org_admin'), BrandController.delete);

export default brandRoutes;
