# Crip & Crumbs POS — Backend

Express + TypeScript + PostgreSQL backend for the Point of Sale system.

## Setup

```bash
cd backend
npm install
```

## Database

Ensure PostgreSQL is running and `.env` has valid `DATABASE_URL`:

```
DATABASE_URL=postgresql://postgres@localhost:5432/crip_crumbs
```

### Initialize Database

```bash
npx prisma db push
```

### Seed Database

```bash
npx prisma db seed
```

## Development

```bash
npm run dev
```

Backend runs on `http://localhost:3500` (configured in `SERVER_PORT` env var).

## Configuration

Edit `backend/.env`:
```
NODE_ENV=development
SERVER_PORT=3500
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres@localhost:5432/crip_crumbs
JWT_SECRET=crip-crumbs-dev-jwt-secret-change-in-production
JWT_EXPIRES_IN=12h
```

## Build & Run

```bash
npm run build
npm start
```

## API

Docs: See routes in `src/routes/`
- `GET /api/auth/branches` — List branches (public)
- `GET /api/auth/terminals?branchId=...` — List terminals for branch (public)
- `POST /api/auth/login` — Email/password login
- `POST /api/auth/pin` — PIN login
- ... and more

## Notes

- **No shared libraries** — all types are in `src/shared/types/`
- **Standalone project** — can be deployed independently
- **Frontend-agnostic** — serves any frontend via CORS
