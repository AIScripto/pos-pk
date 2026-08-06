// ─────────────────────────────────────────────────────────────────────────────
// Global error handler — catches everything that falls through routes
// ─────────────────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';

export function errorHandler(
  err:  Error,
  req:  Request,
  res:  Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  console.error(`[ERROR] ${req.method} ${req.path}`, err);

  res.status(500).json({
    data:  null,
    error: {
      code:    'SERVER_ERROR',
      message: 'An unexpected error occurred',
      // Only expose stack trace in development
      ...(env.isDev ? { stack: err.stack } : {}),
    },
  });
}

/** Catch-all for routes that don't exist */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    data:  null,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  });
}
