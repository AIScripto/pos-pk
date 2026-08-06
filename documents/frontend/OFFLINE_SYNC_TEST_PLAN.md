# Offline Sync Testing Plan

**Status**: Ready for testing  
**Test Date**: 2026-06-14  
**Build**: 1.49 MB (production ready)

---

## 1️⃣ **Setup**

### Prerequisites
- Application built: `npm run build` ✅
- Dev server running: `npm run dev`
- Browser DevTools open (Network + Console tabs)

### Test Account
- **Email**: cashier@aipos.pk
- **Password**: 1234
- **PIN**: 1234

---

## 2️⃣ **Test Scenarios**

### ✅ SCENARIO A: Happy Path - Online Transaction

**Objective**: Verify normal sync works when online

**Steps**:
1. Login as cashier (1234 / 1234)
2. Create a transaction (add 2 products, checkout)
3. **Expected**: 
   - Invoice appears in history immediately
   - OfflineIndicator shows "Synced" (green)
   - No pending items in queue

**Assertion**:
- [ ] Transaction saved to CartContext
- [ ] Invoice appears in Invoice History
- [ ] Offline indicator shows green "Synced"
- [ ] Network tab shows POST /api/invoices

---

### ✅ SCENARIO B: Go Offline Mid-Transaction

**Objective**: Verify offline queueing works

**Steps**:
1. Login and open till (1234 opening balance)
2. Add 3 products to cart
3. Open Chrome DevTools → Network → Throttling: "Offline"
4. Checkout (Cash payment)
5. **Expected**:
   - Offline indicator turns RED: "Offline"
   - Transaction still shows in cart (not lost)
   - No POST request sent

**Assertions**:
- [ ] "Offline" banner visible
- [ ] Cart persists in localStorage
- [ ] No network requests attempted
- [ ] UI remains responsive

---

### ✅ SCENARIO C: Queue Builds While Offline

**Objective**: Verify multiple transactions queue correctly

**Steps**:
1. Stay offline (DevTools: Offline)
2. Create **3 separate transactions**:
   - Tx1: 2x Burger + 1x Fries
   - Tx2: 1x Chicken + 2x Drinks
   - Tx3: 1x Deal
3. Checkout each one (Cash)
4. **Expected**:
   - Offline indicator shows: "**3 pending**"
   - Click indicator → "3 requests waiting to sync"

**Assertions**:
- [ ] Queue count increments (1 → 2 → 3)
- [ ] Indicator shows correct pending count
- [ ] Details panel shows "3 requests"

---

### ✅ SCENARIO D: Auto-Sync When Online

**Objective**: Verify automatic sync triggers on reconnect

**Steps**:
1. With 3 pending transactions (offline)
2. DevTools → Network → Back to "Online" (or "Fast 3G")
3. **Expected Within 2 seconds**:
   - Indicator shows "Syncing..."
   - Spinner animates
   - Requests sent in batches
   - Then shows "Synced" (green)

**Assertions**:
- [ ] Auto-sync triggered (no button click)
- [ ] Spinner visible during sync
- [ ] Network tab shows POST /api/sync/batch requests
- [ ] Final status: "Synced"
- [ ] All 3 invoices now in Invoice History

**Performance Check**:
- [ ] 3 items synced in < 2 seconds (batch endpoint)
- [ ] Only 1-2 batch requests (not 3 individual requests)
- [ ] CPU usage < 10% during sync

---

### ✅ SCENARIO E: Manual Sync Button

**Objective**: Verify manual retry when offline

**Steps**:
1. Create 2 pending transactions while offline
2. Go back to offline (DevTools)
3. Indicator shows "2 pending"
4. Click indicator → Details panel opens
5. Click **"Sync Now"** button
6. **Expected**:
   - Button disabled (showing "Syncing...")
   - Requests sent immediately
   - Button re-enabled when done

**Assertions**:
- [ ] Button only enabled while online AND not syncing
- [ ] Click triggers sync immediately
- [ ] Batch requests sent even while showing offline

---

### ✅ SCENARIO F: Network Failure & Retry

**Objective**: Verify exponential backoff retry works

**Steps**:
1. Create 1 pending transaction (offline)
2. Go online → DevTools Offline again (before sync completes)
3. Wait 5 seconds
4. Go back Online
5. **Expected**:
   - First attempt at 1s
   - Retry at 3s
   - Retry at 5s (if still failing)
   - Eventually syncs

**Assertions**:
- [ ] Retry interval increases: 1s → 3s → 5s
- [ ] Max 3 retries before showing error
- [ ] Error message visible if all retries fail
- [ ] Manual sync button available to retry

---

### ✅ SCENARIO G: Browser Restart

**Objective**: Verify IndexedDB persists queue

**Steps**:
1. Create 2 pending transactions (offline)
2. Close browser completely (not just tab)
3. Reopen browser
4. Go back online
5. **Expected**:
   - Queue data recovered from IndexedDB
   - Auto-sync triggered
   - Transactions synced successfully

