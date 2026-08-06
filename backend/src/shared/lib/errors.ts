// =============================================================================
// AppError — typed domain errors for services and controllers
// =============================================================================

/**
 * Use AppError for all business-rule violations.
 * Controllers can then narrow `err instanceof AppError` and map the
 * `code` to the correct HTTP status without inspecting raw strings.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
    // Maintain proper prototype chain in transpiled output
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Narrow an unknown catch value to an AppError or a plain Error. */
export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError(err.message, err.message);
  return new AppError('UNKNOWN_ERROR', String(err));
}
