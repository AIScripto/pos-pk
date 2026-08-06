# Windows Client Installation Guide (No Source Code Needed)

Step-by-step guide for deploying and running the **AIPOS (Crip Crumbs)** application on a **fresh Windows client machine** using **only Docker Desktop and `docker-compose.yml`**.

> 🔒 **Zero Source Code Exposure**: The client machine only needs Docker Desktop and a single configuration file (`docker-compose.yml`). No source code, Node.js, or Git repositories are required on the client machine.

---

## 📋 Prerequisites

Ensure the client Windows machine meets the following requirements:
- **Windows 10 64-bit** (Home/Pro/Enterprise v2004+) or **Windows 11**
- **Hardware Virtualization** enabled in BIOS/UEFI (Intel VT-x / AMD-V)
- At least 8 GB RAM (16 GB recommended)
- Minimum 10 GB free disk space

---

## 🚀 Step-by-Step Installation

### Step 1: Install WSL 2 & Docker Desktop

1. **Open PowerShell as Administrator**:
   - Press `Win + X` and select **Terminal (Admin)** or **Windows PowerShell (Admin)**.

2. **Enable WSL 2** (if not already enabled):
   ```powershell
   wsl --install
   ```
   *(Restart your computer if prompted by Windows).*

3. **Download & Install Docker Desktop**:
   - Download installer from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).
   - Run `Docker Desktop Installer.exe`.
   - Ensure **"Use WSL 2 instead of Hyper-V"** is checked.
   - Restart PC if requested.

4. **Start Docker Desktop**:
   - Open **Docker Desktop** from the Start Menu.
   - Wait until the engine status at bottom-left shows **"Engine running"** (green icon).

---

### Step 2: Set Up Project Folder (No Code Cloning Required)

1. Create a clean folder on the client machine (e.g., `C:\AIPOS`):
   - Open **Command Prompt** or **PowerShell**:
     ```cmd
     mkdir C:\AIPOS
     cd C:\AIPOS
     ```

2. Place the `docker-compose.yml` file into `C:\AIPOS`:
   
   Create `docker-compose.yml` using Notepad or PowerShell:

   ```yaml
   version: '3.8'

   services:
     backend:
       image: tariqsulehri/aipos-be:latest
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

     frontend:
       image: tariqsulehri/aipos-fe:latest
       ports:
         - "5000:80"
       depends_on:
         - backend
       restart: unless-stopped
       networks:
         - aipos-network

     db:
       image: postgres:16-alpine
       environment:
         - POSTGRES_USER=postgres
         - POSTGRES_PASSWORD=postgres
         - POSTGRES_DB=crip_crumbs
       volumes:
         - postgres_data:/var/lib/postgresql/data
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

### Step 3: Run the Application

In Command Prompt / PowerShell inside `C:\AIPOS`, run:

```cmd
docker compose up -d
```

Docker will automatically pull the pre-compiled images directly from Docker Hub:
- `tariqsulehri/aipos-be:latest` (Backend API)
- `tariqsulehri/aipos-fe:latest` (Frontend Nginx App)
- `postgres:16-alpine` (Database)

---

### Step 4: Access Application & Verify

Check container status:
```cmd
docker compose ps
```

Open the application in any web browser:
- **Frontend App**: [http://localhost:5000](http://localhost:5000)
- **Backend API**: [http://localhost:3500](http://localhost:3500)

---

## 🔄 How to Update Client Application to Latest Version

When updated container images are pushed to Docker Hub, the client machine can update with 2 simple commands:

```cmd
cd C:\AIPOS
docker compose pull
docker compose up -d
```

---

## 🛑 Useful Client Commands

```cmd
# Check status of containers
docker compose ps

# View live application logs
docker compose logs -f

# Stop application
docker compose down

# Restart application
docker compose restart
```
