import { SyncQueueItem } from './types';

const DB_NAME = 'pos-app-sync';
const DB_VERSION = 1;
const QUEUE_STORE = 'sync-queue';
const METADATA_STORE = 'metadata';

let db: IDBDatabase | null = null;

export async function initDb(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(new Error('Failed to open IndexedDB'));
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (e) => {
      const database = (e.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        const store = database.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('priority', 'priority');
        store.createIndex('status', 'status');
      }

      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        database.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };
  });
}

export async function addToQueue(item: SyncQueueItem): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.add(item);

    request.onerror = () => reject(new Error('Failed to add to queue'));
    request.onsuccess = () => resolve();
  });
}

export async function getQueueItems(): Promise<SyncQueueItem[]> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.getAll();

    request.onerror = () => reject(new Error('Failed to get queue items'));
    request.onsuccess = () => {
      const items = request.result as SyncQueueItem[];
      resolve(items.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === 'high' ? -1 : 1;
        }
        return a.timestamp - b.timestamp;
      }));
    };
  });
}

export async function removeFromQueue(id: string): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(new Error('Failed to remove from queue'));
    request.onsuccess = () => resolve();
  });
}

export async function updateQueueItem(item: SyncQueueItem): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.put(item);

    request.onerror = () => reject(new Error('Failed to update queue item'));
    request.onsuccess = () => resolve();
  });
}

export async function getQueueLength(): Promise<number> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readonly');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.count();

    request.onerror = () => reject(new Error('Failed to count queue items'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function clearQueue(): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(QUEUE_STORE, 'readwrite');
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.clear();

    request.onerror = () => reject(new Error('Failed to clear queue'));
    request.onsuccess = () => resolve();
  });
}

export async function setMetadata(key: string, value: unknown): Promise<void> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(METADATA_STORE, 'readwrite');
    const store = tx.objectStore(METADATA_STORE);
    const request = store.put({ key, value });

    request.onerror = () => reject(new Error('Failed to set metadata'));
    request.onsuccess = () => resolve();
  });
}

export async function getMetadata(key: string): Promise<unknown> {
  const database = await initDb();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(METADATA_STORE, 'readonly');
    const store = tx.objectStore(METADATA_STORE);
    const request = store.get(key);

    request.onerror = () => reject(new Error('Failed to get metadata'));
    request.onsuccess = () => resolve(request.result?.value);
  });
}
