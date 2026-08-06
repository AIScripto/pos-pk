// =============================================================================
// BigInt conversion utilities — string to bigint helpers
// =============================================================================

/**
 * Safe conversion from string to bigint
 * Returns the bigint value or throws if invalid
 */
export function toBigInt(value: string | number | bigint | null | undefined): bigint {
  if (value === null || value === undefined) {
    throw new Error('Cannot convert null/undefined to BigInt');
  }
  try {
    return BigInt(value);
  } catch (err) {
    throw new Error(`Invalid BigInt value: ${value}`);
  }
}

/**
 * Safe conversion with default fallback
 */
export function toBigIntOrDefault(
  value: string | number | bigint | null | undefined,
  defaultValue: bigint = BigInt(0),
): bigint {
  if (value === null || value === undefined) return defaultValue;
  try {
    return BigInt(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Convert string array to BigInt array
 */
export function toBigIntArray(values: (string | number | bigint)[]): bigint[] {
  return values.map((v) => toBigInt(v));
}

/**
 * Convert bigint to string for API responses
 */
export function toStringId(value: bigint | number | string): string {
  return String(value);
}
