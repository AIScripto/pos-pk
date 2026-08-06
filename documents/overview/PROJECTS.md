# Crip & Crumbs POS — Separated Projects

This repo now contains **completely independent frontend and backend projects** with no shared libraries.

## Project Structure

```
.
├── frontend/          # React frontend (port 5173)
│   ├── src/
│   ├── src/shared/    # Local type definitions (copied from shared)
│   ├── .env           # Frontend env vars
│   ├── package.json   # Frontend dependencies
│   └── README.md      # Frontend setup guide
│
├── backend/           # Express backend (port 3500)
│   ├── src/
│   ├── src/shared/    # Local type definitions (copied from shared)
│   ├── prisma/        # Database schema
│   ├── .env           # Backend env vars
│   ├── package.json   # Backend dependencies
│   └── README.md      # Backend setup guide
```

## Running Both Projects

### Terminal 1 — Backend

```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
# Runs on http://localhost:3500
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Access the App

Open browser: `http://localhost:5173`

Backend API: `http://localhost:3500/api`

## Key Differences from Monorepo

| Aspect | Before | After |
|--------|--------|-------|
| Structure | Monorepo with `/client`, `/server`, `/packages/shared` | Two independent projects |
| Shared Types | Via npm workspace link | Copied to each project |
| Deployment | Both from same repo | Independently deployable |
| Dependencies | Shared in monorepo `node_modules` | Separate per project |
| Backend Port | 3001 | **3500** |
| Frontend Port | 5173 | 5173 |
| API Base URL | Configured in code | Via env vars |

## Development

### Adding a New Type

If you need to add a type (e.g., `src/shared/types/my-type.ts`):

1. **Frontend**: Add to `frontend/src/shared/types/`
2. **Backend**: Add to `backend/src/shared/types/`

Both projects use path alias `@shared/*` → `./src/shared/*`

### API Changes

When API changes:
- Update backend in `backend/src/`
- Update frontend API client in `frontend/src/lib/api/`
- Update shared types in both projects

### Environment Variables

Each project has its own `.env` file:
- **Frontend** (`frontend/.env`): `VITE_API_URL` (backend URL)
- **Backend** (`backend/.env`): `SERVER_PORT`, `DATABASE_URL`, `JWT_SECRET`

## Deployment

### Frontend
- Build: `cd frontend && npm run build`
- Output: `frontend/dist/`
- Deploy to: Vercel, Netlify, AWS S3, etc.
- Set `VITE_API_URL` to your production backend URL

### Backend
- Build: `cd backend && npm run build`
- Output: `backend/dist/`
- Deploy to: Heroku, Railway, AWS Lambda, ECS, etc.
- Set env vars: `DATABASE_URL`, `JWT_SECRET`, `SERVER_PORT`, etc.

## Troubleshooting

**Frontend can't reach backend?**
- Check `frontend/.env` has correct `VITE_API_URL`
- Ensure backend is running on that port
- Check CORS headers in backend logs

**Database not found?**
- Verify `DATABASE_URL` in `backend/.env`
- Run `cd backend && npx prisma db push`

**Types missing?**
- Check if type file exists in `src/shared/types/` in both projects
- Import as `import type { MyType } from '@shared/types/my-type'`
