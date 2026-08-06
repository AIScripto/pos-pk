# Offline-First POS Workflow: Complete Step-by-Step

Shows exactly how offline sync works with your POS operations: Open Day → Open Shift → Open Till → Transactions → Close Till.

---

## 📋 SCENARIO: Typical POS Day

### 🟢 SCENARIO A: ONLINE (Normal Operation)

#### **Step 1: OPEN DAY** (Manager)
```
Manager clicks "Open Business Day"
  ↓
API Call: POST /business-days
  ├─ Method: POST (can be queued ✓)
  ├─ Online? YES
  ├─ Forward to real API
  ↓
Server Response:
{
  id: "day-2026-06-07",
  status: "open",
  date: "2026-06-07",
  openedBy: "manager-1",
  openedAt: "2026-06-07T08:00:00Z"
}
  ↓
Response received immediately
  ↓
UI: "Business day opened ✓"
Indicator: Nothing (all synced)
```

---

#### **Step 2: OPEN SHIFT** (Shift Manager)
```
Shift Manager clicks "Start Shift"
  ↓
API Call: POST /shifts
  ├─ Method: POST (can be queued ✓)
  ├─ Online? YES
  ├─ Body: {businessDayId, startTime, name}
  ↓
Server Response:
{
  id: "shift-1",
  businessDayId: "day-2026-06-07",
  name: "Morning",
  startTime: "2026-06-07T08:00:00Z",
  status: "open"
}
  ↓
UI: "Shift started ✓"
```

---

#### **Step 3: OPEN TILL** (Cashier)
```
Cashier clicks "Open Till"
  ↓
API Call: POST /till/open
  ├─ Method: POST (can be queued ✓)
  ├─ Online? YES
  ├─ Body: {
  │    terminalId: "terminal-1",
  │    openingCashAmount: 500000,  (5000 PKR in paisa)
  │    notes: "Opened with 5000 cash"
  │  }
  ├─ Priority: HIGH (till operation)
  ↓
Server Response:
{
  id: "session-123",
  terminalId: "terminal-1",
  status: "open",
  openedAt: "2026-06-07T08:30:00Z",
  openingCashAmount: 500000
}
  ↓
UI: "Till opened ✓"
Indicator: ✅ Synced (nothing pending)
Local State: Till session active
```

---

#### **Step 4: CREATE ORDER** (Cashier - Multiple)
```
Customer 1: Orders Biryani + Lassi
  ↓
Cashier clicks "Complete Order"
  ↓
API Call: POST /invoices
  ├─ Method: POST (can be queued ✓)
  ├─ Online? YES
  ├─ Body: {
  │    terminalId: "terminal-1",
  │    tillSessionId: "session-123",
  │    items: [
  │      {productId: "prod-1", quantity: 1, unitPricePaisa: 150000},
  │      {productId: "prod-2", quantity: 1, unitPricePaisa: 50000}
  │    ],
  │    paymentMethod: "cash",
  │    grandTotalPaisa: 200000
  │  }
  ├─ Priority: NORMAL
  ↓
Server Response:
{
  id: "inv-001",
  invoiceNumber: "INV-001",
  items: [...],
  grandTotalPaisa: 200000,
  status: "completed"
}
  ↓
UI: "Order #001 completed ✓"
Indicator: ✅ Synced

Customer 2: Orders Karahi
  ↓
[Same flow - Order #002]

Customer 3: Orders Chai
  ↓
[Same flow - Order #003]
```

---

#### **Step 5: CLOSE TILL** (Cashier)
```
Cashier clicks "Close Till"
  ↓
API Call: POST /till/close
  ├─ Method: POST (can be queued ✓)
  ├─ Online? YES
  ├─ Body: {
  │    sessionId: "session-123",
  │    closingCashAmount: 700000,  (accumulated from 5000 + 2000)
  │    notes: "Ended with 7000 cash"
  │  }
  ├─ Priority: HIGH (till operation)
  ↓
Server Response:
{
  id: "session-123",
  status: "closed",
  closedAt: "2026-06-07T17:00:00Z",
  closingCashAmount: 700000,
  variance: 0
}
  ↓
UI: "Till closed ✓"
Indicator: ✅ Synced
Till Session: Inactive
```

---

### 🔴 SCENARIO B: OFFLINE (Network Drop at 2PM)

