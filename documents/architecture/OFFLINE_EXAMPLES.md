# Offline-First Examples: Real-World Usage

Practical examples showing how offline-sync works with your existing Crip Crumbs code.

## Example 1: Till Opening (Critical Path)

### Current Code (No Changes Needed)

```tsx
// pages/POSPage.tsx - Existing code
import { tillApi } from '@/lib/api/till.api';

const openTill = async () => {
  try {
    const session = await tillApi.open({
      terminalId: terminal.id,
      openingCashAmount: 5000,
    });
    setTillSession(session);
    showToast.success('Till opened');
  } catch (error) {
    showToast.error(error.message);
  }
};
```

### What Happens Online ✅

```
Click "Open Till" button
  ↓
POST /till/open {terminalId, openingCashAmount}
  ↓
[OfflineApi: isOnline=true]
  ↓
Forward to api.post()
  ↓
Server processes
  ↓
Response: { id: "session-123", status: "open", ... }
  ↓
setTillSession() updates UI
  ↓
Toast: "Till opened"
```

### What Happens Offline (Graceful Queue) 📱

```
User opens app on iPad without WiFi
  ↓
Click "Open Till" button
  ↓
POST /till/open {terminalId, openingCashAmount}
  ↓
[OfflineApi: isOnline=false, method=POST (queueable)]
  ↓
Store in IndexedDB:
{
  id: "1717800123-abc789",
  method: "POST",
  path: "/till/open",
  body: {terminalId, openingCashAmount},
  timestamp: 1717800123,
  retries: 0,
  priority: "high"  ← Till operation = high priority
}
  ↓
Return placeholder: { __offline: true }
  ↓
UX: Toast shows "Till opening (queued, will sync)"
      UI shows OfflineIndicator: "1 pending"
  ↓
Offline Indicator UI:
┌─────────────────────┐
│ 🔴 1 pending        │
└─────────────────────┘
(click for details)
  ↓
User swipes to connect to WiFi
  ↓
Online event fires → auto-sync starts
  ↓
Queue processor:
  1. Pull item from IndexedDB
  2. GET auth token from localStorage
  3. POST /till/open with {body}
  4. Server responds with session
  ↓
Success:
  - Remove from queue
  - Update UI state
  - Indicator changes: "✅ Synced"
  ↓
Till session now live on server
```

## Example 2: Multiple Orders While Offline

### Scenario: Customers queue up, WiFi drops

```tsx
// pages/POSPage.tsx - Existing checkout flow
const completeOrder = async (order) => {
  const response = await orderApi.create(order);
  setOrders([...orders, response]);
};

// User makes 3 orders while offline
// Orders 1, 2, 3 all queue automatically
```

### Queue State (Offline)

```
IndexedDB sync-queue:
┌─────────────────────────────────────────────────────┐
│ Item 1: POST /till/open                   [priority]│
│ Item 2: POST /orders {items, total}       [normal] │
│ Item 3: POST /orders {items, total}       [normal] │
│ Item 4: POST /orders {items, total}       [normal] │
└─────────────────────────────────────────────────────┘

UI Indicator: 🔴 4 pending
```

### Sync Happens (Online)

```
Queue processor sorts by priority:
  1. Item 1 (till/open - high priority) - syncs first
  2. Items 2-4 (orders - normal priority) - synced in order

Processing:
  Till opens → creates session
    ↓
  Order 1 syncs → server creates transaction
    ↓
  Order 2 syncs → server creates transaction
    ↓
  Order 3 syncs → server creates transaction
    ↓
  All synced! UI: ✅ Synced
```

## Example 3: Failed Sync + Retry

### Scenario: Network drops mid-sync

```
Order POST /orders {items}
  ↓
[Online, attempts sync]
  ↓
Server error: "Database connection lost"
  ↓
[OfflineApi catches error]
  ↓
Queue item:
{
  path: "/orders",
  body: {...},
  retries: 1,    ← incremented
  lastError: "HTTP 500: Database connection lost"
}
  ↓
Schedule retry: 1000ms (first backoff)
  ↓
After 1 second: retry POST /orders
  ↓
Server responds: 200 OK ✓
  ↓
Item removed from queue
  ↓
UI updates
```

