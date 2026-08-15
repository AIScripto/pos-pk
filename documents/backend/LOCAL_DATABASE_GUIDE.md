# Local Database & Offline-First Deployment Guide

This guide explains how to deploy and operate Crip & Crumbs POS in **100% Local / On-Premises Mode** without relying on remote cloud databases.

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      STORE LAN / LOCALHOST                      │
│                                                                 │
│  ┌──────────────────────┐          ┌─────────────────────────┐  │
│  │   POS Terminal #1    │          │     POS Terminal #2     │  │
│  │ (Frontend + IndexedDB│          │ (Frontend + IndexedDB)  │  │
│  └──────────┬───────────┘          └───────────┬─────────────┘  │
│             │                                  │                │
│             └────────────────┬─────────────────┘                │
│                              │                                  │
│                   ┌──────────▼──────────┐                       │
│                   │ Express Backend API │ (Port 3500)           │
│                   └──────────┬──────────┘                       │
│                              │                                  │
│                   ┌──────────▼──────────┐                       │
│                   │  Local PostgreSQL   │ (Port 5432)           │
│                   │   or SQLite Store   │                       │
│                   └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Running with 100% Local Database

### Option 1: Local PostgreSQL (Recommended for Store Servers & Multi-Counter)

When running locally on the store's master machine, set `DATABASE_URL` in `backend/.env` to the local PostgreSQL instance:

```env
# Point to local PostgreSQL (100% private, no internet required)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crip_crumbs"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/crip_crumbs"
```

#### First-Time Database Setup:
```bash
cd backend
npm run db:migrate
npm run db:seed
```

---

### Option 2: Standalone SQLite Engine (Zero-Install Single PC)

For small kiosk counters where PostgreSQL installation is not desired:

1. Use the SQLite Prisma schema:
   ```bash
   cd backend
   npm run db:sqlite:push
   npm run db:sqlite:seed
   ```
2. Set `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

---

## 🔄 How Offline Sync Operates

1. **Disconnected Operation**:
   - If the network drops, the frontend automatically falls back to **IndexedDB** (`frontend/src/sync/db.ts`).
   - Sales, held carts, and cashier sessions continue without interruption.
2. **Auto-Reconnection Sync**:
   - When connection is re-established, pending sales queue items are dispatched in priority order.
   - Cashiers can also click **"Sync Now"** in the top bar indicator to trigger immediate synchronization.

---

## 🔐 Data Privacy & Backup

* **Local DB Backups**: For local PostgreSQL, regular automated dumps can be scheduled:
  ```bash
  pg_dump -U postgres crip_crumbs > /backups/crip_crumbs_$(date +%F).sql
  ```
* **No Telemetry / No Remote Leaks**: In Local Mode, no sales numbers or transaction records leave the local store network.
