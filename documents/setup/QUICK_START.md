# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

## Setup

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment
Both `.env` files are already configured:
- `backend/.env` — Database URL, JWT secrets, port 3500
- `frontend/.env` — API URL `http://localhost:3500/api`

### 3. Database Setup
```bash
cd backend

# Push schema to database
npx prisma db push

# Seed with demo data
npx prisma db seed
```

## Running the App

### Option 1: Two Terminals (Recommended)

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# Output: 🍔 Crip Crumbs POS server running on :3500
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
# Output: ➜ Local: http://localhost:5173
```

### Option 2: Using .claude/launch.json
```bash
# Start both servers (if using Claude Code)
# Server names: "frontend" and "backend"
```

## Accessing the App

### POS System
- **URL**: http://localhost:5173
- **Login**: PIN `1234` → Select branch → Select till → Enter PIN
- **Features**: Create invoices, manage inventory, handle customers, tables, held orders

### Admin Panel
- **URL**: http://localhost:5173/admin/login
- **Login**: Email & password (check `backend/prisma/seed.ts` for credentials)
- **Features**: Manage products, users, branches, configuration

## Architecture Overview

```
FRONTEND (React + Vite on 5173)
    ↓
API (http://localhost:3500/api)
    ↓
BACKEND (Express on 3500)
    ├─ /api/auth/*         → Shared authentication
    ├─ /api/*              → POS module (invoices, inventory, till, customers, tables, held-orders)
    └─ /api/admin/*        → Admin module (products, config)
    ↓
DATABASE (PostgreSQL)
```

## Key Folders

```
project-root/
├── frontend/              # React app (port 5173)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx       # POS login
│   │   │   ├── POSPage.tsx         # Main POS interface
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.tsx
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminProducts.tsx
│   │   │       ├── AdminConfig.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── AdminBranches.tsx
│   │   │       └── AdminReports.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Global auth state
│   │   └── lib/api/
│   │       └── auth.api.ts         # Auth endpoints
│   └── vite.config.ts
│
└── backend/               # Express server (port 3500)
    ├── src/
    │   ├── shared/                 # Shared code
    │   │   ├── lib/
    │   │   │   ├── prisma.ts       # Database client
    │   │   │   └── response.ts     # Response helpers
    │   │   ├── middleware/
    │   │   │   ├── auth.middleware.ts
    │   │   │   └── error.middleware.ts
    │   │   ├── routes/
    │   │   │   └── auth.routes.ts
    │   │   └── utils/
    │   │       └── bigint.ts       # BigInt helpers
    │   ├── modules/
    │   │   ├── pos/                # POS module
    │   │   │   ├── controllers/
    │   │   │   ├── services/
    │   │   │   └── routes/
    │   │   └── admin/              # Admin module
    │   │       ├── controllers/
    │   │       └── routes/
    │   ├── config/
    │   │   └── env.ts              # Environment config
    │   └── index.ts                # Server entry point
    ├── prisma/
    │   ├── schema.prisma           # Database schema
    │   └── seed.ts                 # Demo data
    └── .env
```

## Common Commands

### Backend
```bash
cd backend

# Development
npm run dev

# Build
npm run build

# Production
npm start

# Database
npx prisma studio          # Visual database explorer
npx prisma db push         # Sync schema to database
npx prisma db seed         # Populate demo data
npx prisma migrate reset   # Reset database
```

### Frontend
```bash
cd frontend

# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Type check
npm run type-check
```

## Troubleshooting

### Backend won't start
```bash
# Check if port 3500 is in use
lsof -i :3500

# Kill the process if needed
kill -9 <PID>

# Restart
npm run dev
```

### Frontend can't connect to backend
```bash
# Check .env
cat frontend/.env
# Should have: VITE_API_URL=http://localhost:3500/api

# Verify backend is running
curl http://localhost:3500/health
# Should return: {"status":"ok","ts":"2026-03-20T..."}
```

### Database connection failed
```bash
# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Test connection
npx prisma db pull

# Reset if needed
npx prisma db push --force-reset
npx prisma db seed
```

### TypeScript compilation errors
```bash
# Usually due to missing node_modules
cd backend && npm install
cd frontend && npm install
```

## Current Status

✅ **Complete**
- Modular backend architecture (POS + Admin modules)
- Frontend admin routes and layout
- Authentication (both POS PIN and Admin email+password)
- Database with BigInt IDs
- Role-based access control

⏳ **In Progress**
- BigInt conversion in backend services (fixes TypeScript compilation)

⏭ **Next Steps**
1. Fix BigInt conversions in backend services
2. Implement Admin API endpoints (products, users, branches, config)
3. Connect frontend to admin API
4. Add detailed configuration forms
5. Reports and analytics

## Support

- Check `IMPLEMENTATION_STATUS.md` for detailed progress
- Check `MODULAR_BACKEND_SETUP.md` for architecture details
- Check `BACKEND_ARCHITECTURE.md` for design decisions

---

**Happy coding!** 🍔
