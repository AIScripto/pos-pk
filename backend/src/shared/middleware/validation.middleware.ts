import type { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { badRequest } from '../lib/response';

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return badRequest(res, 'Invalid request body', details);
    }
    req.body = result.data;
    next();
  };
}
