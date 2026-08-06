// =============================================================================
// Pagination utilities — safe, bounded query-string parsing
// =============================================================================

export interface PaginationParams {
  page:  number;
  limit: number;
  skip:  number;
}

/**
 * Parse page/limit from an Express query string, clamping to safe bounds.
 * - page:  1 – 10 000
 * - limit: 1 – 100
 */
export function parsePagination(query: {
  page?:  string | string[];
  limit?: string | string[];
}): PaginationParams {
  const page  = Math.max(1, Math.min(10_000, parseInt(String(query.page  ?? '1'),  10) || 1));
  const limit = Math.max(1, Math.min(100,    parseInt(String(query.limit ?? '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}