### Exponential Backoff Timeline

```
Request made offline
  ↓
User connects to network
  ↓
Attempt 1: Immediately
  → Fails: timeout
  ↓
Attempt 2: Wait 1 second
  → Fails: server error
  ↓
Attempt 3: Wait 3 seconds
  → Fails: bad gateway
  ↓
Attempt 4 (final): Wait 5 seconds
  → Success ✓
  
Total time: 9 seconds of automatic retries
User didn't need to do anything!
```

## Example 4: Handling Failed Syncs

### Component: Show Failed Items

```tsx
import { useOfflineSync } from "@/sync";
import { AlertDialog } from "@/components/ui/alert-dialog";

function FailedSyncDialog() {
  const { failedItems } = useOfflineSync();

  if (failedItems.length === 0) return null;

  return (
    <AlertDialog open={failedItems.length > 0}>
      <AlertDialogTitle>
        {failedItems.length} Transaction{failedItems.length > 1 ? 's' : ''} Failed
      </AlertDialogTitle>
      <AlertDialogDescription>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {failedItems.map((item) => (
            <div key={item.id} className="border-l-4 border-red-500 pl-3 py-2">
              <p className="font-mono text-sm">
                {item.method} {item.path}
              </p>
              <p className="text-xs text-red-600">{item.lastError}</p>
              <p className="text-xs text-gray-500">
                Attempts: {item.retries}/{item.maxRetries}
              </p>
            </div>
          ))}
        </div>
      </AlertDialogDescription>
      <AlertDialogAction>
        OK, I'll check the connection
      </AlertDialogAction>
    </AlertDialog>
  );
}
```

### Usage

```tsx
// In your app layout
export function App() {
  return (
    <>
      <AppContent />
      <OfflineIndicator />
      <FailedSyncDialog />  {/* Shows if any failed items */}
    </>
  );
}
```

## Example 5: Manual Sync Trigger

### Component: Allow User to Force Sync

```tsx
import { useOfflineSync } from "@/sync";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

function ManualSyncButton() {
  const { syncNow, isSyncing, hasPending } = useOfflineSync();

  return (
    <Button
      onClick={syncNow}
      disabled={isSyncing || !hasPending}
      variant="outline"
    >
      <RotateCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </Button>
  );
}
```

### Usage in Settings

```tsx
// pages/admin/AdminConfig.tsx
function AdminConfig() {
  return (
    <div className="space-y-4">
      {/* ... existing config ... */}
      
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Sync Settings</h3>
        <ManualSyncButton />
      </div>
    </div>
  );
}
```

## Example 6: Conditional Logic Based on Offline Status

### Show Different UI When Offline

```tsx
import { useOfflineSync } from "@/sync";

function CheckoutFlow() {
  const { isOnline, pendingCount } = useOfflineSync();

  return (
    <div>
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-sm">
            📱 You're offline. Orders will be saved locally and synced when
            you're back online.
          </p>
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded">
          <p className="text-sm">
            🔄 Syncing {pendingCount} pending transaction{pendingCount > 1 ? 's' : ''}...
          </p>
        </div>
      )}

      {/* Regular checkout form */}
      <OrderForm />
    </div>
  );
}
```

## Example 7: Mutation Hook with React Query

### Using Offline API with TanStack Query

```tsx
import { useMutation } from "@tanstack/react-query";
import { offlineApi, isOfflineQueuedResponse } from "@/sync";

function useCreateOrder() {
  return useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      return offlineApi.post("/orders", data);
    },
    onSuccess: (response) => {
      if (isOfflineQueuedResponse(response)) {
        // Order was queued, not immediately processed
        showToast("Order saved offline");
        // Don't invalidate queries since server hasn't processed yet
        return;
      }

      // Normal response - invalidate cache
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast.success("Order created");
    },
    onError: (error) => {
      showToast.error(`Failed: ${error.message}`);
    },
  });
}

// Usage
function CheckoutButton() {
  const createOrder = useCreateOrder();

  return (
    <button 
      onClick={() => createOrder.mutate(orderData)}
      disabled={createOrder.isPending}
    >
      {createOrder.isPending ? 'Processing...' : 'Complete Order'}
    </button>
  );
}
```

