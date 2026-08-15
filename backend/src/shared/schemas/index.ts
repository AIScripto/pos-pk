import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:      z.string().min(1, 'Username or email required'),
  password:   z.string().min(1, 'Password required').max(128),
  branchId:   z.string().optional(),
  terminalId: z.string().optional(),
});

export const PinLoginSchema = z.object({
  branchId:   z.string().min(1, 'branchId required'),
  terminalId: z.string().min(1, 'terminalId required'),
  pin:        z.string().regex(/^\d{4,8}$/, 'PIN must be 4–8 digits'),
});

export const ManagerApprovalSchema = z.object({
  branchId: z.string().optional(),
  action:   z.string().min(1, 'action required'),
  reason:   z.string().max(500).optional(),
  email:    z.string().email().optional(),
  password: z.string().max(128).optional(),
  pin:      z.string().optional(),
}).refine(d => d.email || d.pin, { message: 'Manager email or PIN required' });

// ── Till ──────────────────────────────────────────────────────────────────────

const DenominationEntry = z.object({
  value:        z.number().optional(),  // frontend field name
  denomination: z.number().optional(),  // alternative field name
  label:        z.string().optional(),
  count:        z.number().int().min(0),
  total:        z.number().optional(),
}).passthrough();

export const OpenTillSchema = z.object({
  terminalId:        z.string().min(1, 'terminalId required'),
  branchId:          z.string().optional(),
  cityId:            z.string().optional(),
  openingCashAmount: z.number().int().min(0).optional(),
  openingCashPaisa:  z.number().int().min(0).optional(),
  denominations:     z.array(DenominationEntry).optional(),
  notes:             z.string().max(500).optional(),
}).passthrough();

export const CloseTillSchema = z.object({
  sessionId:         z.string().min(1, 'sessionId required'),
  closingCashAmount: z.number().int().min(0).optional(),
  closingCashPaisa:  z.number().int().min(0).optional(),
  denominations:     z.array(DenominationEntry).optional(),
  notes:             z.string().max(500).optional(),
}).passthrough();

// ── Invoice ───────────────────────────────────────────────────────────────────

const InvoiceItemSchema = z.object({
  productId:         z.union([z.string(), z.number()]).optional(),
  dealId:            z.union([z.string(), z.number()]).optional(),
  productName:       z.string().min(1),
  productCode:       z.string().default(''),
  category:          z.string().default('other'),
  unitPricePaisa:    z.number().int().min(0),
  quantity:          z.number().int().min(1),
  discountPercent:   z.number().min(0).max(100).default(0),
  lumpDiscountPaisa: z.number().int().min(0).default(0),
  // Computed server-side — optional from client
  lineTotalPaisa:    z.number().int().min(0).optional(),
  isDeal:            z.boolean().default(false),
}).passthrough();

export const CreateInvoiceSchema = z.object({
  tillSessionId:         z.string().min(1, 'tillSessionId required'),
  items:                 z.array(InvoiceItemSchema).min(1, 'At least one item required').max(200),
  orderType:             z.string().default('dine_in'),
  paymentMethod:         z.string().default('cash'),
  // Computed server-side — optional from client
  subtotalPaisa:         z.number().int().min(0).optional(),
  grandTotalPaisa:       z.number().int().min(0).optional(),
  taxPaisa:              z.number().int().min(0).optional(),
  taxRate:               z.number().min(0).optional(),
  managerApprovalToken:  z.string().optional(),
  tableId:               z.union([z.string(), z.number()]).optional(),
  tableName:             z.string().optional(),
  covers:                z.number().int().min(0).optional(),
  customerId:            z.string().optional(),
  customerName:          z.string().optional(),
  customerPhone:         z.string().optional(),
  orderNotes:            z.string().max(1000).optional(),
  branchId:              z.string().optional(),
  cityId:                z.string().optional(),
  loyaltyPointsRedeemed: z.number().int().min(0).default(0),
}).passthrough();

export const VoidInvoiceSchema = z.object({
  reason: z.string().min(1, 'Void reason required').max(500),
});

// ── Held Order ────────────────────────────────────────────────────────────────

export const CreateHeldOrderSchema = z.object({
  label:              z.string().max(100).optional(),
  itemsJson:          z.string().min(1, 'itemsJson required'),
  activeCustomerJson: z.string().optional(),
  orderType:          z.string().default('dine-in'),
  tableId:            z.union([z.string(), z.number()]).optional(),
  tableName:          z.string().optional(),
  covers:             z.number().int().min(0).optional(),
  customerId:         z.string().optional(),
  customerName:       z.string().optional(),
  customerPhone:      z.string().optional(),
  orderNotes:         z.string().max(1000).optional(),
  terminalId:         z.string().optional(),
}).passthrough();

// ── Customer ──────────────────────────────────────────────────────────────────

export const CreateCustomerSchema = z.object({
  name:           z.string().min(1, 'name required').max(100),
  phone:          z.string().min(7).max(20),
  email:          z.string().email().optional().or(z.literal('')),
  dateOfBirth:    z.string().optional(),
  marketingOptIn: z.boolean().default(false),
  smsOptIn:       z.boolean().default(false),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
