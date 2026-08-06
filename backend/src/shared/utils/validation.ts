// =============================================================================
// Validation utilities — reusable uniqueness and constraint checks
// =============================================================================

/**
 * Throw an Error with `errorCode` when the Prisma query resolves to a
 * non-null value. Replaces the repeated:
 *   const existing = await prisma.X.findFirst({...});
 *   if (existing) throw new Error('DUPLICATE_X');
 */
export async function assertUnique(
  query: Promise<unknown>,
  errorCode: string,
): Promise<void> {
  if (await query) throw new Error(errorCode);
}
