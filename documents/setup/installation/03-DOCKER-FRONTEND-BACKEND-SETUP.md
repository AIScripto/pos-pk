# 03 - Docker Configuration & Container Orchestration Guide

This guide details how to configure, build, run, and manage the **Frontend**, **Backend**, and **PostgreSQL** containers for the **AIPos / Crip-Crumbs** application using Docker and Docker Compose.

---

## Table of Contents
1. [Container Architecture Overview](#1-container-architecture-overview)
2. [Backend Container Setup (`tariqsulehri/aipos-be`)](#2-backend-container-setup-tariqsulehriaipos-be)
3. [Frontend Container Setup (`tariqsulehri/aipos-fe`)](#3-frontend-container-setup-tariqsulehriaipos-fe)
4. [Docker Compose Stack Configuration](#4-docker-compose-stack-configuration)
5. [Step-by-Step Deployment Guide](#5-step-by-step-deployment-guide)
6. [Building Local vs. Pulling Docker Hub Images](#6-building-local-vs-pulling-docker-hub-images)
7. [Publishing Images to Docker Hub](#7-publishing-images-to-docker-hub)
8. [Useful Container Operations & Commands](#8-useful-container-operations--commands)
9. [Troubleshooting & Common Issues](#9-troubleshooting--common-issues)

---

## 1. Container Architecture Overview

The system consists of three main containers connected via an isolated internal bridge network named `aipos-network`:

```
+-----------------------------------------------------------------------------------+
|                                 HOST SYSTEM                                       |
|                                                                                   |
|  [ Browser ] -------------> Port 5000 (Host)                                      |
|                                  |                                                |
|                                  v                                                |
|  +-----------------------------------------------------------------------------+  |
|  | DOCKER NETWORK: aipos-network                                               |  |
|  |                                                                             |  |
|  |   +---------------------------------+                                       |  |
|  |   | frontend (Nginx Container)      |                                       |  |
|  |   | Port 80 (Internal)              |                                       |  |
|  |   +---------------------------------+                                       |  |
|  |                                                                             |  |
|  |   +---------------------------------+        +--------------------------+   |  |
|  |   | backend (Express / Prisma API)  | -----> | db (PostgreSQL 16)      |   |  |
|  |   | Port 3500 (Host & Internal)     |        | Port 5432 (Internal)     |   |  |
|  |   +---------------------------------+        +--------------------------+   |  |
|  |                                                           |                 |  |
|  +-----------------------------------------------------------|-----------------+  |
|                                                              v                    |
|                                                    [ Named Volume: postgres_data ]|
+-----------------------------------------------------------------------------------+
```

---

## 2. Backend Container Setup (`tariqsulehri/aipos-be`)

The backend container bundles the Express REST API, Prisma ORM, OpenSSL runtime, entrypoint migration runner, and uploaded asset storage.

### Multi-Stage `backend/Dockerfile`
- **Build Stage**: Installs development dependencies, compiles TypeScript code into `/dist`, and generates the Prisma client.
- **Runtime Stage**: Copies compiled JavaScript (`/dist`), production `node_modules`, `prisma/` schema, and `entrypoint.sh` onto a minimal `node:22-slim` image.

### Entrypoint Script (`backend/entrypoint.sh`)
When the container starts, `entrypoint.sh` executes the following sequence automatically:
1. Generates a fallback `JWT_SECRET` if one was not supplied in environment variables.
2. Runs `npx prisma migrate deploy` to ensure database tables are up to date.
3. Executes `node dist/seed.js` to populate default initial data.
4. Starts the API server using `exec node dist/index.js`.

### Key Environment Variables

| Variable | Recommended Docker Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `3500` | Port Express listens on inside the container |
| `DATABASE_URL` | `postgresql://postgres:postgres@db:5432/crip_crumbs` | DB connection string using service name `db` |
| `CLIENT_URL` | `http://localhost:5000` | Frontend public origin |
| `CORS_ORIGINS` | `http://localhost:5000,http://localhost:8080` | Allowed origins for API requests |
| `JWT_SECRET` | *(Random 32-byte string)* | Secret for signing JWT authentication tokens |

---

## 3. Frontend Container Setup (`tariqsulehri/aipos-fe`)

The frontend container serves the static React + Vite POS Web Application using Nginx.

### Multi-Stage `frontend/Dockerfile`
- **Build Stage**: Installs Node dependencies, injects `VITE_API_URL`, and compiles static HTML/JS/CSS assets with `npm run build`.
- **Runtime Stage**: Copies compiled output (`/dist`) into Nginx's HTML root `/usr/share/nginx/html` using `nginx:1.27-alpine`.

### Custom Nginx Configuration (`frontend/nginx.conf`)
Ensures single-page application (SPA) routing fallbacks work correctly (preventing 404 errors on page refresh):

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 4. Docker Compose Stack Configuration

The root [`docker-compose.yml`](file:///Users/tk-lpt-1088/development/react/crip-crumbs/docker-compose.yml) orchestrates all 3 services:

```yaml
version: '3.8'

services:
  # Express API Container
  backend:
    image: tariqsulehri/aipos-be:latest
    # To build locally instead of pulling image, uncomment build block:
    # build: ./backend
    ports:
      - "3500:3500"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/crip_crumbs
      - CLIENT_URL=http://localhost:5000
      - CORS_ORIGINS=http://localhost:5000,http://localhost:8080
      - JWT_SECRET=PIwJowmhmWZC4QJmAjZFocyFpVpA6usBXs1BmgnjNQw=
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - aipos-network

  # Nginx Web Frontend Container
  frontend:
    image: tariqsulehri/aipos-fe:latest
    # To build locally instead of pulling image, uncomment build block:
    # build: ./frontend
    ports:
      - "5000:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - aipos-network

  # PostgreSQL 16 Database Container
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=crip_crumbs
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - aipos-network

volumes:
  postgres_data:

networks:
  aipos-network:
    driver: bridge
```

---

## 5. Step-by-Step Deployment Guide

Follow these simple steps to launch the complete application stack on any machine with Docker installed:

### Step 5.1: Clone Repository & Navigate to Workspace
```bash
git clone https://github.com/tariqsulehri/AIPos.git
cd AIPos # or crip-crumbs
```

### Step 5.2: Start Docker Compose Stack
Launch all services in detached (background) mode:
```bash
docker compose up -d
```

### Step 5.3: Monitor Service Startup
```bash
# View active container status
docker compose ps

# Follow live container logs
docker compose logs -f
```

### Step 5.4: Access Applications in Browser
- **Frontend POS Web App**: Open [http://localhost:5000](http://localhost:5000)
- **Backend API Health Check**: Open [http://localhost:3500/api/v1/health](http://localhost:3500/api/v1/health) (or `http://localhost:3500`)
- **PostgreSQL Database**: Reachable on `localhost:5432` with user `postgres` and password `postgres`.

---

## 6. Building Local vs. Pulling Docker Hub Images

### Option A: Using Pre-Built Docker Hub Images (Production Default)
`docker-compose.yml` is configured by default to pull published Docker images (`tariqsulehri/aipos-be:latest` and `tariqsulehri/aipos-fe:latest`).

Simply run:
```bash
docker compose pull
docker compose up -d
```

### Option B: Building Images from Local Source Code
If you are developing locally and want Docker Compose to build your current code modifications:

1. Edit `docker-compose.yml` to replace `image:` tags with `build:` contexts:

```yaml
  backend:
    build: ./backend
    ports:
      - "3500:3500"
    ...

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:3500/api/v1
    ports:
      - "5000:80"
    ...
```

2. Run docker compose build:
```bash
docker compose up -d --build
```

---

## 7. Publishing Images to Docker Hub

To push updated frontend and backend images to Docker Hub registry (`tariqsulehri` namespace):

### Step 7.1: Authenticate with Docker Hub
```bash
docker login
```

### Step 7.2: Build Docker Images Locally
```bash
# Build Backend Image
docker build -t tariqsulehri/aipos-be:latest ./backend

# Build Frontend Image (passing VITE_API_URL build argument)
docker build --build-arg VITE_API_URL=http://localhost:3500/api/v1 -t tariqsulehri/aipos-fe:latest ./frontend
```

### Step 7.3: Push Images to Docker Hub
```bash
docker push tariqsulehri/aipos-be:latest
docker push tariqsulehri/aipos-fe:latest
```

---

## 8. Useful Container Operations & Commands

| Action | Command |
| :--- | :--- |
| **Start Stack** | `docker compose up -d` |
| **Stop Stack** | `docker compose stop` |
| **Shutdown & Remove Containers** | `docker compose down` |
| **Shutdown & Destroy Volumes** | `docker compose down -v` |
| **View Live Logs** | `docker compose logs -f` |
| **View Specific Service Logs** | `docker compose logs -f backend` |
| **Restart Backend Container** | `docker compose restart backend` |
| **Execute Shell in Backend** | `docker exec -it crip-crumbs-backend-1 sh` |
| **Execute Shell in Database** | `docker exec -it crip-crumbs-db-1 psql -U postgres` |

---

## 9. Troubleshooting & Common Issues

### Issue 1: Backend container fails with `P1001: Can't reach database server`
- **Cause**: The `DATABASE_URL` uses `localhost` instead of the Docker service name `db`.
- **Fix**: Verify `DATABASE_URL` in `docker-compose.yml` is set to `postgresql://postgres:postgres@db:5432/crip_crumbs`.

### Issue 2: Frontend displays CORS or Network Errors when calling API
- **Cause**: Browser calls `http://backend:3500` (which is an internal container name unreachable by the browser).
- **Fix**: Ensure `VITE_API_URL` is set to `http://localhost:3500/api/v1` (or your public server IP) during frontend image build, and `CORS_ORIGINS` includes `http://localhost:5000`.

### Issue 3: Nginx returns 404 when refreshing sub-pages (e.g. `/pos`, `/admin`)
- **Cause**: Nginx lacks SPA fallback directive.
- **Fix**: Verify `frontend/nginx.conf` contains `try_files $uri $uri/ /index.html;`.

---

## Complete Setup Summary
You have now configured and documented the full deployment workflow:
1. [01-PREPARE-NEW-MACHINE-LINUX.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/installation/01-PREPARE-NEW-MACHINE-LINUX.md): System & tools setup.
2. [02-INSTALL-POSTGRES-DATABASE.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/database/02-INSTALL-POSTGRES-DATABASE.md): PostgreSQL native & docker database setup.
3. [03-DOCKER-FRONTEND-BACKEND-SETUP.md](file:///Users/tk-lpt-1088/development/react/crip-crumbs/documents/setup/installation/03-DOCKER-FRONTEND-BACKEND-SETUP.md): Containerized stack orchestration.
