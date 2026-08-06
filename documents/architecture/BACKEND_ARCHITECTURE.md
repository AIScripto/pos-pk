# Backend Modular Architecture Plan

## Current vs Proposed Structure

### Current (Monolithic)
```
backend/src/
├── controllers/      # All controllers mixed
├── services/        # All services mixed
├── routes/          # All routes mixed
├── middleware/
├── lib/
├── config/
└── index.ts
```

### Proposed (Modular)
```
backend/src/
├── shared/                          # Shared across all modules
│   ├── lib/
│   │   ├── prisma.ts              # Database client
│   │   ├── response.ts            # Response helpers
│   │   └── index.ts               # Export all shared libs
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── common.ts
│   │   └── index.ts
│   └── utils/
│       ├── validators.ts
│       ├── helpers.ts
│       └── index.ts
│
├── modules/
│   ├── pos/                         # POS Module
│   │   ├── controllers/
│   │   │   ├── invoice.ts
│   │   │   ├── inventory.ts
│   │   │   ├── customer.ts
│   │   │   ├── till.ts
│   │   │   ├── table.ts
│   │   │   ├── held-order.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── invoice.service.ts
│   │   │   ├── inventory.service.ts
│   │   │   ├── till.service.ts
│   │   │   ├── held-order.service.ts
│   │   │   └── index.ts
│   │   ├── routes/
│   │   │   ├── invoice.routes.ts
│   │   │   ├── inventory.routes.ts
│   │   │   ├── customer.routes.ts
│   │   │   ├── till.routes.ts
│   │   │   ├── table.routes.ts
│   │   │   ├── held-order.routes.ts
│   │   │   └── index.ts
│   │   └── index.ts                # Module entry point
│   │
│   └── admin/                       # Admin Module
│       ├── controllers/
│       │   ├── product.ts
│       │   ├── config.ts
│       │   ├── user.ts              # New: User management
│       │   ├── branch.ts            # New: Branch management
│       │   └── index.ts
│       ├── services/
│       │   ├── product.service.ts
│       │   ├── config.service.ts
│       │   ├── user.service.ts      # New
│       │   ├── branch.service.ts    # New
│       │   └── index.ts
│       ├── routes/
│       │   ├── product.routes.ts
│       │   ├── config.routes.ts
│       │   ├── user.routes.ts       # New
│       │   ├── branch.routes.ts     # New
│       │   └── index.ts
│       └── index.ts                 # Module entry point
│
├── config/
│   ├── env.ts
│   └── index.ts
│
└── index.ts                         # Main server
```

## Module Structure

### shared/index.ts
```typescript
// Export all shared utilities
export * from './lib';
export * from './middleware';
export * from './types';
export * from './utils';
```

### modules/pos/index.ts
```typescript
import { Router } from 'express';
import { posRoutes } from './routes';

export const posModule = (baseRouter: Router) => {
  baseRouter.use('/invoices', posRoutes.invoiceRoutes);
  baseRouter.use('/inventory', posRoutes.inventoryRoutes);
  baseRouter.use('/customers', posRoutes.customerRoutes);
  baseRouter.use('/till', posRoutes.tillRoutes);
  baseRouter.use('/tables', posRoutes.tableRoutes);
  baseRouter.use('/held-orders', posRoutes.heldOrderRoutes);
};
```

### modules/admin/index.ts
```typescript
import { Router } from 'express';
import { adminRoutes } from './routes';

export const adminModule = (baseRouter: Router) => {
  baseRouter.use('/products', adminRoutes.productRoutes);
  baseRouter.use('/config', adminRoutes.configRoutes);
  baseRouter.use('/users', adminRoutes.userRoutes);
  baseRouter.use('/branches', adminRoutes.branchRoutes);
};
```

### Main index.ts
```typescript
import express from 'express';
import { posModule } from './modules/pos';
import { adminModule } from './modules/admin';
import { authRoutes } from './shared/routes/auth.routes';

const app = express();
app.use(express.json());

// Shared auth routes (both modules use)
app.use('/api/auth', authRoutes);

// POS module routes
const posRouter = express.Router();
posModule(posRouter);
app.use('/api', posRouter);  // /api/invoices, /api/inventory, etc.

// Admin module routes
const adminRouter = express.Router();
adminModule(adminRouter);
app.use('/api/admin', adminRouter);  // /api/admin/products, /api/admin/config, etc.

// Start server on port 3500
app.listen(3500, () => console.log('Server running on :3500'));
```

## URL Routing Map

```
Auth (Shared)
  POST   /api/auth/login
  POST   /api/auth/pin
  GET    /api/auth/me
  GET    /api/auth/branches
  GET    /api/auth/terminals
  POST   /api/auth/logout

POS Module
  GET    /api/invoices
  POST   /api/invoices
  PUT    /api/invoices/:id
  POST   /api/invoices/:id/void

  GET    /api/inventory
  PUT    /api/inventory/:productId

  GET    /api/customers
  POST   /api/customers

  GET    /api/till/current
  POST   /api/till/open
  POST   /api/till/close

  GET    /api/tables/sections
  GET    /api/tables

  GET    /api/held-orders
  POST   /api/held-orders
  DELETE /api/held-orders/:id

Admin Module
  GET    /api/admin/products
  POST   /api/admin/products
  PUT    /api/admin/products/:id
  DELETE /api/admin/products/:id

  GET    /api/admin/config/org
  PUT    /api/admin/config/org
  GET    /api/admin/config/tax

  GET    /api/admin/users
  POST   /api/admin/users
  PUT    /api/admin/users/:id

  GET    /api/admin/branches
  POST   /api/admin/branches
  PUT    /api/admin/branches/:id
```

## Migration Steps

1. Create folder structure
2. Move shared code to `shared/`
3. Move POS controllers/services/routes to `modules/pos/`
4. Move Admin controllers/services/routes to `modules/admin/`
5. Create module index files for route mounting
6. Update main index.ts with module mounting
7. Update all imports
8. Test all endpoints

## Benefits

✅ Clear separation of concerns
✅ Independent scaling of modules
✅ Shared utilities in one place
✅ Easier to add new modules later
✅ Better code organization
✅ Reduced dependency coupling
✅ Easier testing (can test modules independently)
✅ Same port (3500) with different route prefixes
