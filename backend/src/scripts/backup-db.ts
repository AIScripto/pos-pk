/**
 * SQLite snapshot backup.
 *
 * A single .db file on a shop-floor PC is one drive failure away from losing a
 * day's takings, and unlike the Postgres setup there is no remote copy. This is
 * the mitigation, and it matters more than any sync feature.
 *
 * `VACUUM INTO` is used rather than a file copy because it is atomic and
 * transaction-safe: it can run while the till is taking payments and always
 * produces a consistent, already-compacted database. Copying the .db file while
 * WAL is active would produce a torn snapshot.
 *
 *   npm run db:backup              -> ./backups/pos-<timestamp>.db
 *   npm run db:backup -- /mnt/usb  -> writes to another volume
 *
 * Run it hourly from cron/Task Scheduler, and point it at a DIFFERENT physical
 * device than the live database — a snapshot on the same failing disk is not a
 * backup.
 */
import { PrismaClient } from '@prisma/client';
import { mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const RETAIN_DAYS = 7;

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL ?? '';
  if (!url.startsWith('file:')) {
    console.error('db:backup only applies to SQLite (DATABASE_URL must start with "file:").');
    process.exit(1);
  }

  const outDir = resolve(process.argv[2] ?? './backups');
  mkdirSync(outDir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = join(outDir, `pos-${stamp}.db`);

  const prisma = new PrismaClient();
  try {
    // Integrity first: never overwrite good backups with a snapshot of a
    // database that is already damaged.
    const check = await prisma.$queryRawUnsafe<{ quick_check: string }[]>('PRAGMA quick_check');
    const result = check[0]?.quick_check;
    if (result !== 'ok') {
      console.error(`Integrity check FAILED (${result}) — refusing to snapshot a damaged database.`);
      process.exit(2);
    }

    await prisma.$executeRawUnsafe(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    console.log(`Backup written: ${target} (${(statSync(target).size / 1024).toFixed(0)} KB)`);

    prune(outDir);
  } finally {
    await prisma.$disconnect();
  }
}

/** Keep RETAIN_DAYS of snapshots; a till fills a disk quickly otherwise. */
function prune(dir: string): void {
  const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  for (const name of readdirSync(dir)) {
    if (!name.startsWith('pos-') || !name.endsWith('.db')) continue;
    const path = join(dir, name);
    if (statSync(path).mtimeMs < cutoff) {
      unlinkSync(path);
      removed += 1;
    }
  }
  if (removed) console.log(`Pruned ${removed} snapshot(s) older than ${RETAIN_DAYS} days.`);
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
