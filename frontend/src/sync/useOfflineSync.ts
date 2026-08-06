import { useCallback, useEffect, useState } from 'react';
import { useOffline } from './offline-context';
import { SyncQueueItem } from './types';

interface UseOfflineSyncResult {
  isOnline: boolean;
  isSyncing: boolean;
  hasPending: boolean;
  pendingCount: number;
  failedItems: SyncQueueItem[];
  syncNow: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncResult {
  const { isOnline, isSyncing, queueLength, queueItems, triggerSync } = useOffline();
  const [failedItems, setFailedItems] = useState<SyncQueueItem[]>([]);

  useEffect(() => {
    const failed = queueItems.filter((item) => item.retries >= item.maxRetries);
    setFailedItems(failed);
  }, [queueItems]);

  const syncNow = useCallback(async () => {
    await triggerSync();
  }, [triggerSync]);

  return {
    isOnline,
    isSyncing,
    hasPending: queueLength > 0,
    pendingCount: queueLength,
    failedItems,
    syncNow,
  };
}
