# Offline Auth & User Storage — Complete Guide

Where user info is stored and how offline works with authentication for multi-branch setup.

---

## 📍 CURRENT STORAGE (Already Implemented)

### **1. Auth Token** (localStorage)
```javascript
Key: 'crip-crumbs-token'
Value: JWT token (e.g., "eyJhbGc...")

How it works:
- Stored on login
- Sent with every API request (Authorization header)
- Used for both online and offline sync
- Cleared on logout
```

**Location:** `frontend/src/lib/api/client.ts:23-29`

```typescript
export function setToken(token: string): void {
  localStorage.setItem('crip-crumbs-token', token);
}

export function clearToken(): void {
  localStorage.removeItem('crip-crumbs-token');
}
```

### **2. User Profile Data** (React Context - Memory Only)
```javascript
Current in AuthContext:
{
  id: "user-123",
  name: "Ahmed Ali",
  email: "ahmed@company.com",
  role: "cashier",           // ← Branch access level
  branchId: "branch-1",      // ← Which branch
  branchName: "Karachi Main",
  branchIds: ["branch-1", "branch-2"],  // ← Multi-branch access
  orgId: "org-1",            // ← Organization
  terminalId: "till-1",      // ← Assigned till
  terminalName: "Till 1",
  permissions: [             // ← What can do
    "sales.create",
    "till.open",
    "till.close",
    "orders.discount",
    ...
  ]
}
```

**Problem:** Stored **only in React state** (memory) — **Lost on page refresh when offline!**

---

## ❌ CURRENT OFFLINE PROBLEM

```
Scenario: User logged in, working offline, page refreshes

1. User is on POSPage (online)
2. WiFi drops (offline)
3. User accidentally refreshes page
4. App loads → calls authApi.me() to restore session
5. Server unreachable (offline) → me() fails
6. User data lost
7. User redirected to login page
8. Offline POS unusable!
```

---

## ✅ SOLUTION: Cache User Profile in IndexedDB

Store user profile in IndexedDB so it persists across refreshes even when offline.

### **What to Store (NOT password!)**

```javascript
User Profile in IndexedDB:
{
  id:           "user-123",           // User ID
  name:         "Ahmed Ali",          // Display name
  email:        "ahmed@company.com",  // Email (read-only)
  role:         "cashier",            // Role for permissions
  branchId:     "branch-1",           // Primary branch
  branchName:   "Karachi Main",       // Branch display
  branchIds:    ["branch-1"],         // All accessible branches
  orgId:        "org-1",              // Organization
  terminalId:   "till-1",             // Assigned terminal
  terminalName: "Till 1",             // Terminal display
  permissions:  [                      // Cached permissions
    "sales.create",
    "till.open",
    "till.close",
    "orders.discount"
  ],
  cachedAt:     1717750800000,        // When cached
  expiresAt:    1717837200000         // Cache expiry (24 hours)
}
```

### **What NOT to Store**

```
❌ Password         (never ever)
❌ Temporary tokens (use main JWT)
❌ Credit cards     (never)
❌ Private keys     (never)
```

---

## 🏗️ IMPLEMENTATION PLAN

### **Phase 1: Add User Caching to IndexedDB** (Offline Store)

Update `frontend/src/sync/db.ts`:

```typescript
// Add USER_PROFILE_STORE to database
const USER_PROFILE_STORE = 'user-profile';

// Create/Update user profile
export async function cacheUserProfile(user: AuthUser): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(USER_PROFILE_STORE, 'readwrite');
    const store = tx.objectStore(USER_PROFILE_STORE);
    const request = store.put({
      ...user,
      cachedAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hour cache
    });

    request.onerror = () => reject(new Error('Failed to cache user profile'));
    request.onsuccess = () => resolve();
  });
}

// Get cached user profile
export async function getCachedUserProfile(): Promise<AuthUser | null> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(USER_PROFILE_STORE, 'readonly');
    const store = tx.objectStore(USER_PROFILE_STORE);
    const request = store.getFirst();

    request.onerror = () => reject(new Error('Failed to get user profile'));
    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }
      
      // Check expiry (24 hour cache)
      if (result.expiresAt < Date.now()) {
        // Expired, delete and return null
        store.delete(result.id);
        resolve(null);
        return;
      }
      
      resolve(result);
    };
  });
}

// Clear user profile (on logout)
export async function clearCachedUserProfile(): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(USER_PROFILE_STORE, 'readwrite');
    const store = tx.objectStore(USER_PROFILE_STORE);
    const request = store.clear();

    request.onerror = () => reject(new Error('Failed to clear user profile'));
    request.onsuccess = () => resolve();
  });
}
```

