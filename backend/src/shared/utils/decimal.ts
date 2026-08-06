// =============================================================================
// Decimal utilities — safe conversion for Prisma Decimal fields
// =============================================================================

import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert a nullable number to a Prisma Decimal.
 * Returns null when the value is null, undefined, or NaN.
 */
export function toDecimal(value: number | null | undefined): Decimal | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return new Decimal(String(value));
}
