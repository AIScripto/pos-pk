// ─────────────────────────────────────────────────────────────────────────────
// Prisma client singleton — one instance shared across the entire server
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { env }          from '../../config/env';

const prisma = new PrismaClient({
  log: env.isDev ? ['query', 'warn', 'error'] : ['error'],
});

/**
 * SQLite durability settings for a point-of-sale terminal.
 *
 * These are applied per connection and are not optional on a till. SQLite's
 * defaults are tuned for a single-user desktop file, not for a process that
 * must survive the plug being pulled mid-transaction on a shop floor.
 *
 *  - `journal_mode = WAL`   Readers no longer block on the writer, so a report
 *                           or the kitchen display cannot stall a sale. WAL also
 *                           recovers cleanly from a power cut: the database is
 *                           rolled forward from the log on next open.
 *  - `synchronous = FULL`   An fsync on every commit. NORMAL is the usual
 *                           recommendation with WAL and is durable across an
 *                           application crash, but it can lose the most recent
 *                           transaction when the OS dies or the plug is pulled.
 *                           That transaction is a customer's payment. The fsync
 *                           costs single-digit milliseconds and a till commits a
 *                           few times a minute, not thousands — so the usual
 *                           throughput argument for NORMAL simply does not apply
 *                           here, and losing a sale does.
 *  - `foreign_keys = ON`    SQLite does not enforce foreign keys by default.
 *                           Prisma's SQLite connector already turns this on, so
 *                           this is belt-and-braces: it keeps the guarantee
 *                           explicit and covers any raw connection that does not
 *                           go through Prisma (the backup script, a repair
 *                           session). Without it the 42-model FK graph is
 *                           decorative and orphans accumulate silently.
 *  - `busy_timeout`         Wait rather than immediately throwing SQLITE_BUSY
 *                           when another connection holds the write lock.
 *
 * Note on scope: `journal_mode` is persisted in the database file header, so it
 * survives restarts and applies to every connection. The other three are
 * PER-CONNECTION. Prisma pools connections, so setting them once would only
 * cover whichever connection happened to run them — which is why the datasource
 * URL pins `connection_limit=1` (see .env). SQLite allows one writer regardless,
 * so a single connection costs nothing here and removes lock contention
 * entirely. If that limit is ever raised, these pragmas must move into a
 * connect-time hook or foreign keys will be silently unenforced on most queries.
 */
const SQLITE_PRAGMAS = [
  'PRAGMA journal_mode = WAL',
  'PRAGMA synchronous = FULL',
  'PRAGMA foreign_keys = ON',
  'PRAGMA busy_timeout = 5000',
];

let pragmasApplied = false;

export async function applySqlitePragmas(): Promise<void> {
  if (pragmasApplied) return;
  if (!process.env.DATABASE_URL?.startsWith('file:')) return;

  // `$queryRawUnsafe`, not `$executeRawUnsafe`: several PRAGMA statements return
  // a row with the resulting value, and SQLite rejects that through execute.
  for (const pragma of SQLITE_PRAGMAS) {
    await prisma.$queryRawUnsafe(pragma);
  }
  pragmasApplied = true;
}

export default prisma;