## Example 8: Dashboard Stats with Offline Awareness

### Show Queue Health

```tsx
import { useOfflineSync } from "@/sync";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

function SyncHealthDashboard() {
  const { isOnline, isSyncing, queueLength, lastSyncTime } = useOfflineSync();

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Connection</p>
        <p className="text-2xl font-bold">
          {isOnline ? "🟢 Online" : "🔴 Offline"}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Queue Length</p>
        <p className="text-2xl font-bold">{queueLength}</p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Syncing</p>
        <p className="text-2xl font-bold">
          {isSyncing ? "🔄" : "✅"}
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <p className="text-gray-600 text-sm">Last Sync</p>
        <p className="text-lg font-mono">
          {lastSyncTime 
            ? new Date(lastSyncTime).toLocaleTimeString()
            : "Never"
          }
        </p>
      </div>
    </div>
  );
}
```

## Example 9: Test Scenario - Complete Offline Journey

### Step-by-Step Testing

```
Setup:
  1. Open Crip Crumbs in browser
  2. Login as cashier
  3. Open DevTools (F12)

Step 1: Simulate Offline
  1. Network tab → Throttling: "Offline"
  2. Click "Open Till"
  3. Observe: Toast shows "Queued"
  4. Indicator shows: "🔴 1 pending"

Step 2: Add More Orders (Still Offline)
  1. Add customer order
  2. Indicator: "🔴 4 pending" (till + 3 orders)
  3. Verify no errors shown

Step 3: Go Online
  1. Network tab → Throttling: "Online"
  2. Indicator: "🔄 Syncing..." (blue)
  3. Watch sync happen automatically
  4. After ~5 seconds: "✅ Synced"

Step 4: Verify Backend
  1. Check orders in database
  2. Verify till session created
  3. Verify all 3 orders exist

Results: ✓ All transactions synced correctly
```

## Example 10: Error Recovery Workflow

### Handling Different Failure Types

```tsx
import { useOfflineSync } from "@/sync";

function SyncStatus() {
  const { isOnline, failedItems } = useOfflineSync();

  const authErrors = failedItems.filter(item => 
    item.lastError?.includes('401')
  );
  
  const serverErrors = failedItems.filter(item => 
    item.lastError?.includes('500')
  );

  return (
    <>
      {authErrors.length > 0 && (
        <Alert variant="warning">
          <AlertTitle>Authentication Expired</AlertTitle>
          <AlertDescription>
            Please log in again to sync {authErrors.length} transaction{authErrors.length > 1 ? 's' : ''}.
            <Button onClick={() => window.location.href = '/login'}>
              Login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {serverErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Server Error</AlertTitle>
          <AlertDescription>
            {serverErrors.length} transaction{serverErrors.length > 1 ? 's' : ''} failed due to server issues.
            We'll keep retrying.
          </AlertDescription>
        </Alert>
      )}

      {!isOnline && (
        <Alert variant="info">
          <AlertTitle>You're Offline</AlertTitle>
          <AlertDescription>
            All changes are being saved locally. They'll sync when you're back online.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
```

## Summary

All these examples work with **zero changes to your existing API calls**. The offline sync layer:

✅ Queues automatically when offline
✅ Syncs automatically when online
✅ Shows user-friendly status
✅ Handles retries gracefully
✅ Keeps transactions safe

**No refactoring needed** — just wrap app with `OfflineProvider` and you're done!

For more details, see:
- `frontend/src/sync/README.md` — Architecture
- `OFFLINE_INTEGRATION.md` — Integration guide
- `ARCHITECTURE_OFFLINE.md` — Technical deep-dive
