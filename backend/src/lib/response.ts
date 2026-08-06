// ─────────────────────────────────────────────────────────────────────────────
// Standard API response helpers — every route uses these
// ─────────────────────────────────────────────────────────────────────────────

import type { Response } from 'express';

export const ok = <T>(res: Response, data: T, meta?: object) =>
  res.status(200).json({ data, error: null, ...(meta ? { meta } : {}) });

// Backward-compatible alias used by older controllers/modules
export const success = <T>(res: Response, data: T, meta?: object) =>
  ok(res, data, meta);

export const created = <T>(res: Response, data: T) =>
  res.status(201).json({ data, error: null });

export const noContent = (res: Response) =>
  res.status(204).send();

export const badRequest = (res: Response, message: string, details?: unknown) =>
  res.status(400).json({ data: null, error: { code: 'BAD_REQUEST', message, details } });

export const unauthorised = (res: Response, message = 'Unauthorised') =>
  res.status(401).json({ data: null, error: { code: 'UNAUTHORISED', message } });

export const forbidden = (res: Response, message = 'Forbidden') =>
  res.status(403).json({ data: null, error: { code: 'FORBIDDEN', message } });

export const notFound = (res: Response, resource = 'Resource') =>
  res.status(404).json({ data: null, error: { code: 'NOT_FOUND', message: `${resource} not found` } });

export const conflict = (res: Response, message: string) =>
  res.status(409).json({ data: null, error: { code: 'CONFLICT', message } });

export const serverError = (res: Response, message = 'Internal server error') =>
  res.status(500).json({ data: null, error: { code: 'SERVER_ERROR', message } });