#### **Step 1: OPEN DAY** (Before WiFi drops)
```
[Same as online - completed before WiFi drops]
✓ Day opened on server
```

---

#### **Step 2: OPEN SHIFT** (Before WiFi drops)
```
[Same as online - completed before WiFi drops]
✓ Shift opened on server
```

---

#### **Step 3: OPEN TILL** (Before WiFi drops)
```
[Same as online - completed before WiFi drops]
✓ Till opened on server
Till session: "session-123" active locally
```

---

#### **Step 4A: CREATE ORDER #1** (OFFLINE - WiFi drops at 2PM)
```
Customer 1: Orders Biryani (2:00 PM)
  ↓
Cashier clicks "Complete Order"
  ↓
API Call: POST /invoices
  ├─ Method: POST (can be queued ✓)
  ├─ Online? NO (WiFi dropped!)
  ├─ Queueable? YES (POST method)
  ↓
[OfflineApi intercepts]
  ↓
Store in IndexedDB:
{
  id: "1717750800-xyz001",
  method: "POST",
  path: "/invoices",
  body: {
    terminalId: "terminal-1",
    tillSessionId: "session-123",
    items: [{...}],
    paymentMethod: "cash",
    grandTotalPaisa: 150000
  },
  timestamp: 1717750800,
  retries: 0,
  priority: "normal",
  status: "pending"
}
  ↓
Return placeholder response:
{
  __offline: true,
  __queued: true
}
  ↓
UI: "Order queued - will sync when online"
Indicator: 🔴 Offline
          ① 1 pending
Local State: Order saved locally, receipt printed
```

---

#### **Step 4B: CREATE ORDER #2** (OFFLINE - Still no WiFi)
```
Customer 2: Orders Karahi (2:15 PM)
  ↓
Cashier clicks "Complete Order"
  ↓
API Call: POST /invoices
  ├─ Online? NO
  ├─ Queueable? YES
  ↓
Store in IndexedDB (same process):
{
  id: "1717750900-xyz002",
  path: "/invoices",
  body: { order 2 data },
  timestamp: 1717750900,
  ...
}
  ↓
Indicator: 🔴 Offline
          ② 2 pending
```

---

#### **Step 4C: CREATE ORDER #3** (OFFLINE)
```
Customer 3: Orders Chai (2:30 PM)
  ↓
[Same process]
  ↓
Indicator: 🔴 Offline
          ③ 3 pending
```

---

#### **Step 5: CLOSE TILL** (OFFLINE - Still no WiFi at 5PM)
```
Cashier clicks "Close Till"
  ↓
API Call: POST /till/close
  ├─ Online? NO
  ├─ Queueable? YES (POST)
  ├─ Priority: HIGH (till operation!)
  ↓
Store in IndexedDB:
{
  id: "1717765200-xyz004",
  method: "POST",
  path: "/till/close",
  body: {
    sessionId: "session-123",
    closingCashAmount: 700000,
    notes: "..."
  },
  timestamp: 1717765200,
  priority: "high",  ← TILL OPERATION = HIGH PRIORITY
  retries: 0
}
  ↓
Indicator: 🔴 Offline
          ④ 4 pending (3 orders + 1 till close)
```

---

#### **Step 6: USER GOES ONLINE** (5:15 PM - Switches to Cellular)
```
User connects to 4G network
  ↓
[Browser online event fires]
  ↓
Offline sync system detects: isOnline = true
  ↓
Indicator: 🔄 Syncing...
  ↓
Queue Processor starts:
  ├─ Get all items from IndexedDB
  ├─ Sort by priority:
  │  1. "till/close" (HIGH) ← Will sync FIRST
  │  2. Order #1 (normal)
  │  3. Order #2 (normal)
  │  4. Order #3 (normal)
  └─ Process in order
  ↓
PROCESS ITEM 1: POST /till/close (HIGH PRIORITY)
  ├─ Get auth token from localStorage
  ├─ Send request with body + auth header
  ├─ Server processes: Till session closed
  ├─ Response: 200 OK ✓
  ├─ Remove from queue
  ↓
PROCESS ITEM 2: POST /invoices (Order #1)
  ├─ Send request
  ├─ Server processes: Invoice created
  ├─ Response: 200 OK ✓
  ├─ Remove from queue
  ↓
PROCESS ITEM 3: POST /invoices (Order #2)
  ├─ Send request
  ├─ Server processes: Invoice created
  ├─ Response: 200 OK ✓
  ├─ Remove from queue
  ↓
PROCESS ITEM 4: POST /invoices (Order #3)
  ├─ Send request
  ├─ Server processes: Invoice created
  ├─ Response: 200 OK ✓
  ├─ Remove from queue
  ↓
Indicator: ✅ Synced
UI: All orders synced to server
```

