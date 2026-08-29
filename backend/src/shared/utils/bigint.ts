// =============================================================================
// Database id conversion utilities
// =============================================================================
//
// Ids are `Int` in the schema, not `BigInt`. That is not a preference: SQLite
// only auto-assigns a primary key declared exactly `INTEGER PRIMARY KEY`, so a
// `BIGINT PRIMARY KEY` column is not a rowid alias and `autoincrement()` yields
// NULL. SQLite still stores INTEGER as 64-bit on disk; the practical ceiling is
// JavaScript's safe-integer limit (2^53), which one terminal will never reach.
//
// The function names are unchanged so the ~140 call sites read the same. They
// now return `number`. `toStringId` is what guarantees ids leave the API as
// strings, and it is unaffected.

/** A database identifier as the Prisma client expects it. */
export type DbId = number;

/**
 * Safe conversion from a string/number id to the numeric form Prisma wants.
 * Throws on anything that is not a finite integer.
 */
export function toBigInt(value: string | number | number | null | undefined): DbId {
  if (value === null || value === undefined) {
    throw new Error('Cannot convert null/undefined to an id');
  }
  const n = typeof value === 'bigint' ? Number(value) : Number(value);
  if (!Number.isInteger(n)) {
    throw new Error(`Invalid id value: ${value}`);
  }
  if (!Number.isSafeInteger(n)) {
    // Better to fail loudly than to silently truncate an identifier.
    throw new Error(`Id exceeds the safe integer range: ${value}`);
  }
  return n;
}

/**
 * Safe conversion with default fallback
 */
export function toBigIntOrDefault(
  value: string | number | number | null | undefined,
  defaultValue: DbId = 0,
): DbId {
  if (value === null || value === undefined) return defaultValue;
  try {
    return toBigInt(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Convert an array of string/number ids to their numeric form
 */
export function toBigIntArray(values: (string | number | number)[]): DbId[] {
  return values.map((v) => toBigInt(v));
}

/**
 * Convert bigint to string for API responses
 */
export function toStringId(value: number | number | string): string {
  return String(value);
}
