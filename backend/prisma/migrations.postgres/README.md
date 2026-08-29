# Archived PostgreSQL migrations

These are the migration history for the PostgreSQL deployment
(`postgresql://…@168.62.16.59:5432/aipos` and its sibling profiles). They are
kept because that database still exists and this is the only record of how it
was built.

They are **not** runnable against SQLite — the SQL is Postgres-specific, and the
earliest migrations have already diverged from `schema.prisma` (they declare
`"id" TEXT` where the schema now says `BigInt @default(autoincrement())`).

The live SQLite history starts fresh in `prisma/migrations/`. To go back to
Postgres, restore `.env.postgres`, restore this directory, and revert the
`provider` line in `schema.prisma`.
