// ─────────────────────────────────────────────────────────────────────────────
// Crip Crumbs POS — Express Server Entry Point (Modular Architecture)
// ─────────────────────────────────────────────────────────────────────────────

import http                 from 'http';
import { idReplacer }        from './shared/utils/id-serializer';
import express              from 'express';
import cors                 from 'cors';
import helmet               from 'helmet';
import morgan               from 'morgan';
import cookieParser         from 'cookie-parser';
import path                 from 'path';
import { env }              from './config/env';
import { authRoutes }       from './shared/routes';
import { mountPosModule }   from './modules/pos';
import { mountAdminModule } from './modules/admin';
import { errorHandler, notFoundHandler } from './shared/middleware';
import { initIO }           from './lib/socket';
import { registerKitchenGateway } from './modules/kitchen/kitchen.gateway';
import db, { applySqlitePragmas } from './shared/lib/prisma';

const app    = express();
const server = http.createServer(app);

app.disable('etag');

// ── JSON BigInt serialisation ───────────────────────────────────────────────
app.set('json replacer', idReplacer);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = initIO(server);
registerKitchenGateway(io);

// ─── Security & logging ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const corsOrigin = (origin: string | undefined, cb: (e: Error | null, ok?: boolean) => void) => {
  if (!origin) return cb(null, true);
  
  const allowedOrigins = [
    'http://localhost:3500',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8080',
    ...env.CORS_ORIGINS,
  ];

  const isAllowedHost = /^https?:\/\/(localhost|127\.0\.0\.1|168\.62\.16\.59|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
  const isAllowed = isAllowedHost || allowedOrigins.includes(origin);

  if (isAllowed) {
    cb(null, true);
  } else {
    console.warn(`[CORS] Blocked origin: ${origin}`);
    cb(null, true); // Fallback allow in production behind Nginx reverse proxy
  }
};

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Cookie + body parsing ────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// ─── Static files ─────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health check ─────────────────────────────────────────────────────────────
const healthHandler = async (_req: express.Request, res: express.Response) => {
  let dbStatus = 'ok';
  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'disconnected';
  }

  const isHealthy = dbStatus === 'ok';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    environment: env.NODE_ENV,
    client: env.CLIENT_NAME,
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);

// ─── API Routes ───────────────────────────────────────────────────────────────

const apiRouter = express.Router();

apiRouter.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

apiRouter.get('/health', healthHandler);
apiRouter.use('/auth', authRoutes);
mountPosModule(apiRouter);
mountAdminModule(apiRouter);

app.use('/api/v1', apiRouter);

// ─── 404 + error handlers ─────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start & Graceful Shutdown ───────────────────────────────────────────────
server.listen(env.PORT, async () => {
  // WAL, foreign-key enforcement and the busy timeout have to be set on the
  // connection before the first sale, not after. See shared/lib/prisma.ts.
  const isSqlite = process.env.DATABASE_URL?.startsWith('file:') ?? false;
  if (isSqlite) {
    try {
      await applySqlitePragmas();
    } catch (err) {
      console.error('   DB      : FAILED to apply SQLite pragmas —', err);
      process.exit(1);
    }
  }

  console.log(`\n🍔  Enterprise POS server running (Production Grade)`);
  console.log(`   Port    : ${env.PORT}`);
  console.log(`   Env     : ${env.NODE_ENV}`);
  console.log(`   Client  : ${env.CLIENT_NAME}`);
  console.log(`   DB      : ${isSqlite ? 'SQLite (WAL, FK on)' : 'Connected'}`);
  console.log(`   CORS    : Active\n`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n[Server] ${signal} signal received: closing HTTP server...`);
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    try {
      await db.$disconnect();
      console.log('[Database] Prisma client disconnected cleanly.');
    } catch (err) {
      console.error('[Database] Error during disconnect:', err);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
