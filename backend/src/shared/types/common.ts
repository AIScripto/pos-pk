// ─────────────────────────────────────────────────────────────────────────────
// Common / Base types shared across the entire platform
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every persisted entity extends BaseEntity.
 * Guarantees id, audit timestamps, soft-delete, and creator tracking.
 */
export interface BaseEntity {
  id:        string;
  isActive:  boolean;
  createdAt: string;   // ISO 8601 — always stored/sent as string
  updatedAt: string;
  createdBy: string;   // userId of the creator
}

/** Physical address — used by Branch and Organisation */
export interface Address {
  line1:    string;
  line2?:   string;
  city:     string;
  state:    string;
  country:  string;   // ISO 3166-1 alpha-2  e.g. "PK", "US", "GB"
  postCode: string;
  lat?:     number;   // for maps / delivery radius
  lng?:     number;
}

/** Standard API success response envelope */
export interface ApiResponse<T> {
  data:  T;
  error: null;
  meta?: PaginationMeta;
}

/** Standard API error response envelope */
export interface ApiError {
  data:  null;
  error: {
    code:    string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  total:   number;
  page:    number;
  limit:   number;
  pages:   number;
}

export interface PaginationQuery {
  page?:   number;
  limit?:  number;
  search?: string;
}
