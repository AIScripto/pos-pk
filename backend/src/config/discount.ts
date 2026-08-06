// =============================================================================
// Discount configuration — centralised limits for all roles
// =============================================================================

export const DISCOUNT_LIMITS = {
  /** Maximum line-discount % a cashier may apply without manager approval */
  CASHIER_PERCENT: 10,
  /** Maximum line-discount % a branch manager may apply without approval */
  MANAGER_PERCENT: 25,
  /** Uncapped — only super_admin / org_admin */
  OVERRIDE_PERCENT: 100,
} as const;
