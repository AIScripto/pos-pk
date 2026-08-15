# Local POS Installation Guide (Backend & Frontend)

This guide provides step-by-step instructions for installing, configuring, and running the **POS Backend** and **POS Frontend** on a local machine (Windows / Mac / Linux desktop or laptop).

---

## 📋 Prerequisites

Before starting, ensure the local machine has the following software installed:

1. **Node.js**: Version `18.x` or `20.x` LTS (Download from [nodejs.org](https://nodejs.org/))
2. **npm**: Included with Node.js (`v9.x` or higher)
3. **Git**: Optional (for cloning the repository)

Verify installation in Terminal / Command Prompt:
```bash
node -v   # Should print v18.x or v20.x
npm -v    # Should print 9.x or 10.x
```

---

## 🚀 Part 1: Backend Installation & Setup

The backend handles database transactions, inventory, shift sessions, and printer integrations.

### Step 1: Navigate to Backend Directory
Open Terminal / Command Prompt:
```bash
cd backend
```

### Step 2: Install Node.js Dependencies
Run npm install to download all required packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy or create the `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```
*(If `.env.example` does not exist, create `.env` with the following minimum variables)*:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_pos_key_2026

# Database Connection (SQLite Local DB)
DATABASE_URL="file:./pos_local.db"
```

### Step 4: Run Database Migrations & Seed Data
Generate Prisma client and setup the local SQLite database schema:
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Run Database Migrations
npx prisma migrate dev --name init

# 3. Seed Initial Demo Store Data (Products, Categories, Users)
npm run db:seed
```

### Step 5: Start the Backend Server
Start the backend server in development mode:
```bash
npm run dev
```
- **Success Signal**: You will see `Server running on http://localhost:5000`

---

## 🎨 Part 2: Frontend Installation & Setup

The frontend provides the touch UI, shopping cart, cashier payment modal, and shift controls.

### Step 1: Open a NEW Terminal Window & Navigate to Frontend
```bash
cd frontend
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Configure Frontend Environment Variables
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CURRENCY_SYMBOL=Rs.
VITE_CURRENCY_CODE=PKR
```

### Step 4: Start the Frontend Development Server
```bash
npm run dev
```
- **Success Signal**: Vite will start and display a local URL:  
  `➜  Local:   http://localhost:5173/`

---

## 💻 Part 3: Accessing the POS Application

1. Open your Web Browser (Google Chrome / Microsoft Edge / Brave).
2. Go to **`http://localhost:5173`**.
3. Log in using the default cashier credentials:
   - **Username / Email**: `cashier` or `cashier@pos.local`
   - **Password**: `password123`
4. Enter starting cash drawer balance (e.g. `2000`) and tap **Start Shift** to start billing!

---

## 📦 Part 4: Production Desktop Build (Single Machine Offline Deployment)

To build optimized production assets for a standalone store PC:

### 1. Build Backend
```bash
cd backend
npm run build
```

### 2. Build Frontend
```bash
cd frontend
npm run build
```
*(Production static bundle will be created inside `frontend/dist/`)*

### 3. Run Production POS Node
```bash
cd backend
npm start
```
Open browser to `http://localhost:5000` to run the store POS offline!
