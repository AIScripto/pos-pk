/**
 * Centralized error handling for API and application errors
 * Provides consistent error messages and logging across the app
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed', public originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Human-friendly error messages for different error types
 */
const errorMessages: Record<string, string> = {
  'Network request failed': 'Unable to connect to server. Please check your internet connection.',
  'Unexpected end of JSON input': 'Server returned invalid response. Please try again.',
  'TypeError: Failed to fetch': 'Network connection failed. Please check your connection.',
};

/**
 * Get user-friendly error message from any error
 * Handles API errors, network errors, validation errors, and generic errors
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // API Error
  if (error instanceof ApiError) {
    if (error.statusCode === 400) {
      return error.message || 'Invalid request. Please check your input.';
    }
    if (error.statusCode === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (error.statusCode === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.statusCode === 404) {
      return 'The requested resource was not found.';
    }
    if (error.statusCode === 409) {
      return 'This action conflicts with existing data. Please try again.';
    }
    if (error.statusCode === 422) {
      return error.message || 'Invalid data. Please check your input and try again.';
    }
    if (error.statusCode >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'An error occurred. Please try again.';
  }

  // Network Error
  if (error instanceof NetworkError) {
    return error.message;
  }

  // Validation Error
  if (error instanceof ValidationError) {
    return error.field
      ? `${error.field}: ${error.message}`
      : error.message;
  }

  // Standard Error
  if (error instanceof Error) {
    const message = error.message;

    // Check for known error patterns
    for (const [pattern, friendlyMsg] of Object.entries(errorMessages)) {
      if (message.includes(pattern)) {
        return friendlyMsg;
      }
    }

    return message || 'An unexpected error occurred.';
  }

  // Unknown error
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, error);
  }
}

/**
 * Classify error for UI purposes
 */
export function getErrorSeverity(error: unknown): 'error' | 'warning' | 'info' {
  if (error instanceof ValidationError) {
    return 'warning';
  }
  if (error instanceof ApiError && error.statusCode === 404) {
    return 'info';
  }
  return 'error';
}

/**
 * Extract error message from various error types
 */
export function extractErrorMessage(error: unknown): string {
  try {
    // Handle Fetch API errors
    if (error instanceof Response) {
      return `Server Error: ${error.status} ${error.statusText}`;
    }

    // Handle standard errors
    if (error instanceof Error) {
      return error.message;
    }

    // Handle object errors
    if (typeof error === 'object' && error !== null) {
      if ('message' in error) {
        return String(error.message);
      }
      if ('error' in error) {
        return String(error.error);
      }
    }

    // Fallback
    return String(error);
  } catch {
    return 'An unknown error occurred.';
  }
}

/**
 * Check if error is retriable (temporary failure)
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // Retry on 5xx and 429 (too many requests)
    return error.statusCode >= 500 || error.statusCode === 429;
  }

  if (error instanceof NetworkError) {
    return true;
  }

  return false;
}

/**
 * Wrap API call with standardized error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    throw error;
  }
}
