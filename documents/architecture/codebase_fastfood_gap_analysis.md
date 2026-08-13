# Codebase Audit & Fast Food POS Gap Analysis

## Executive Summary
This audit evaluates the current `crip-crumbs` codebase against the requirements of a **Low-Tech, Offline-Capable Fast Food POS System**.

---

## 1. Existing System Architecture Strengths

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **Database Schema** | Excellent | Multi-org, multi-branch, Till sessions, Shift templates, Deals, Tax & Loyalty configuration in Prisma schema. |
| **Offline Sync Engine** | Partial / Scaffolded | `frontend/src/sync/` contains IndexedDB queue (`db.ts`, `queue.ts`) for storing pending requests. |
| **Cashier Keyboard Flow** | Good | Function key shortcuts (`F1` to `F7`) mapped in `POSPage.tsx`. |
| **Security & Auditing** | High | bcrypt PIN hashing, JWT authentication, operation audit logs (`OperationAuditLog`). |

---

## 2. Critical Gaps for Target Fast Food Merchants

### Gap 1: Deployment Complexity (Docker & PostgreSQL Requirement)
- **Current Setup**: `docker-compose.yml` running `postgres:16-alpine`, `backend` (Node/Express), and `frontend` (Nginx).
- **Merchant Impact**: Target merchants (low-literacy, non-technical) cannot manage Docker, set environment variables, or resolve PostgreSQL connection errors.
- **Solution Needed**: Build an **Electron or Tauri Standalone Desktop App** with embedded SQLite or IndexedDB, enabling single-click installation on Windows/Android without Docker.

### Gap 2: Fast Food Item Customization (Modifiers & Combos)
- **Current Setup**: Products and Deals exist, but there is no 1-tap item modifier modal (e.g., Spicy level, "No Mayo", "Extra Cheese") or combo upsell bar.
- **Merchant Impact**: Cashiers must manually explain variations or type custom notes, slowing transaction speed during rush hours.
- **Solution Needed**: Add a 1-tap **Fast Food Modifier Modal** and a bottom-bar **"Make it a Meal" (+ $2.50)** shortcut.

### Gap 3: Low-Literacy Cash Tendering & Visual Change Counter
- **Current Setup**: Standard checkout modal requires entering custom numeric values.
- **Merchant Impact**: Cashiers with low arithmetic/reading skills struggle to calculate change quickly.
- **Solution Needed**: Include **Large Currency Preset Tenders** (`$5`, `$10`, `$20`, `$50`, `$100`, `EXACT CASH`) and a **Huge High-Contrast Green Change Display Box** (`GIVE CHANGE: $12.50`).

### Gap 4: Local ESC/POS Thermal Kitchen Printing
- **Current Setup**: Invoices sent to backend server via HTTP REST calls.
- **Merchant Impact**: If internet is down or local server is disconnected, kitchen tickets cannot print.
- **Solution Needed**: Add direct client-side ESC/POS printing over USB/Serial or local LAN Wi-Fi so kitchen tickets print instantly offline.

---

## 3. High-Priority Action Items

1. **Implement Fast Food Quick-Tender & Visual Change Component** in `frontend/src/components/pos/`.
2. **Add Fast Food Modifier Modal** for 1-tap custom orders.
3. **Enhance Offline Storage Engine** (`frontend/src/sync/`) to cache the full product catalog and offline order history in IndexedDB.
4. **Create Tauri / Electron Packaging Configuration** for 1-click Windows desktop installation.
