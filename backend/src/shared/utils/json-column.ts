/**
 * Helpers for the JSON-as-text columns.
 *
 * SQLite has no native JSON column type, so the nine structured columns in the
 * schema (`metadata`, `discountsJson`, `allocationsJson`, `itemsJson`,
 * `activeCustomerJson`, `openingDenom`, `closingDenom`) are plain `String`.
 *
 * That is not a downgrade forced by SQLite: every service in this codebase
 * already declared these fields as `string` and wrote JSON-encoded text into
 * them, so the old `Json` column type was the outlier. Routing every read and
 * write through here means the encoding is decided in exactly one place.
 */

/** Encode a value for a JSON-as-text column. */
export function toJsonText(value: unknown): string {
  return JSON.stringify(value ?? null);
}

/** Encode for a nullable column: `null` stays SQL NULL rather than the text "null". */
export function toJsonTextOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : JSON.stringify(value);
}

/**
 * Decode a JSON-as-text column.
 *
 * Returns `fallback` on malformed content rather than throwing: a single bad row
 * written by an older build should not take down a report or a till closeout.
 */
export function fromJsonText<T>(text: string | null | undefined, fallback: T): T {
  if (text === null || text === undefined || text === '') return fallback;
  try {
    const parsed = JSON.parse(text);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}
