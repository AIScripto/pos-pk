// =============================================================================
// Permissions — granular action-based access control
// Every feature action maps to a permission string: "resource.action"
// Default sets are defined per role. Orgs can override in DB.
// =============================================================================

import type { UserRole } from './auth.js';

// ── All permissions in the system ─────────────────────────────────────────────

export type Permission =
  // Till
  | 'till.open'
  | 'till.close'
  | 'till.view'
  // Invoice / Orders
  | 'invoice.create'
  | 'invoice.void'
  | 'invoice.view'
  | 'invoice.list'
  // Products
  | 'product.view'
  | 'product.create'
  | 'product.edit'
  | 'product.delete'
  // Inventory
  | 'inventory.view'
  | 'inventory.adjust'
  // Customers
  | 'customer.view'
  | 'customer.create'
  | 'customer.edit'
  // Discounts
  | 'discount.apply'           // standard discount
  | 'discount.override'        // high-value / manager override
  // Reports
  | 'report.view'
  | 'report.export'
  // Config / Settings
  | 'config.view'
  | 'config.edit'
  // User management
  | 'user.view'
  | 'user.create'
  | 'user.edit'
  // Tables
  | 'table.view'
  | 'table.assign'
  | 'table.manage';

// ── All permissions list (useful for super_admin wildcard) ────────────────────

export const ALL_PERMISSIONS: Permission[] = [
  'till.open', 'till.close', 'till.view',
  'invoice.create', 'invoice.void', 'invoice.view', 'invoice.list',
  'product.view', 'product.create', 'product.edit', 'product.delete',
  'inventory.view', 'inventory.adjust',
  'customer.view', 'customer.create', 'customer.edit',
  'discount.apply', 'discount.override',
  'report.view', 'report.export',
  'config.view', 'config.edit',
  'user.view', 'user.create', 'user.edit',
  'table.view', 'table.assign', 'table.manage',
];

// ── Default permission sets per role ──────────────────────────────────────────
// Orgs can OVERRIDE these in the OrgRolePermission table.
// Higher roles automatically include all lower-role permissions.

const KITCHEN_PERMISSIONS: Permission[] = [
  'invoice.view',
  'product.view',
  'table.view',
];

const CASHIER_PERMISSIONS: Permission[] = [
  ...KITCHEN_PERMISSIONS,
  'till.open', 'till.close', 'till.view',
  'invoice.create', 'invoice.list',
  'customer.view', 'customer.create',
  'discount.apply',
  'table.assign',
];

const BRANCH_MANAGER_PERMISSIONS: Permission[] = [
  ...CASHIER_PERMISSIONS,
  'invoice.void',
  'product.create', 'product.edit',
  'inventory.view', 'inventory.adjust',
  'customer.edit',
  'discount.override',
  'report.view',
  'table.manage',
  'user.view',
];

const CITY_MANAGER_PERMISSIONS: Permission[] = [
  ...BRANCH_MANAGER_PERMISSIONS,
  'product.delete',
  'report.export',
  'user.create',
];

const ORG_ADMIN_PERMISSIONS: Permission[] = [
  ...CITY_MANAGER_PERMISSIONS,
  'user.edit',
  'config.view', 'config.edit',
];

// super_admin gets ALL permissions
const SUPER_ADMIN_PERMISSIONS: Permission[] = [...ALL_PERMISSIONS];

// ── Role → permissions map ─────────────────────────────────────────────────────

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  kitchen:        KITCHEN_PERMISSIONS,
  cashier:        CASHIER_PERMISSIONS,
  branch_manager: BRANCH_MANAGER_PERMISSIONS,
  city_manager:   CITY_MANAGER_PERMISSIONS,
  org_admin:      ORG_ADMIN_PERMISSIONS,
  super_admin:    SUPER_ADMIN_PERMISSIONS,
};

// ── Helper ─────────────────────────────────────────────────────────────────────

/** Check if a role has a permission by default (no DB lookup needed) */
export const roleHasPermission = (role: UserRole, permission: Permission): boolean =>
  DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;

// ── Org override type (mirrors DB model) ──────────────────────────────────────

export interface OrgRolePermission {
  id:         string;
  orgId:      string;
  role:       UserRole;
  permission: Permission;
  granted:    boolean;       // true = grant extra, false = revoke default
  isActive:   boolean;
  createdAt:  string;
  updatedAt:  string;
  createdBy:  string;
}