### **Phase 2: Update AuthContext** (React)

Modify `frontend/src/context/AuthContext.tsx`:

```typescript
import { cacheUserProfile, getCachedUserProfile, clearCachedUserProfile } from '@/sync/db';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:      null,
    isLoading: true,
    isLoggedIn: false,
  });

  // On app load: try online first, fallback to cached profile
  useEffect(() => {
    authApi.me()
      .then((user) => {
        // Online: got fresh user data
        cacheUserProfile(user);  // Cache for offline
        setState({ user: user as AuthUser, isLoading: false, isLoggedIn: true });
      })
      .catch(async () => {
        // Offline: try cached profile
        const cachedUser = await getCachedUserProfile();
        if (cachedUser) {
          // Use cached profile
          setState({ 
            user: cachedUser as AuthUser, 
            isLoading: false, 
            isLoggedIn: true 
          });
        } else {
          // No cache and offline: show login
          setState({ user: null, isLoading: false, isLoggedIn: false });
        }
      });
  }, []);

  // On login: cache user profile
  const login = useCallback(async (email: string, password: string, ...): Promise<AuthUser> => {
    const normalizedEmail = email.trim().toLowerCase();
    const result = await authApi.login(normalizedEmail, password, branchId, terminalId);
    const user = result.user as AuthUser;
    
    // Cache profile for offline
    await cacheUserProfile(user);
    
    localStorage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    setState({ user, isLoading: false, isLoggedIn: true });
    return user;
  }, []);

  // On PIN login: cache user profile
  const pinLogin = useCallback(async (branchId: string, ...): Promise<AuthUser> => {
    const result = await authApi.pinLogin(branchId, terminalId, pin);
    const user = result.user as AuthUser;
    
    // Cache profile for offline
    await cacheUserProfile(user);
    
    localStorage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    setState({ user, isLoading: false, isLoggedIn: true });
    return user;
  }, []);

  // On logout: clear cache
  const logout = useCallback(async () => {
    authApi.logout().catch(() => {});
    await clearCachedUserProfile();  // Clear offline cache
    setState({ user: null, isLoading: false, isLoggedIn: false });
  }, []);

  // ... rest of context
}
```

---

## 🔄 OFFLINE WORKFLOW: Multi-Branch Manager

### **Scenario: Manager opens multiple branches, WiFi drops, page refresh**

```
08:00 - Manager logs in (online)
  ├─ POST /auth/login
  ├─ Receive: { token, user: {...} }
  ├─ Store token in localStorage
  ├─ Cache user profile in IndexedDB
  ├─ Set auth context
  ↓
08:05 - Manager opens Karachi Main branch (online)
  ├─ POST /business-days {branchId: "branch-1"}
  ├─ Success ✓
  ↓
08:10 - WiFi drops (offline)
  ├─ Manager tries to open Karachi North
  ├─ Queued in IndexedDB
  ├─ Indicator: 🔴 1 pending
  ↓
08:15 - Manager accidentally refreshes page
  ├─ App loading...
  ├─ Call authApi.me() → FAILS (offline)
  ├─ Fallback: getCachedUserProfile() from IndexedDB
  ├─ Get cached user:
  │  {
  │    id: "manager-1",
  │    name: "Manager Ahmed",
  │    role: "branch_manager",
  │    branchIds: ["branch-1", "branch-2"],
  │    branchId: "branch-1",
  │    permissions: ["till.open", "till.close", ...]
  │  }
  ├─ Set auth context with cached user
  ├─ Manager can continue working offline!
  ├─ Still see: branch info, role, permissions
  ↓
08:20 - Manager opens another branch (still offline)
  ├─ POST /business-days {branchId: "branch-2"}
  ├─ Queued (now 2 pending)
  ├─ Can work because:
  │  - Token still in localStorage ✓
  │  - Cached user shows which branches they access ✓
  │  - Permissions cached (knows they can open days) ✓
  ↓
08:30 - WiFi restored
  ├─ Online event fires
  ├─ Auto-sync starts:
  │  - 2 day-opens sync to server
  │  - Server validates auth token
  │  - Server validates user permissions
  │  - Creates business days
  ├─ authApi.me() succeeds
  ├─ Fresh user profile loaded
  ├─ IndexedDB cache updated
  ↓
All working! Manager never lost session.
```

