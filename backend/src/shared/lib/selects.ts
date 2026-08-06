// =============================================================================
// Reusable Prisma select objects — avoids repeating identical field lists
// =============================================================================

/** Standard user projection used by list and getById.
 *  Includes all active role assignments so callers can extract branchId. */
export const userSelect = {
  id:        true,
  orgId:     true,
  username:  true,
  name:      true,
  email:     true,
  phone:     true,
  isActive:  true,
  createdAt: true,
  updatedAt: true,
  role: {
    select: { id: true, name: true, tag: true },
  },
  roles: {
    where:  { isActive: true },
    select: {
      id:        true,
      scopeType: true,
      scopeId:   true,
      role:      { select: { id: true, name: true, tag: true } },
    },
  },
} as const;