---

### 🟡 SCENARIO C: PARTIAL FAILURE (Network Unstable)

#### **Setup**: 5 orders queued, WiFi is flaky

```
Online event fires → Sync starts
  ↓
Item 1 (till/close): Send request
  ├─ Timeout (network flaky)
  ├─ Catch error
  ├─ Increment retries: 0 → 1
  ├─ Store error: "Request timeout"
  ├─ Schedule retry: 1000ms (1 second)
  ├─ Update IndexedDB
  ↓
Item 2-5: Continue processing with available bandwidth
  ├─ Some succeed
  ├─ Some fail
  ├─ All failures scheduled for retry
  ↓
After 1 second:
  Retry Item 1 (till/close)
  ├─ Still timing out
  ├─ Increment retries: 1 → 2
  ├─ Schedule retry: 3000ms (3 seconds)
  ↓
After 3 seconds:
  Retry Item 1
  ├─ Network better now
  ├─ Success! ✓
  ├─ Remove from queue
  ↓
Final State:
  ├─ Item 1: Synced ✓
  ├─ Items 2-5: Synced ✓ (earlier)
  ├─ Indicator: ✅ Synced
  ├─ All on server
```

---

## 📊 QUEUE STATE EXAMPLES

### Example 1: After Step 4A (First Order Offline)
```
IndexedDB sync-queue:
┌─────────────────────────────────────┐
│ ID: 1717750800-xyz001              │
│ Method: POST                         │
│ Path: /invoices                      │
│ Body: {order data}                   │
│ Timestamp: 1717750800                │
│ Retries: 0/3                         │
│ Priority: normal                     │
│ Status: pending                      │
└─────────────────────────────────────┘

Indicator: 🔴 1 pending
```

### Example 2: After Step 4C (3 Orders + Till Close Queued)
```
IndexedDB sync-queue:
┌─────────────────────────────────────┐
│ 1. POST /till/close [HIGH] [pending]│
│ 2. POST /invoices   [NORMAL][pending]
│ 3. POST /invoices   [NORMAL][pending]
│ 4. POST /invoices   [NORMAL][pending]
└─────────────────────────────────────┘

Sorted by priority (HIGH first):
┌─────────────────────────────────────┐
│ 1. POST /till/close (syncs FIRST)   │
│ 2. POST /invoices #1                 │
│ 3. POST /invoices #2                 │
│ 4. POST /invoices #3                 │
└─────────────────────────────────────┘

Indicator: 🔴 4 pending
```

### Example 3: During Sync (First Item Retrying)
```
IndexedDB sync-queue:
┌──────────────────────────────────────────┐
│ 1. POST /till/close [HIGH]               │
│    Retries: 1/3                          │
│    LastError: "Request timeout"          │
│    NextRetry: 3000ms (3 seconds)         │
│                                          │
│ 2-4. Other orders [pending]              │
└──────────────────────────────────────────┘

Indicator: 🔄 Syncing... (4 pending)
```

---

## 🔄 RETRY BACKOFF EXAMPLE

### Order that fails 3 times then succeeds

```
Time 0:00 → User goes online
  ↓
Attempt 1: Send POST /invoices
  Response: 500 Internal Server Error
  ↓
Wait 1 second
  ↓
Time 0:01 → Attempt 2: Send POST /invoices
  Response: 502 Bad Gateway
  ↓
Wait 3 seconds
  ↓
Time 0:04 → Attempt 3: Send POST /invoices
  Response: 504 Gateway Timeout
  ↓
Wait 5 seconds
  ↓
Time 0:09 → Attempt 4: Send POST /invoices
  Response: 200 OK ✓
  ↓
Item removed from queue
Item synced successfully!
```

---

## 🎯 KEY DIFFERENCES: ONLINE vs OFFLINE

