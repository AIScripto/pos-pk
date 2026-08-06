// =============================================================================
// Role-based home page routing — single source of truth
// =============================================================================

const ROLE_RANK: Record<string, number> = {
  super_admin:    100,
  org_admin:       80,
  admin:           80,
  city_manager:    60,
  branch_manager:  40,
  manager:         40,
  cashier:         20,
  kitchen:         10,
};

/**
 * Return the default landing page for a given role after login.
 *
 *  org_admin / super_admin / city_manager  → /admin/dashboard
 *  branch_manager / manager               → /manager
 *  kitchen                                 → /kitchen
 *  cashier / everything else               → /
 */
export function roleHomePage(role: string | undefined): string {
  const rank = ROLE_RANK[role ?? ''] ?? 0;
  if (rank >= 60) return '/admin/dashboard';   // city_manager and above
  if (rank >= 40) return '/manager';            // branch_manager / manager
  if (role === 'kitchen') return '/kitchen';
  return '/';
}
