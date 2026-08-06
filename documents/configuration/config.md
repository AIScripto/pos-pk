# Crip Crumbs — Demo Setup & Data Guide

## Docker Images
```
tariqsulehri/aipos-be     (backend)
tariqsulehri/aipos-fe     (frontend)
```

---

## Files to Give the Client

```
docker-compose.yml
postgres/init/01_demo.sql
```

That is all. No `.env` file. No keys. No extra configuration.

---

## Case 1 — Brand New Machine (First Time)

### Prerequisites
- Docker Desktop installed and running

### Steps
```bash
# 1. Place both files keeping the same folder structure:
#
#    demo/
#    ├── docker-compose.yml
#    └── postgres/
#        └── init/
#            └── 01_demo.sql

# 2. Open terminal inside the demo/ folder and run:
docker-compose up -d
```

Postgres detects an empty volume on first start and automatically loads
`01_demo.sql`. The backend waits for the DB to be healthy before starting.

### Access
| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5000       |
| Backend  | http://localhost:3500       |
| Database | localhost:5432 / crip_crumbs |

### Login Credentials
| Role    | Email / Username       | Password  | PIN  |
|---------|------------------------|-----------|------|
| Admin   | admin@aipos.pk         | admin123  | 1234 |
| Cashier | cashier1               | —         | 5678 |

---

## Case 2 — Containers Already Running (Existing Volume)

If the client has run `docker-compose up -d` before, the postgres volume
already exists and the init script will **not** run again automatically.
They must reset the volume first:

```bash
# Stop containers and delete the old volume
docker-compose down -v

# Start fresh — init script loads the backup automatically
docker-compose up -d
```

> WARNING: `down -v` deletes all database data in the container.
> This is intentional — it lets the demo data load cleanly.

---

## Case 3 — Refresh Demo Data (New Backup from Your Machine)

When you want to give the client an updated snapshot of your local database:

```bash
# Run this on YOUR machine (not the client's)
pg_dump -U postgres -h localhost -d crip_crumbs \
  --no-owner --no-acl --no-tablespaces \
  | grep -v "^SET transaction_timeout" \
  > postgres/init/01_demo.sql
```

Then give the client the new `01_demo.sql` and tell them to run:

```bash
docker-compose down -v
docker-compose up -d
```

---

## Useful Commands

```bash
# Check all containers are running
docker-compose ps

# View backend logs
docker logs crip-crumbs-backend-1

# View postgres logs
docker logs crip-crumbs-db-1

# Connect to the database directly
docker exec -it crip-crumbs-db-1 psql -U postgres -d crip_crumbs

# Stop everything (keeps data)
docker-compose down

# Stop and wipe all data
docker-compose down -v

# Pull latest images and restart
docker-compose pull
docker-compose up -d
```

---

## Local PostgreSQL Reference
```bash
# List all local databases
psql -U postgres -h localhost -l
```