| Operation | Online | Offline |
|-----------|--------|---------|
| **Till Open** | Immediate on server | Queued in IndexedDB |
| **Order Create** | Immediate on server | Queued in IndexedDB |
| **Order Receipt** | From server | Generated locally |
| **Indicator** | ✅ Synced | 🔴 N pending |
| **Retry** | No retries needed | Auto-retry with backoff |
| **Till Close** | Immediate on server | Queued (HIGH priority) |
| **Sync** | N/A | Auto when online |

---

## ✅ WHAT GETS QUEUED (Offline)

```
HIGH PRIORITY (Sync First):
  ✓ POST /till/open
  ✓ POST /till/close
  ✓ POST /till/summary
  → Till operations are critical!

NORMAL PRIORITY:
  ✓ POST /invoices (orders)
  ✓ POST /held-orders
  ✓ PATCH /invoices (modifications)
  ✓ DELETE /invoices (voids)
  → Everything else
```

---

## ❌ WHAT DOESN'T GET QUEUED

```
GET Requests:
  ✗ GET /till/current
  ✗ GET /invoices
  ✗ GET /products
  → Can't cache all queries, need fresh data
  → Fail gracefully: "You're offline"

Without matching Priority:
  ✗ /business-days
  ✗ /shifts
  → These are queued but normal priority
```

---

## 📱 USER EXPERIENCE

### Online Experience (No Changes)
```
Cashier: Click → API → Response → Done
         (instant)
```

### Offline Experience (Better UX!)
```
Cashier: Click → Queued locally → Indicator shows "1 pending"
         (instant, no error!)
                    ↓
         [WiFi restored]
                    ↓
         Indicator: "Syncing..." → "✅ Synced"
         (all automatic)
```

---

## 🔍 DEBUGGING: Check Queue in Browser

### View Queue Items
```javascript
// Open DevTools Console
import { getQueueItems } from '@/sync';

const items = await getQueueItems();
console.log(items);

// Output:
[
  {
    id: "1717750800-xyz001",
    method: "POST",
    path: "/invoices",
    retries: 0,
    priority: "normal",
    status: "pending"
  },
  ...
]
```

### View Offline Status
```javascript
import { useOfflineSync } from '@/sync';

const { isOnline, queueLength, isSyncing } = useOfflineSync();
console.log({ isOnline, queueLength, isSyncing });

// Output:
// { isOnline: false, queueLength: 4, isSyncing: false }
```

---

## 🎬 STEP-BY-STEP FULL DAY SCENARIO

```
08:00 - Manager opens day (online) → ✓ On server
08:05 - Shift opened (online) → ✓ On server
08:30 - Till opened (online) → ✓ On server

09:00 - Order #1 (online) → ✓ On server
09:15 - Order #2 (online) → ✓ On server
...
14:00 - WiFi drops! 🔴
14:05 - Order #3 (offline) → 🔴 Queued (1 pending)
14:20 - Order #4 (offline) → 🔴 Queued (2 pending)
14:35 - Order #5 (offline) → 🔴 Queued (3 pending)
17:00 - Till close (offline) → 🔴 Queued (4 pending, HIGH priority)

17:10 - WiFi restored 📡
17:10 - Auto-sync starts 🔄
        Till close sent first (HIGH priority)
        Then orders #3, #4, #5
17:15 - All synced! ✅
        All 4 items on server
        Till session closed
        Ready for next day
```

---

## 🎓 MEMORY HELPS UNDERSTAND

**IndexedDB Storage = Local Hard Drive**
- Requests stored like files on disk
- Survives page refresh
- Survives app close
- ~10MB capacity

**Queue Manager = Delivery Service**
- Picks up queued items
- Delivers them when road (network) is available
- If delivery fails, retries with patience (backoff)
- Marks HIGH priority deliveries (till) to go first

**React Context = Live Dashboard**
- Shows: Am I online? Am I syncing? How many pending?
- Updates UI in real-time
- Components subscribe to changes

---

## Summary

**Before Offline Sync:**
```
WiFi drops → User loses transaction → Customer angry 😞
```

**After Offline Sync:**
```
WiFi drops → Transaction queued locally → User sees "pending"
           → WiFi restored → Auto-syncs silently → Customer happy 😊
```

Your POS now works **seamlessly offline** — transactions never get lost, sync happens automatically, and the user sees exactly what's happening. ✨

