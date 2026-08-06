# Code Duplication & Structural Audit Review

**Prepared by**: Senior Staff Principal Engineer
**Scope**: Code duplication, architectural orphans, type redundancy, and dry refactoring recommendations.

---

## 🔍 1. Legacy vs. Modular Code Duplication (Resolved)

**Status: Cleaned Up**. All duplicated root-level controllers, services, and the entire legacy `routes/` folder have been permanently deleted from the codebase. The server now runs 100% on the modularized active paths.

### Redundant Parallel Files Cleaned Up:

| Legacy Path (Orphaned / Partially Active) | Modular Active Path | Status |
| :--- | :--- | :--- |
| `backend/src/controllers/till.controller.ts` | `backend/src/modules/pos/controllers/till.controller.ts` | **Deleted** |
| `backend/src/services/till.service.ts` | `backend/src/modules/pos/services/till.service.ts` | **Deleted** |
| `backend/src/controllers/invoice.controller.ts` | `backend/src/modules/pos/controllers/invoice.controller.ts` | **Deleted** |
| `backend/src/services/invoice.service.ts` | `backend/src/modules/pos/services/invoice.service.ts` | **Deleted** |
| `backend/src/controllers/customer.controller.ts` | `backend/src/modules/pos/controllers/customer.controller.ts` | **Deleted** |
| `backend/src/controllers/inventory.controller.ts` | `backend/src/modules/pos/controllers/inventory.controller.ts` | **Deleted** |
| `backend/src/controllers/table.controller.ts` | `backend/src/modules/pos/controllers/table.controller.ts` | **Deleted** |
| `backend/src/controllers/held-order.controller.ts` | `backend/src/modules/pos/controllers/held-order.controller.ts` | **Deleted** |
| `backend/src/services/held-order.service.ts` | `backend/src/modules/pos/services/held-order.service.ts` | **Deleted** |
| `backend/src/controllers/auth.controller.ts` | `backend/src/shared/controllers/auth.controller.ts` | **Deleted** |
| `backend/src/controllers/product.controller.ts` | `backend/src/modules/admin/controllers/product.controller.ts` | **Deleted** |
| `backend/src/controllers/config.controller.ts` | `backend/src/modules/admin/controllers/config.controller.ts` | **Deleted** |

---

## 🚨 2. The Offline Sync Route Orphan (Resolved)

**Status: Fixed & Mounted**.
* The legacy `SyncController` and its associated routing have been relocated into the active POS module under `backend/src/modules/pos/controllers/sync.controller.ts` and `backend/src/modules/pos/routes/sync.routes.ts`.
* The POST `/api/v1/sync/batch` endpoint has been successfully mounted inside the modular POS routing framework (`backend/src/modules/pos/index.ts`).
* The system compiled successfully with 0 errors.

---

## 📝 3. Type & Interface Redundancies

### Cross-boundary Schema Repetition
* The frontend manually defines entity interfaces (`Order`, `Terminal`, `Branch`) in `frontend/src/types/`. These duplicate the Prisma schema shapes defined in `backend/prisma/schema.prisma`.
* **Recommendation**: Implement a shared TypeScript types generator from Prisma (e.g. `prisma-dbml-generator` or custom npm scripts) to generate frontend types automatically on migration, maintaining a single source of truth.

### Internal Request Interfaces
* Interfaces like `CreateInvoiceInput` are copy-pasted and declared twice in the backend: once in the legacy `invoice.service.ts` and once in `modules/pos/services/invoice.service.ts`.
* **Recommendation**: Consolidated all shared interfaces into a `backend/src/shared/types/` directory.

---

## 🎨 4. Frontend Component Duplication (Test Account Selectors)

With the implementation of the click-to-autofill credential selectors, the UI markup for rendering the account button layout is duplicated between `LoginPage.tsx` and `AdminLoginPage.tsx`.

```text
LoginPage.tsx (Test Button Render Block) <--- Duplicated Logic ---> AdminLoginPage.tsx
```

### Recommendation:
Abstract this logic into a single reusable React component: `TestAccountSelector.tsx` located in `frontend/src/components/ui/`.
```tsx
interface TestAccountSelectorProps {
  allowedRoles: Array<'admin' | 'manager' | 'pos'>;
  onSelect: (role: 'admin' | 'manager' | 'pos') => void;
}
```
This isolates styling and credentials array handling, ensuring future changes to credentials or roles only need to be edited in one file.
