# Crip & Crumbs POS — Frontend

React + TypeScript + Vite frontend for the Point of Sale system.

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (default Vite port).

## Configure Backend URL

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3500
```

(Must match the backend server port)

## Build

```bash
npm run build
npm run preview
```

## Notes

- **No shared libraries** — all types are in `src/shared/types/`
- **Standalone project** — can be deployed independently
- **Backend URL** — configurable via `VITE_API_URL` env var
