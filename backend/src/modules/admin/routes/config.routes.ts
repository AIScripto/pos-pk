import { Router }           from 'express';
import { auth }             from '../../../shared/middleware/auth.middleware';
import { ConfigController } from '../controllers/config.controller';

const router = Router();

// ── Section 1: Org Profile / Currency / Locale / Receipt ─────────────────────
router.get('/org',   auth('cashier'),   ConfigController.getOrgConfig);
router.patch('/org', auth('org_admin'), ConfigController.upsertOrgConfig);

// ── Section 2: Tax Configuration ──────────────────────────────────────────────
router.get('/tax',          auth('cashier'),   ConfigController.listTaxConfigs);
router.get('/tax/resolve',  auth('cashier'),   ConfigController.getTaxConfig);
router.post('/tax',         auth('org_admin'), ConfigController.createTaxConfig);
router.patch('/tax/:id',    auth('org_admin'), ConfigController.updateTaxConfig);
router.delete('/tax/:id',   auth('org_admin'), ConfigController.deleteTaxConfig);

// ── Section 3: Discount Presets ────────────────────────────────────────────────
router.get('/discounts',         auth('cashier'),   ConfigController.listDiscounts);
router.post('/discounts',        auth('org_admin'), ConfigController.createDiscount);
router.patch('/discounts/:id',   auth('org_admin'), ConfigController.updateDiscount);
router.delete('/discounts/:id',  auth('org_admin'), ConfigController.removeDiscount);

// ── Section 4: Loyalty Program ─────────────────────────────────────────────────
router.get('/loyalty',   auth('cashier'),   ConfigController.getLoyaltyConfig);
router.patch('/loyalty', auth('org_admin'), ConfigController.upsertLoyaltyConfig);

// ── Section 5: Branch Settings ─────────────────────────────────────────────────
router.get('/branch/:branchId',   auth('branch_manager'), ConfigController.getBranch);
router.patch('/branch/:branchId', auth('branch_manager'), ConfigController.updateBranch);

export default router;