---

## 🔐 MULTI-BRANCH SECURITY: Branch Validation

**Critical:** Server must validate branch access on sync!

```typescript
// Server receives: POST /business-days {branchId: "branch-2"}
// With token (JWT includes userId)

Server checks:
1. ✓ Is token valid?
2. ✓ Is user "manager-1"?
3. ✓ Can user "manager-1" access "branch-2"?
   
   // From database:
   // user_branch_access {
   //   userId: "manager-1",
   //   branchIds: ["branch-1", "branch-2"]
   // }
   
4. ✓ Can user open business days? (role check)
5. ✓ Is request timestamp reasonable? (replay attack)

If fails: Return 403 Forbidden
```

---

## 📊 STORAGE LOCATIONS SUMMARY

```
┌─────────────────────────────────────────────────────────┐
│                    AUTH STORAGE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AUTH TOKEN                                            │
│  ├─ Storage: localStorage                             │
│  ├─ Key: 'crip-crumbs-token'                          │
│  ├─ Value: JWT (e.g., "eyJhbGc...")                    │
│  ├─ Lifetime: Session (+ HttpOnly cookie)             │
│  ├─ Access: Every API request                         │
│  └─ Offline: ✓ Available (sync uses it)              │
│                                                         │
│  USER PROFILE                                          │
│  ├─ Online: React Context (memory)                     │
│  ├─ Offline: IndexedDB (persistent)                    │
│  ├─ Data: id, name, role, branch, permissions        │
│  ├─ Lifetime: 24 hours (or logout)                    │
│  ├─ Access: React hooks + AuthContext                │
│  └─ Offline: ✓ Available (survives refresh)          │
│                                                         │
│  PASSWORD                                              │
│  ├─ Storage: ✗ NEVER stored                           │
│  ├─ Only: Sent once to /auth/login                    │
│  └─ Never: Cached, localStorage, or anywhere else    │
│                                                         │
│  PERMISSIONS & ROLE                                    │
│  ├─ Online: In user profile                            │
│  ├─ Offline: Cached in user profile (IndexedDB)       │
│  ├─ Used: Local permission checks                      │
│  └─ Validated: Server re-validates on sync           │
│                                                         │
│  BRANCH ASSOCIATION                                    │
│  ├─ Single branch: branchId                            │
│  ├─ Multi-branch: branchIds array + branchId (primary)│
│  ├─ Stored: In user profile                            │
│  ├─ Offline: ✓ Available (cached)                     │
│  └─ Sync: Server validates access on each request    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 OFFLINE AUTH FLOW

### **Scenario: Offline Operations**

```
1. USER LOGS IN (online)
   POST /auth/login {email, password}
   ↓
   Response: {token, user}
   ↓
   Store token: localStorage.setItem('crip-crumbs-token', token)
   Store profile: cacheUserProfile(user) → IndexedDB
   Set context: setState({ user, isLoggedIn: true })

2. REFRESH PAGE (offline)
   authApi.me() fails (no server)
   ↓
   Fallback: getCachedUserProfile() from IndexedDB
   ↓
   Restore context: setState({ user: cached, isLoggedIn: true })
   ↓
   User can work offline

3. MAKE API REQUEST (offline)
   POST /invoices {data}
   ↓
   [OfflineApi intercepts]
   ↓
   Get token from localStorage
   Queue request with token:
   {
     method: "POST",
     path: "/invoices",
     headers: { "Authorization": `Bearer ${token}` },
     body: {data}
   }

4. SYNC (back online)
   Fetch token from localStorage
   Send request to server with Authorization header
   Server validates:
     - Token valid?
     - User authorized for this action?
     - User can access this branch?
   
   If all ✓: Process request
   If ✗: Return 401/403, sync fails

5. LOGOUT
   Clear token: localStorage.removeItem('crip-crumbs-token')
   Clear cache: clearCachedUserProfile()
   Clear context: setState({ user: null, isLoggedIn: false })
