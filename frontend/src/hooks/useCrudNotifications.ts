/**
 * Hook for CRUD operations with automatic notifications and error handling
 * Simplifies adding toast notifications to create, read, update, delete operations
 */

import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { notifications } from '@/lib/notifications';
import { getUserFriendlyErrorMessage } from '@/lib/error-handler';

interface UseCrudNotificationsOptions {
  itemName?: string;
  showLoadingMessage?: boolean;
}

export function useCrudNotifications({
  itemName = 'Item',
  showLoadingMessage = false,
}: UseCrudNotificationsOptions = {}) {
  const { toast } = useToast();

  /**
   * Execute a create operation with notifications
   */
  const executeCreate = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      customMessages?: { success?: string; error?: string }
    ): Promise<T | null> => {
      try {
        if (showLoadingMessage) {
          toast({
            title: 'Creating...',
            description: `Creating new ${itemName.toLowerCase()}`,
          });
        }

        const result = await operation();

        toast({
          title: customMessages?.success || `${itemName} Created`,
          description: `Successfully created new ${itemName.toLowerCase()}`,
          variant: 'default',
        });

        return result;
      } catch (error) {
        toast({
          title: customMessages?.error || `Failed to Create ${itemName}`,
          description: getUserFriendlyErrorMessage(error),
          variant: 'destructive',
        });
        return null;
      }
    },
    [itemName, toast, showLoadingMessage]
  );

  /**
   * Execute an update operation with notifications
   */
  const executeUpdate = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      customMessages?: { success?: string; error?: string }
    ): Promise<T | null> => {
      try {
        if (showLoadingMessage) {
          toast({
            title: 'Updating...',
            description: `Updating ${itemName.toLowerCase()}`,
          });
        }

        const result = await operation();

        toast({
          title: customMessages?.success || `${itemName} Updated`,
          description: `Successfully updated ${itemName.toLowerCase()}`,
          variant: 'default',
        });

        return result;
      } catch (error) {
        toast({
          title: customMessages?.error || `Failed to Update ${itemName}`,
          description: getUserFriendlyErrorMessage(error),
          variant: 'destructive',
        });
        return null;
      }
    },
    [itemName, toast, showLoadingMessage]
  );

  /**
   * Execute a delete operation with notifications
   */
  const executeDelete = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      customMessages?: { success?: string; error?: string }
    ): Promise<T | null> => {
      try {
        if (showLoadingMessage) {
          toast({
            title: 'Deleting...',
            description: `Deleting ${itemName.toLowerCase()}`,
          });
        }

        const result = await operation();

        toast({
          title: customMessages?.success || `${itemName} Deleted`,
          description: `Successfully deleted ${itemName.toLowerCase()}`,
          variant: 'default',
        });

        return result;
      } catch (error) {
        toast({
          title: customMessages?.error || `Failed to Delete ${itemName}`,
          description: getUserFriendlyErrorMessage(error),
          variant: 'destructive',
        });
        return null;
      }
    },
    [itemName, toast, showLoadingMessage]
  );

  /**
   * Execute a generic async operation with notifications
   */
  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      messages: { loading?: string; success?: string; error?: string }
    ): Promise<T | null> => {
      try {
        if (messages.loading) {
          toast({
            title: 'Processing...',
            description: messages.loading,
          });
        }

        const result = await operation();

        if (messages.success) {
          toast({
            title: 'Success',
            description: messages.success,
            variant: 'default',
          });
        }

        return result;
      } catch (error) {
        toast({
          title: 'Error',
          description: messages.error || getUserFriendlyErrorMessage(error),
          variant: 'destructive',
        });
        return null;
      }
    },
    [toast]
  );

  return {
    executeCreate,
    executeUpdate,
    executeDelete,
    execute,
    // Expose notifications for manual use
    notifications,
  };
}
