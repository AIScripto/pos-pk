# 02 - PostgreSQL Database Installation & Configuration Guide

This document provides complete instructions for installing, configuring, securing, and maintaining PostgreSQL for the **AIPos / Crip-Crumbs** application stack.

You can set up PostgreSQL using either:
- **Option A: Native System Service** (Recommended for dedicated Linux database servers).
- **Option B: Containerized Docker Setup** (Recommended for containerized deployments & fast local dev).

---

## Table of Contents
1. [Database Prerequisites & Specifications](#1-database-prerequisites--specifications)
2. [Option A: Native Linux PostgreSQL Setup](#2-option-a-native-linux-postgresql-setup)
3. [Option B: Containerized Docker PostgreSQL Setup](#3-option-b-containerized-docker-postgresql-setup)
4. [Prisma ORM Initialization & Database Migrations](#4-prisma-orm-initialization--database-migrations)
5. [Database Backup & Automated Maintenance](#5-database-backup--automated-maintenance)
6. [Troubleshooting & Common Database Errors](#6-troubleshooting--common-database-errors)

---

## 1. Database Prerequisites & Specifications

| Property | Default Value | Notes |
| :--- | :--- | :--- |
| **PostgreSQL Version** | PostgreSQL 16 (or 15+) | Tested with 16-alpine and Ubuntu 24.04/22.04 native packages |
| **Database Name** | `crip_crumbs` | Configured in Prisma schema |
| **Default User** | `postgres` (or `crip_user`) | Password authenticated via SCRAM-SHA-256 |
| **Default Password** | `postgres` (Change in production!) | Update in `.env` |
| **Port** | `5432` | Standard PostgreSQL port |
| **Default Connection URL** | `postgresql://postgres:postgres@localhost:5432/crip_crumbs?schema=public` |

---

## 2. Option A: Native Linux PostgreSQL Setup

### Step 2.1: Install PostgreSQL 16 Package
```bash
# Add official PostgreSQL Apt Repository (For latest PG 16 release)
sudo sudo install -d /usr/share/postgresql-common/pgdg
sudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc --fail https://www.postgresql.org/media/keys/ACCC4CF8.asc

sudo sh -c 'echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Update and install PostgreSQL 16 & contrib modules
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib
```

### Step 2.2: Enable & Start PostgreSQL Service
```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Check status
sudo systemctl status postgresql
```

### Step 2.3: Create Database & User
Switch to the `postgres` system user to open `psql`:

```bash
sudo -u postgres psql
```

Inside the interactive `psql` console, run:
```sql
-- 1. Set password for default 'postgres' superuser
ALTER USER postgres WITH PASSWORD 'postgres';

-- 2. Create the crip_crumbs database
CREATE DATABASE crip_crumbs OWNER postgres;

-- 3. Grant full privileges
GRANT ALL PRIVILEGES ON DATABASE crip_crumbs TO postgres;

-- Exit psql
\q
```

### Step 2.4: Configure Remote Access & Authentication (Optional)

If your API backend runs on a different server than PostgreSQL, enable network connections:

1. **Edit `postgresql.conf`**:
   ```bash
   sudo nano /etc/postgresql/16/main/postgresql.conf
   ```
   Uncomment and set `listen_addresses`:
   ```ini
   listen_addresses = '*' # Or specify exact backend IP e.g. '192.168.1.50, 127.0.0.1'
   ```

2. **Edit `pg_hba.conf`**:
   ```bash
   sudo nano /etc/postgresql/16/main/pg_hba.conf
   ```
   Add connection rule for password authentication (`scram-sha-256`):
   ```text
   # TYPE  DATABASE        USER            ADDRESS                 METHOD
   host    crip_crumbs     postgres        0.0.0.0/0               scram-sha-256
   ```

3. **Restart PostgreSQL**:
   ```bash
   sudo systemctl restart postgresql
   ```

4. **Verify Port Listening**:
   ```bash
   sudo ss -tulpn | grep 5432
   ```

---

## 3. Option B: Containerized Docker PostgreSQL Setup

If you prefer to run PostgreSQL inside Docker (matching our `docker-compose.yml` config):

### Step 3.1: Standalone Docker Run Command
```bash
docker run -d \
  --name crip-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crip_crumbs \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:16-alpine
```

### Step 3.2: Verification & CLI Access via Docker
To access the containerized database CLI:
```bash
docker exec -it crip-postgres psql -U postgres -d crip_crumbs
```

---

## 4. Prisma ORM Initialization & Database Migrations

Once PostgreSQL is running, execute Prisma database migrations from the `backend/` directory to generate tables, indexes, and seed initial data.

### Step 4.1: Configure Backend Environment Variables
Navigate to the `backend/` directory:
```bash
cd backend
```

Create or update your `.env` file:
```ini
NODE_ENV=development
PORT=3500
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crip_crumbs?schema=public"
JWT_SECRET="your_secure_random_jwt_secret_key"
CLIENT_URL="http://localhost:5000"
CORS_ORIGINS="http://localhost:5000,http://localhost:8080"
```

### Step 4.2: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4.3: Run Database Migrations
For local development:
```bash
# Applies migrations and updates database schema
npx prisma migrate dev --name init
```

For production deployment:
```bash
# Applies existing migration files safely without generating new ones
npx prisma migrate deploy
```

### Step 4.4: Seed Initial Data
Populate default settings, admin user, sample products, and categories:
```bash
npm run seed
# or
npx ts-node prisma/seed.ts
```

---

## 5. Database Backup & Automated Maintenance

### Step 5.1: Manual Database Backup (`pg_dump`)
```bash
# Native PostgreSQL backup
pg_dump -U postgres -h localhost -d crip_crumbs -F c -b -v -f crip_crumbs_backup_$(date +%Y%m%d_%H%M%S).dump

# Docker PostgreSQL backup
docker exec -t crip-postgres pg_dump -U postgres crip_crumbs > crip_crumbs_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 5.2: Database Restore (`pg_restore` or `psql`)
```bash
# Native PostgreSQL restore
pg_restore -U postgres -h localhost -d crip_crumbs -v crip_crumbs_backup.dump

# Docker PostgreSQL SQL restore
cat crip_crumbs_backup.sql | docker exec -i crip-postgres psql -U postgres -d crip_crumbs
```

### Step 5.3: Automated Daily Backup Cron Job
Create a script `/usr/local/bin/backup-postgres.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Perform backup
docker exec -t crip-postgres pg_dump -U postgres crip_crumbs | gzip > "$BACKUP_DIR/crip_crumbs_$TIMESTAMP.sql.gz"

# Remove backups older than 14 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -delete
```

Make it executable and add to crontab:
```bash
chmod +x /usr/local/bin/backup-postgres.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-postgres.sh") | crontab -
```

---

## 6. Troubleshooting & Common Database Errors

### Error: `FATAL: password authentication failed for user "postgres"`
- **Cause**: Password in `DATABASE_URL` does not match the PostgreSQL user password.
- **Fix**: Reset user password inside `psql`:
  ```sql
  ALTER USER postgres WITH PASSWORD 'your_actual_password';
  ```

### Error: `connect ECONNREFUSED 127.0.0.1:5432`
- **Cause**: PostgreSQL is stopped, or listening on sockets only.
- **Fix**: Check status:
  ```bash
  sudo systemctl status postgresql # for native
  docker ps | grep postgres        # for docker
  ```

### Error: `P1001: Can't reach database server at localhost:5432`
- **Cause**: Incorrect hostname in `DATABASE_URL` when running inside Docker containers.
- **Fix**: Inside Docker Compose, set hostname to the database container service name `db`:
  `DATABASE_URL=postgresql://postgres:postgres@db:5432/crip_crumbs`

---

## Next Steps
- Proceed to [03-DOCKER-FRONTEND-BACKEND-SETUP.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/installation/03-DOCKER-FRONTEND-BACKEND-SETUP.md) to launch both Frontend and Backend alongside PostgreSQL via Docker Compose.
