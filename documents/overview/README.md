# Crip & Crumbs POS

**Point of Sale System** — Multi-till POS with separate frontend and backend.

## Project Structure

This is a monorepo that has been refactored into two **completely independent projects**:

```
.claude/worktrees/
└── hungry-lamarr/              (Active branch with separated projects)
    ├── frontend/               React frontend (port 5173)
    ├── backend/                Express API (port 3500)
    ├── PROJECTS.md             Architecture documentation
    └── README.md               Project setup guide
```

## Quick Start

All work is in the `hungry-lamarr` worktree. Navigate there first:

```bash
cd .claude/worktrees/hungry-lamarr
```

Then follow the setup in that folder's README.md.

## Key Features

✅ **Multi-till POS** — Each terminal scoped to its own invoices
✅ **PIN-based login** — Cashier authentication
✅ **Branch selector** — Dynamically loaded from backend
✅ **Terminal selector** — Auto-loaded by branch
✅ **Hold orders** — Branch-shared across tills
✅ **Till management** — Open/close with cash reconciliation
✅ **Separated stack** — Frontend and backend are independent

## Technologies

**Frontend:**
- React 18 + TypeScript
- Vite (hot module reloading)
- Tailwind CSS
- shadcn-ui components

**Backend:**
- Express.js + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication
- CORS-enabled for multiple origins

## Deployment

Both projects can be deployed independently:

- **Frontend**: Deploy `frontend/dist/` to Vercel, Netlify, AWS S3
- **Backend**: Deploy `backend/` to Railway, Heroku, AWS Lambda, ECS

## Documentation

- **PROJECTS.md** — Complete architecture & separation guide
- **frontend/README.md** — Frontend setup & deployment
- **backend/README.md** — Backend setup & database

See the worktree folder for full documentation.