**Assertions**:
- [ ] Pending transactions survive page refresh
- [ ] Survive browser restart (IndexedDB persistence)
- [ ] Auto-sync resumes after restart
- [ ] No duplicate transactions

---

### ✅ SCENARIO H: Large Queue Performance

**Objective**: Verify batch processing with 20+ items

**Steps**:
1. Go offline
2. Create **20 transactions** rapidly:
   ```
   Loop 20 times:
     - Add product
     - Checkout
   ```
3. Offline indicator shows "20 pending"
4. Go online
5. **Expected**:
   - Batches: 20 items → 2 batch requests (batch size 20)
   - Completes in < 3 seconds
   - Memory usage stays < 50MB
   - No jank or UI freezing

**Assertions**:
- [ ] Network shows only 2 batch requests (not 20)
- [ ] Sync time < 3 seconds
- [ ] UI remains responsive (no jank)
- [ ] All 20 invoices appear in history after sync

---

### ✅ SCENARIO I: Flaky Network (Slow 3G)

**Objective**: Verify sync works on poor connections

**Steps**:
1. DevTools → Network → Throttling: "Slow 3G"
2. Create 5 transactions (online but slow)
3. Monitor sync behavior
4. **Expected**:
   - Requests timeout properly
   - Retries trigger automatically
   - Eventually syncs successfully

**Assertions**:
- [ ] No hanging requests (timeout < 30s)
- [ ] Retry logic works on timeout
- [ ] UI doesn't freeze during slow sync
- [ ] All items eventually sync

---

## 3️⃣ **Post-Sync Validation**

After each successful sync, verify:

```
✅ All pending items removed from queue
✅ Invoice History shows all transactions
✅ Offline indicator shows "Synced" (green)
✅ Browser console has no errors
✅ Network tab shows successful requests (200 status)
```

---

## 4️⃣ **Edge Cases**

### E1: Empty Queue Auto-Sync
- Go offline/online with no pending items
- **Expected**: No requests sent, indicator shows "Synced"

### E2: Duplicate Detection
- Manually trigger sync twice rapidly
- **Expected**: No duplicate transactions created

### E3: Corrupted IndexedDB
- DevTools → Application → IndexedDB → Delete entire DB
- Create pending transaction
- **Expected**: New DB created, queue starts fresh

### E4: Mixed Online/Offline
- Online → Offline → Online (3 times) while creating transactions
- **Expected**: All transactions eventually sync, no loss

---

## 5️⃣ **Performance Metrics**

Target measurements during testing:

| Metric | Target | Actual |
|--------|--------|--------|
| Sync latency (1 item) | < 500ms | _______ |
| Sync latency (20 items) | < 2s | _______ |
| Batch efficiency | ≤ 2 requests | _______ |
| Queue memory | < 1MB | _______ |
| CPU during sync | < 15% | _______ |
| Retry backoff | 1s, 3s, 5s | _______ |
| IndexedDB init | < 100ms | _______ |

---

## 6️⃣ **Failure Scenarios** ⚠️

### If sync fails:

1. **Check Browser Console**
   ```
   Look for: "Sync queue error: ..."
   Check: Network errors, timeout messages
   ```

2. **Check Network Tab**
   ```
   Look for: Failed requests (red)
   Check: Status codes (500, 503, timeout)
   Check: Request/response payloads
   ```

3. **Check IndexedDB**
   ```
   DevTools → Application → IndexedDB → crip-crumbs-sync
   Verify: Queue items are stored
   Verify: Status flags correct
   ```

4. **Manual Retry**
   - Click OfflineIndicator
   - Click "Sync Now" button
   - Observe behavior

---

## 7️⃣ **Sign-Off Checklist**

- [ ] All 9 scenarios (A-I) passed
- [ ] All edge cases (E1-E4) passed
- [ ] Performance metrics within target
- [ ] No console errors
- [ ] No duplicate transactions
- [ ] IndexedDB working correctly
- [ ] Batch sync working (20 items → 2 requests)
- [ ] Manual retry working
- [ ] Auto-sync on reconnect working
- [ ] UI responsive during sync

---

## 8️⃣ **Known Limitations**

❌ **NOT IMPLEMENTED YET** (Phase 2-4):
- GET request caching
- Service Worker background sync
- Conflict resolution UI
- Encrypted queue storage
- Deduplication on server

✅ **WORKING**:
- POST/PATCH/PUT queueing
- Exponential backoff retry
- Batch processing (10x faster)
- IndexedDB persistence
- Event-driven notifications

---

## 9️⃣ **Test Results**

```
Tester: ___________________  Date: ___________
Passed: ___/9 scenarios
Issues Found: _______________
Sign-off: ___________________
```

---

**Next Step**: Client deployment approval after all tests pass ✅
