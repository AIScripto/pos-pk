# Docker Container Operations & Maintenance Guide

This document provides a reference guide for managing, restarting, inspecting, and troubleshooting Docker containers for **AIPos / Crisp & Crumbs** across local and VM environments.

---

## Table of Contents
1. [Container Restart Commands](#1-container-restart-commands)
2. [Reloading Environment Variables (`.env`)](#2-reloading-environment-variables-env)
3. [Inspecting Container Logs & Crash Diagnostics](#3-inspecting-container-logs--crash-diagnostics)
4. [Container Status & Health Checks](#4-container-status--health-checks)
5. [Azure VM Firewall & Port Commands](#5-azure-vm-firewall--port-commands)
6. [Automated Container Updates & Image Pruning](#6-automated-container-updates--image-pruning)

---

## 1. Container Restart Commands

Execute these commands inside your client deployment directory (e.g. `/deployments/fastfood/crispcrumbs`):

### Restart All Containers in Client Directory
```bash
docker compose restart
```

### Restart Only the Backend API Container
```bash
docker compose restart backend
# or by container name:
docker restart crispcrumbs-backend
```

### Restart Only the Frontend Web Container
```bash
docker compose restart frontend
# or by container name:
docker restart crispcrumbs-frontend
```

---

## 2. Reloading Environment Variables (`.env`)

> ⚠️ **Important**: A simple `docker compose restart` does **NOT** reload updated environment variables or `.env` changes. 

To force Docker to rebuild container parameters and reload `.env` changes:

```bash
docker compose up -d --force-recreate
```

Or stop completely and bring up:
```bash
docker compose down
docker compose up -d
```

---

## 3. Inspecting Container Logs & Crash Diagnostics

When a container enters a `Restarting` loop or crashes on startup:

### View Live Logs for All Services
```bash
docker compose logs -f
```

### View Live Logs for Backend Only
```bash
docker compose logs -f backend
# or via Docker CLI:
docker logs crispcrumbs-backend --tail 50 -f
```

### View Live Logs for Frontend Only
```bash
docker logs crispcrumbs-frontend --tail 50 -f
```

---

## 4. Container Status & Health Checks

### List Active Containers and Port Mappings
```bash
docker compose ps
```

### Execute Shell inside Backend Container
```bash
docker exec -it crispcrumbs-backend sh
```

---

## 5. Azure VM Firewall & Port Commands

### Ubuntu OS Firewall (UFW)
```bash
# Allow Crisp & Crumbs Frontend (3001) & Backend (4001)
sudo ufw allow 3001/tcp comment 'CrispCrumbs Frontend'
sudo ufw allow 4001/tcp comment 'CrispCrumbs Backend'

# Reload & verify UFW
sudo ufw reload
sudo ufw status verbose
```

---

## 6. Automated Container Updates & Image Pruning

To update Docker images from Docker Hub, apply schema migrations, recreate containers, and purge old images from disk:

```bash
cd /deployments/fastfood/crispcrumbs
./update.sh
```
