# Crisp & Crumbs — Client Credentials & Environment Reference

This document stores the credentials, connection parameters, and access URLs for client **Crisp & Crumbs** (`crispcrumbs`).

---

## 1. Client Metadata & Server Information

| Property | Value |
| :--- | :--- |
| **Client Name** | Crisp & Crumbs (`aipos`) |
| **Category / Industry** | Fast Food |
| **VM Server IP** | `168.62.16.59` |
| **VM Deployment Folder** | `/deployments/fastfood/aipos` |

---

## 2. Web Portal & API Access URLs

| Service | Port | URL |
| :--- | :--- | :--- |
| **POS Web Application Portal** | **`3001`** | [http://168.62.16.59:3001](http://168.62.16.59:3001) |
| **Backend Express API** | **`4001`** | [http://168.62.16.59:4999](http://168.62.16.59:4999) |
| **Backend Health Check** | **`4001`** | [http://168.62.16.59:4999/api/v1/health](http://168.62.16.59:4999/api/v1/health) |

---

## 3. Application User Credentials

### Super Admin (Platform Engineering Access)
- **Username**: `superadmin`
- **Email**: `superadmin@aipos.com`
- **Default Password**: `@!786Allahis1!#`
- **Default PIN**: `7860`
- **Role**: System Super Admin

### Store Admin (Client Manager Access)
- **Username**: `admin`
- **Email**: `admin@aipos.com`
- **Default Password**: `#admin@!`
- **Default PIN**: `1234`
- **Role**: Client Store Administrator

---

## 4. PostgreSQL Database Credentials

| Property | Value |
| :--- | :--- |
| **DB Host (Host OS)** | `168.62.16.59` |
| **DB Host (Container Internal)** | `host.docker.internal` |
| **DB Port** | `5432` |
| **Database Name** | `aipos` |
| **Database User** | `appuser` |
| **Database Password** | `#786Allahis1` |
| **Full Connection URI** | `postgresql://appuser:%23786Allahis1@host.docker.internal:5432/aipos` |

---

## 5. Security & Authentication Keys

| Key | Value |
| :--- | :--- |
| **JWT Secret** | `aipos-prod-jwt-secret-key-change-in-prod` |
| **JWT Expiration** | `12h` |
