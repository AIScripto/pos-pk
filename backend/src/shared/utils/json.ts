// =============================================================================
// JSON utilities — safe parse helpers
// =============================================================================

/**
 * Parse JSON without throwing. Returns the fallback value if the string is
 * missing, empty, or malformed.
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