```

---

## ⚠️ SECURITY CONSIDERATIONS

### **What's Protected**

✅ Token stored securely (HttpOnly cookie primary, localStorage fallback)
✅ No password stored anywhere
✅ User profile cached but not sensitive
✅ Branch access validated server-side on sync
✅ Permissions validated server-side
✅ Replay attacks prevented (timestamp + server logic)

### **What Must Be Done Server-Side**

✅ Validate JWT signature (don't trust cached user profile)
✅ Re-validate branch access for each request
✅ Re-validate user permissions
✅ Check request timestamps (no old requests)
✅ Rate limiting on sync endpoints
✅ Log failed sync attempts

### **Cache Expiry**

```typescript
User profile cache expires after 24 hours
If offline > 24 hours:
  - User needs to login again when online
  - This is acceptable (enterprise POS usually online daily)
```

---

## 📋 MULTI-BRANCH EXAMPLE: Cashier

### **Cashier with Access to 1 Branch**

```javascript
// Cached user profile
{
  id: "cashier-1",
  name: "Fatima Khan",
  role: "cashier",
  branchId: "branch-khi-main",      // Only one
  branchName: "Karachi Main",
  branchIds: ["branch-khi-main"],    // Array of 1
  permissions: [
    "sales.create",
    "till.open",
    "till.close"
  ]
}

Offline behavior:
- Can only open/close tills in: branch-khi-main
- When syncing, requests include: {branchId: "branch-khi-main"}
- Server validates: cashier-1 can access branch-khi-main ✓
```

### **Manager with Access to 3 Branches**

```javascript
// Cached user profile
{
  id: "manager-1",
  name: "Ahmed Ali",
  role: "branch_manager",
  branchId: "branch-khi-main",       // Primary
  branchName: "Karachi Main",
  branchIds: [                        // Can access all 3
    "branch-khi-main",
    "branch-khi-north",
    "branch-lah-main"
  ],
  permissions: [
    "sales.create",
    "till.open",
    "till.close",
    "business.day.open",
    "business.day.close",
    "orders.discount.override",
    "manager.reports"
  ]
}

Offline behavior:
- Can open business days for: all 3 branches
- Can access tills in: all 3 branches
- When syncing, requests validate:
  1. Token valid?
  2. Manager-1 can access that branch?
  3. Manager has permission?
```

---

## 🎯 IMPLEMENTATION CHECKLIST

- [ ] Add USER_PROFILE_STORE to IndexedDB (db.ts)
- [ ] Implement cacheUserProfile() function
- [ ] Implement getCachedUserProfile() function
- [ ] Implement clearCachedUserProfile() function
- [ ] Update AuthContext to cache on login
- [ ] Update AuthContext to load from cache on app init
- [ ] Add 24-hour expiry to cached profile
- [ ] Clear cache on logout
- [ ] Test: refresh offline → cached user restored
- [ ] Test: multi-branch manager offline → cached branches available
- [ ] Test: sync after offline → token & profile still valid
- [ ] Document: branch validation happens server-side

---

## 📝 OFFLINE AUTH WORKFLOW FOR YOUR SETUP

For your **multi-branch, multi-city organization**:

```
Manager (HQ) Login
  ├─ Email: manager@company.com
  ├─ Password: (not stored)
  ├─ Receives:
  │  {
  │    token: "eyJhbGc...",
  │    user: {
  │      id: "mgr-1",
  │      name: "Manager Ahmed",
  │      role: "city_manager",
  │      branchIds: [           ← Multi-city, multi-branch
  │        "branch-khi-main",
  │        "branch-khi-north",
  │        "branch-lah-main",
  │        "branch-lah-south",
  │        "branch-isl-main"
  │      ],
  │      permissions: [
  │        "business.day.open",
  │        "business.day.close",
  │        ...
  │      ]
  │    }
  │  }
  ├─ Store token in localStorage
  ├─ Store user in IndexedDB
  ↓
  Can now:
  - Open business days for all 5 branches (online or offline)
  - Offline: uses cached profile, knows which branches to open
  - Sync: server validates each request's branch access
```

---

## Summary

**User Info Storage for Offline:**

| Data | Storage | Online | Offline | Cleared |
|------|---------|--------|---------|---------|
| JWT Token | localStorage | ✓ | ✓ | Logout |
| User Profile | IndexedDB | Optional* | ✓ | 24h / Logout |
| Password | ✗ Never | ✗ | ✗ | ✗ |
| Permissions | IndexedDB | Optional* | ✓ | 24h / Logout |
| Branch Access | IndexedDB | Optional* | ✓ | 24h / Logout |

*Optional online because server has authoritative version

**The Key:** Token + cached profile = offline user can work and sync validates everything on server!

