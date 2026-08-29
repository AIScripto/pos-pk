/**
 * Keeps database ids as strings on the wire.
 *
 * Ids are `Int` in the schema (SQLite only auto-assigns an `INTEGER PRIMARY KEY`),
 * so Prisma hands back JavaScript numbers. Every client in this repo types ids as
 * `string` — `id: string` throughout `frontend/src/lib/api/*` — and a number would
 * silently break equality checks (`'5' !== 5`) and route params.
 *
 * Previously a `typeof value === 'bigint'` replacer did this job. With numeric ids
 * that test never fires, so the decision is made on the KEY instead: `id`, or any
 * key ending in `Id`. Nothing else is touched — quantities, prices in paisa and
 * counts stay numbers, which is what callers expect.
 */

const ID_KEY = /^id$|Id$/;

/** JSON.stringify replacer, and the value passed to Express' `json replacer`. */
export function idReplacer(key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'number' && ID_KEY.test(key)) return String(value);
  return value;
}

/** Deep-convert ids to strings in an already-built object (for non-Express paths). */
export function stringifyIds<T>(input: T): T {
  return JSON.parse(JSON.stringify(input, idReplacer)) as T;
}
