# Opening & Closing Procedures

Complete step-by-step guide for daily operations — opening the business for the day and closing it at end of shift.

---

## Roles Required

| Role | Responsibility |
|------|---------------|
| **Manager / Admin** | Open business day, open shift, approve till closes, close shift, close day |
| **Cashier** | Open till, process orders, close till |

---

## OPENING PROCEDURE

### Step 1 — Manager: Open Business Day

**URL:** `/admin/manager`

1. Log in as Manager or Admin
2. On the Manager Panel, locate the **Business Day** card
3. Click **"Open Day"**
4. A new business day is created for today's date
5. Status changes to **Open**

> The business day cannot be opened if the previous day has unclosed tills or is not fully closed.

---

### Step 2 — Manager: Open Shift

**URL:** `/admin/manager`

1. After the business day is open, locate the **Shift** card
2. The system will suggest the current shift based on time (e.g. Morning Shift 06:00–14:00)
3. Click **"Open Shift"**
4. Status changes to **Open**

> A shift must be open before any cashier can open a till.

---

### Step 3 — Cashier: Open Till

**URL:** `/` (POS Screen)

1. Log in as Cashier (PIN login on the terminal)
2. The **Open Till** dialog appears automatically
3. Enter cashier name and shift label (e.g. "Ahmed — Morning Shift")
4. Count and enter the opening float using the denomination table
5. Tick **"Cash reviewed and opening balance confirmed"**
6. Click **"Open Till — Rs X.XX"**
7. Till opens and POS screen is ready for orders

> If the business day or shift is not open, the till will show an error. Contact the manager.

---

### Step 4 — Start Taking Orders

**URL:** `/` (POS Screen)

- The till status badge in the top header shows **green "Open · HH:MM"**
- Select products, add to cart, checkout, confirm orders to kitchen
- Orders flow to the Kitchen Display System automatically

---

---

## CLOSING PROCEDURE

### Step 5 — Cashier: Close Till

**URL:** `/` (POS Screen)

1. Ensure all orders are processed and no open orders are pending
2. Click the **green till badge** in the top header (shows "Open · HH:MM")
3. The **Close Till** dialog opens
4. Count the physical cash in the drawer
5. Enter the closing denomination count
6. Review the **Expected Cash** vs **Actual Cash** and note any variance
7. Add closing notes if required
8. Click **"Submit Close"**
9. Till status changes to **Pending Manager Approval**
10. Cashier can no longer process orders on this terminal

> The till is NOT fully closed until a manager approves it.

---

### Step 6 — Manager: Approve Till Close

**URL:** `/admin/manager`

1. Log in as Manager or Admin
2. The **Pending Closes** metric card shows the count of tills awaiting approval
3. Scroll down to the **Pending Till Closes** section
4. Review each till:
   - Cashier name
   - Opening float
   - Expected cash (opening + cash sales)
   - Actual cash (cashier's count)
   - Variance (difference)
5. Click **"Approve Close"** on each till
6. Optionally add manager notes
7. Till status changes to **Closed**

> If the variance is unacceptable, investigate before approving. The approval is a formal sign-off on the cashier's cash count.

---

### Step 7 — Manager: Close Shift

**URL:** `/admin/manager`

1. All tills for the shift must be **Closed** (no pending approvals)
2. Locate the **Shift** card
3. Click **"Close Shift"**
4. Optionally add closing notes
5. Shift status changes to **Closed**

> The system blocks shift closing while any till is open or pending approval.

---

### Step 8 — Manager: Close Business Day

**URL:** `/admin/manager`

1. All shifts must be **Closed**
2. All tills must be **Closed** (no pending approvals)
3. Locate the **Business Day** card
4. Click **"Close Day"**
5. Optionally add closing notes
6. Business day status changes to **Closed**

> The system blocks day closing while any open tills or pending close approvals exist.

---

---

## FULL FLOW SUMMARY

```
OPENING
────────────────────────────────────────────────
[Manager]  /admin/manager  →  Open Business Day
[Manager]  /admin/manager  →  Open Shift
[Cashier]  /              →  Open Till

TRADING
────────────────────────────────────────────────
[Cashier]  /              →  Process Orders

CLOSING
────────────────────────────────────────────────
[Cashier]  /              →  Close Till (submit)
[Manager]  /admin/manager  →  Approve Till Close
[Manager]  /admin/manager  →  Close Shift
[Manager]  /admin/manager  →  Close Business Day
```

---

## Business Rules

| Rule | Enforcement |
|------|-------------|
| Cannot open till without an open business day | Backend blocks with `BUSINESS_DAY_NOT_OPEN` |
| Cannot open till without an open shift | Backend blocks with `SHIFT_NOT_OPEN` |
| Cannot open a till that is already open | Backend returns existing session |
| Cannot close shift with open or pending tills | Manager Panel disables Close Shift button |
| Cannot close business day with open shifts or tills | Manager Panel disables Close Day button |
| Cannot open new business day without closing previous | Backend enforces date uniqueness per branch |
| Till close requires manager approval | Status goes to `pending_close_approval` first |

---

## Quick Reference URLs

| Action | URL | Role |
|--------|-----|------|
| Open / Close Business Day | `/admin/manager` | Manager / Admin |
| Open / Close Shift | `/admin/manager` | Manager / Admin |
| Approve Till Close | `/admin/manager` | Manager / Admin |
| Open / Close Till | `/` | Cashier |
| Process Orders | `/` | Cashier |
| Kitchen Display | `/kitchen` | Kitchen Staff |
| Admin Dashboard | `/admin/dashboard` | Admin |
