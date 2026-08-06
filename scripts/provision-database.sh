#!/bin/bash
# ==============================================================================
# Script: provision-database.sh
# Purpose: Check if database exists, create database, run migrations, and seed users.
# ==============================================================================

set -e

DB_HOST="${DB_HOST:-168.62.16.59}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-appuser}"
DB_PASSWORD="${DB_PASSWORD:-#786Allahis1}"
DB_NAME="${DB_NAME:-crispcrumbs}"

echo "======================================================================"
echo "🔍 Checking Database: '$DB_NAME' on $DB_HOST:$DB_PORT"
echo "======================================================================"

# URL encode password for URI
ENCODED_PASS=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$DB_PASSWORD")
PG_URI="postgresql://${DB_USER}:${ENCODED_PASS}@${DB_HOST}:${DB_PORT}/postgres"
TARGET_DB_URI="postgresql://${DB_USER}:${ENCODED_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Check if Database Exists in PostgreSQL
DB_EXISTS=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
  echo "⚠️ Database '$DB_NAME' ALREADY EXISTS. Skipping database creation."
else
  echo "✨ Database '$DB_NAME' does NOT exist. Starting provisioning..."

  # 1. Create Database
  echo "📦 [1/3] Creating Database '$DB_NAME'..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

  # 2. Run Prisma Migrations (Create Tables)
  echo "🔄 [2/3] Running Schema Migrations (Creating Tables)..."
  cd backend
  DATABASE_URL="$TARGET_DB_URI" npx prisma migrate deploy

  # 3. Seed Initial 2 Users (Super Admin & Store Admin)
  echo "🌱 [3/3] Seeding Initial Users..."
  DATABASE_URL="$TARGET_DB_URI" npx ts-node src/scripts/seedUsers.ts

  echo "======================================================================"
  echo "🎉 Provisioning Complete!"
  echo "======================================================================"
  echo "Database: $DB_NAME"
  echo ""
  echo "User 1 (Super Admin):"
  echo "  Username: superadmin"
  echo "  Password: @!786Allahis1!#"
  echo ""
  echo "User 2 (Store Admin):"
  echo "  Username: admin"
  echo "  Password: #admin@!"
  echo "======================================================================"
fi
