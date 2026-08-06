// =============================================================================
// Branch Routes — API endpoints for branch management
// =============================================================================

import { Router } from 'express';
import { BranchController } from '../controllers/branch.controller';
import { auth } from '../../../shared/middleware';

const branchRoutes = Router();

// GET /admin/branches?cityId=X&search=Y — List branches for a city
branchRoutes.get('/branches', auth('org_admin'), BranchController.list);

// GET /admin/branches/:id — Get single branch
branchRoutes.get('/branches/:id', auth('org_admin'), BranchController.get);

// POST /admin/branches — Create branch
branchRoutes.post('/branches', auth('org_admin'), BranchController.create);

// PATCH /admin/branches/:id — Update branch
branchRoutes.patch('/branches/:id', auth('org_admin'), BranchController.update);

// DELETE /admin/branches/:id — Soft delete branch
branchRoutes.delete('/branches/:id', auth('org_admin'), BranchController.delete);

export default branchRoutes;
