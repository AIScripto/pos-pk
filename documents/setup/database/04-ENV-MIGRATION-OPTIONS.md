# 04 - Database Migrations with Custom Environment Files Guide

This document outlines the best options and step-by-step methods for running Prisma database migrations against custom-named environment files (e.g., `.env.crispcrumbs`, `.env.client2`) for specific clients or environments.

---

## Table of Contents
1. [Option 1: Single-Line Command via `dotenv-cli` (Recommended)](#1-option-1-single-line-command-via-dotenv-cli-recommended)
2. [Option 2: Symbolic Link `.env` in Client Folder (Best for VM Deployments)](#2-option-2-symbolic-link-env-in-client-folder-best-for-vm-deployments)
3. [Option 3: Direct Inline `DATABASE_URL` Variable](#3-option-3-direct-inline-database_url-variable)
4. [Summary & Usage Checklist](#4-summary--usage-checklist)

---

## 1. Option 1: Single-Line Command via `dotenv-cli` (Recommended)

This is the primary and fastest method to execute Prisma migrations using a specific client environment file in a single terminal line without creating temporary files or symlinks.

### Execution Command

Navigate to the `backend/` directory and run:

```bash
cd backend
npx dotenv-cli -e .env.crispcrumbs -- npx prisma migrate deploy
```

### Checking Migration Status
To check pending migrations for a client before applying them:

```bash
npx dotenv-cli -e .env.crispcrumbs -- npx prisma migrate status
```

### How It Works:
- `npx dotenv-cli -e .env.crispcrumbs`: Loads all variables from `.env.crispcrumbs` into the process environment.
- `-- npx prisma migrate deploy`: Executes Prisma migration using the loaded target database credentials (`168.62.16.59:5432/crispcrumbs`).

---

## 2. Option 2: Symbolic Link `.env` in Client Folder (Best for VM Deployments)

When deploying on a Virtual Machine (VM) where each client has a dedicated folder (e.g., `/opt/clients/crispcrumbs/`), creating a symbolic link named `.env` pointing to `.env.crispcrumbs` ensures all standard tools work out of the box without extra CLI flags.

### Setup Steps

```bash
cd /opt/clients/crispcrumbs/backend

# Create symbolic link (.env -> .env.crispcrumbs)
ln -sf .env.crispcrumbs .env

# Run standard Prisma migration command
npx prisma migrate deploy
```

### Advantages:
- Standard commands (`npx prisma migrate deploy`, `npm start`, `docker compose up`) automatically read `.env.crispcrumbs`.

---

## 3. Option 3: Direct Inline `DATABASE_URL` Variable

You can pass the URL-encoded PostgreSQL connection string inline directly to the command:

### Execution Command

```bash
cd backend
DATABASE_URL="postgresql://appuser:%23786Allahis1@168.62.16.59:5432/crispcrumbs" npx prisma migrate deploy
```

### Advantages:
- Works on any machine without installing extra CLI packages or modifying `.env` files.

---

## 4. Summary & Usage Checklist

| Method | Command / Procedure | Best Used For |
| :--- | :--- | :--- |
| **Option 1 (`dotenv-cli`)** | `npx dotenv-cli -e .env.crispcrumbs -- npx prisma migrate deploy` | **One-line CLI execution from local or CI/CD terminal** |
| **Option 2 (Symlink)** | `ln -sf .env.crispcrumbs .env && npx prisma migrate deploy` | **Permanent VM client directory setup** |
| **Option 3 (Inline URI)** | `DATABASE_URL="..." npx prisma migrate deploy` | **Quick ad-hoc database updates** |
