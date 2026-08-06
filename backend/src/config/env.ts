// ─────────────────────────────────────────────────────────────────────────────
// Environment configuration — typed, validated at startup
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load .env.crispcrumbs if present or specified via ENV_FILE/CLIENT_ENV, fallback to .env
const customEnvName = process.env.ENV_FILE || process.env.CLIENT_ENV || '.env.crispcrumbs';
const customEnvPath = path.resolve(__dirname, '../../', customEnvName);
const defaultEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(customEnvPath)) {
  dotenv.config({ path: customEnvPath });
} else {
  dotenv.config({ path: defaultEnvPath });
}

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function buildDatabaseUrl(): string {
  // 1. Direct explicit connection string override
  if (process.env.CLIENT_DATABASE_URL) return process.env.CLIENT_DATABASE_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.LOCAL_DATABASE_URL) return process.env.LOCAL_DATABASE_URL;

  // 2. Strict validation for client database variables
  const host = process.env.CLIENT_DB_HOST || process.env.DB_HOST;
  const user = process.env.CLIENT_DB_USER || process.env.DB_USER;
  const password = process.env.CLIENT_DB_PASSWORD || process.env.DB_PASSWORD;
  const dbName = process.env.CLIENT_DB_NAME || process.env.DB_NAME;
  const port = process.env.CLIENT_DB_PORT || process.env.DB_PORT || '5432';

  const missing: string[] = [];
  if (!host) missing.push('CLIENT_DB_HOST (or DB_HOST)');
  if (!user) missing.push('CLIENT_DB_USER (or DB_USER)');
  if (!password) missing.push('CLIENT_DB_PASSWORD (or DB_PASSWORD)');
  if (!dbName) missing.push('CLIENT_DB_NAME (or DB_NAME)');

  if (missing.length > 0) {
    const clientName = process.env.CLIENT_NAME || dbName || 'default';
    throw new Error(
      `[Database Config Error] Failed to initialize database connection for client '${clientName}'. Missing required environment variables: ${missing.join(', ')}`
    );
  }

  const encodedUser = encodeURIComponent(user!);
  const encodedPass = encodeURIComponent(password!);
  const encodedDbName = encodeURIComponent(dbName!);

  return `postgresql://${encodedUser}:${encodedPass}@${host}:${port}/${encodedDbName}`;
}

const NODE_ENV = optional('NODE_ENV', 'development');
const databaseUrl = buildDatabaseUrl();
const directUrl = optional('DIRECT_URL', databaseUrl);

// Prisma only reads DATABASE_URL from schema.prisma, so normalize it once here
// before any PrismaClient singleton is created.
process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = directUrl;

export const env = {
  NODE_ENV,
  CLIENT_NAME: optional('CLIENT_NAME', 'default'),
  PORT: parseInt(optional('SERVER_PORT', '3500'), 10),
  CLIENT_URL: optional('CLIENT_URL', 'http://localhost:5173'),
  CORS_ORIGINS: optional('CORS_ORIGINS', optional('CLIENT_URL', 'http://localhost:5173'))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  DATABASE_URL: databaseUrl,
  DIRECT_URL: directUrl,
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES: optional('JWT_EXPIRES_IN', '12h'),

  // Stripe (optional — only needed for card payments)
  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY', ''),

  // OpenAI — AI Sales Dashboard (gpt-4o-mini + whisper-1)
  OPENAI_API_KEY: optional('OPENAI_API_KEY', ''),

  // SMS / WhatsApp (optional — only needed for messaging)
  TWILIO_SID: optional('TWILIO_ACCOUNT_SID', ''),
  TWILIO_TOKEN: optional('TWILIO_AUTH_TOKEN', ''),
  TWILIO_FROM: optional('TWILIO_PHONE_FROM', ''),

  // Azure Blob Storage
  AZURE_STORAGE_SAS_TOKEN: optional('AZURE_STORAGE_SAS_TOKEN', optional('SAS_TOKEN_AZURE_FILE', '')),
  AZURE_STORAGE_ACCOUNT: optional('AZURE_STORAGE_ACCOUNT', 'crispcrumbs'),
  AZURE_STORAGE_CONTAINER: optional('AZURE_STORAGE_CONTAINER', 'uploads'),

  get isDev() { return this.NODE_ENV === 'development'; },
  get isProd() { return this.NODE_ENV === 'production'; },
} as const;
