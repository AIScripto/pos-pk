// =============================================================================
// Role constants — single source of truth for role hierarchy
// Previously duplicated in auth.service.ts and auth.middleware.ts
// =============================================================================

export const ROLE_RANK: Record<string, number> = {
  super_admin:    100,
  org_admin:       80,
  admin:           80,
  city_manager:    60,
  branch_manager:  40,
  manager:         40,
  cashier:         20,
  kitchen:         10,
};
