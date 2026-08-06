// ─────────────────────────────────────────────────────────────────────────────
// Prisma client singleton — one instance shared across the entire server
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { env }          from '../config/env';

const prisma = new PrismaClient({
  log: env.isDev ? ['query', 'warn', 'error'] : ['error'],
});

export default prisma;
