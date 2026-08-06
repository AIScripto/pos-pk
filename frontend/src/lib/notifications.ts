/**
 * Centralized notification/toast service
 * Provides consistent feedback for user actions (create, update, delete, etc.)
 */

import { getUserFriendlyErrorMessage, getErrorSeverity } from '@/lib/error-handler';

// This will be set by the app's main hook consumer
let toastFn: ((options: ToastOptions) => void) | null = null;

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

/**
 * Initialize the notification service with the toast function
 * Call this once in your app root component
 */
export function initializeNotifications(toast: (options: ToastOptions) => void) {
  toastFn = toast;
}

/**
 * Show success notification (green accent)
 */
export function showSuccess(title: string, description?: string) {
  if (!toastFn) return;

  toastFn({
    title,
    description,
    variant: 'default',
    duration: 3000,
  });
}

/**
 * Show error notification (red)
 */
export function showError(title: string, error?: unknown) {
  if (!toastFn) return;

  const description = error
    ? getUserFriendlyErrorMessage(error)
    : 'An error occurred. Please try again.';

  toastFn({
    title,
    description,
    variant: 'destructive',
    duration: 5000,
  });
}

/**
 * Show info notification (uses default)
 */
export function showInfo(title: string, description?: string) {
  if (!toastFn) return;

  toastFn({
    title,
    description,
    variant: 'default',
    duration: 3000,
  });
}

/**
 * Show warning notification (red)
 */
export function showWarning(title: string, description?: string) {
  if (!toastFn) return;

  toastFn({
    title,
    description,
    variant: 'destructive',
    duration: 4000,
  });
}

/**
 * Convenience functions for common CRUD operations
 */
export const notifications = {
  /**
   * Created new item successfully
   */
  created: (itemName: string) => {
    showSuccess(`${itemName} Created`, `Successfully created new ${itemName.toLowerCase()}`);
  },

  /**
   * Updated item successfully
   */
  updated: (itemName: string) => {
    showSuccess(`${itemName} Updated`, `Successfully updated ${itemName.toLowerCase()}`);
  },

  /**
   * Deleted item successfully
   */
  deleted: (itemName: string) => {
    showSuccess(`${itemName} Deleted`, `Successfully deleted ${itemName.toLowerCase()}`);
  },

  /**
   * Generic save operation
   */
  saved: (itemName: string = 'Changes') => {
    showSuccess(`${itemName} Saved`, 'Your changes have been saved');
  },

  /**
   * Generic error during create
   */
  createError: (itemName: string, error?: unknown) => {
    showError(`Failed to Create ${itemName}`, error);
  },

  /**
   * Generic error during update
   */
  updateError: (itemName: string, error?: unknown) => {
    showError(`Failed to Update ${itemName}`, error);
  },

  /**
   * Generic error during delete
   */
  deleteError: (itemName: string, error?: unknown) => {
    showError(`Failed to Delete ${itemName}`, error);
  },

  /**
   * Generic error during save
   */
  saveError: (error?: unknown) => {
    showError('Save Failed', error);
  },

  /**
   * Item not found
   */
  notFound: (itemName: string) => {
    showInfo(`${itemName} Not Found`, 'The requested item does not exist or was deleted');
  },

  /**
   * No permission to perform action
   */
  unauthorized: () => {
    showError('Permission Denied', 'You do not have permission to perform this action');
  },

  /**
   * Generic network error
   */
  networkError: () => {
    showError('Connection Failed', 'Unable to connect to server. Please check your connection.');
  },

  /**
   * Server error
   */
  serverError: () => {
    showError('Server Error', 'Something went wrong on the server. Please try again later.');
  },

  /**
   * Conflict (e.g., duplicate)
   */
  conflict: (message: string = 'This action cannot be completed due to a conflict') => {
    showWarning('Conflict', message);
  },

  /**
   * Validation error
   */
  validationError: (message: string = 'Please check your input and try again') => {
    showWarning('Validation Error', message);
  },

  /**
   * Loading/in progress
   */
  processing: (message: string = 'Processing...') => {
    showInfo('Processing', message);
  },

  /**
   * Confirm before action
   */
  confirm: (title: string, message: string) => {
    showWarning(title, message);
  },
};

/**
 * Hook to use notifications in components
 * Returns a function to notify about async operations
 */
export function useNotifications() {
  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifications,

    /**
     * Execute an async operation with automatic notifications
     */
    async executeWithNotification<T>(
      operation: () => Promise<T>,
      {
        successMessage = 'Success',
        errorMessage = 'Operation failed',
        loadingMessage,
      }: {
        successMessage?: string;
        errorMessage?: string;
        loadingMessage?: string;
      } = {}
    ): Promise<T | null> {
      if (loadingMessage) {
        showInfo('Processing', loadingMessage);
      }

      try {
        const result = await operation();
        showSuccess(successMessage);
        return result;
      } catch (error) {
        showError(errorMessage, error);
        return null;
      }
    },
  };
}
