import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SyncQueueItem, SyncStatus } from './types';
import { onQueueChange, onSyncStatusChange, syncQueue, getQueueItems, isSyncActive, clearFailedItems } from './queue';
import { getQueueLength } from './db';
import { initDb } from './db';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  queueItems: SyncQueueItem[];
  lastSyncTime?: number;
  triggerSync: () => Promise<void>;
  clearFailedQueueItems: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number | undefined>();

  // Initialize database
  useEffect(() => {
    initDb().catch((error) => console.error('Failed to initialize sync DB:', error));
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue().catch(console.error);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to queue changes (event-driven)
  useEffect(() => {
    const unsubscribe = onQueueChange((items) => {
      setQueueLength(items.length);
      setQueueItems(items);
    });

    getQueueItems().then((items) => {
      setQueueLength(items.length);
      setQueueItems(items);
    });

    return unsubscribe;
  }, []);

  // Subscribe to sync status changes (event-driven, replaces polling)
  useEffect(() => {
    const unsubscribe = onSyncStatusChange((syncing) => {
      setIsSyncing(syncing);
    });

    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    await syncQueue();
  }, []);

  const clearFailedQueueItems = useCallback(async () => {
    await clearFailedItems();
  }, []);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        queueLength,
        queueItems,
        lastSyncTime,
        triggerSync,
        clearFailedQueueItems,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export function useOffline(): OfflineContextType {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}
