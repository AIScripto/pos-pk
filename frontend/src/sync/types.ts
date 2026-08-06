export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  lastError?: string;
  priority: 'high' | 'normal'; // high priority syncs first
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  queueLength: number;
  lastSyncTime?: number;
}

export interface OfflineTransaction {
  id: string;
  method: HttpMethod;
  path: string;
  body?: unknown;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}
