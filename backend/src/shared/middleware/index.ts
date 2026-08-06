// =============================================================================
// Shared Middleware — exported for use across all modules
// =============================================================================

export { auth, authenticate, requireRole, requirePermission } from './auth.middleware';
export { errorHandler, notFoundHandler } from './error.middleware';
export { validateBody } from './validation.middleware';
