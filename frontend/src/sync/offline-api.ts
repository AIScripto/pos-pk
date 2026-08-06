import { api, ApiError } from '@/lib/api/client';
import { HttpMethod } from './types';
import * as queue from './queue';

// Methods that can be queued offline
const QUEUEABLE_METHODS: HttpMethod[] = ['POST', 'PATCH', 'PUT'];

interface OfflineApiOptions {
  allowOffline?: boolean;
}

export class OfflineApi {
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | undefined>,
    options: OfflineApiOptions = {},
  ): Promise<T> {
    const { allowOffline = true } = options;

    if (!this.isOnline) {
      if (QUEUEABLE_METHODS.includes(method) && allowOffline) {
        // Queue the request for later
        await queue.enqueue(method, path, body, params);
        // Return a placeholder that indicates offline queueing
        return { __offline: true, __queued: true } as T;
      } else if (method === 'GET') {
        // GET requests can't be queued; throw an error
        throw new OfflineApiError(
          0,
          'OFFLINE',
          'Network unavailable. This operation requires an internet connection.',
        );
      }
    }

    // Online: use regular API
    return this.callApi(method, path, body, params);
  }

  private async callApi<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    switch (method) {
      case 'GET':
        return api.get(path, params);
      case 'POST':
        return api.post(path, body);
      case 'PATCH':
        return api.patch(path, body);
      case 'PUT':
        return api.put(path, body);
      case 'DELETE':
        return api.delete(path, body);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  get<T>(path: string, params?: Record<string, string | number | undefined>) {
    return this.request<T>('GET', path, undefined, params, { allowOffline: false });
  }

  post<T>(path: string, body: unknown, options?: OfflineApiOptions) {
    return this.request<T>('POST', path, body, undefined, options);
  }

  patch<T>(path: string, body: unknown, options?: OfflineApiOptions) {
    return this.request<T>('PATCH', path, body, undefined, options);
  }

  put<T>(path: string, body: unknown, options?: OfflineApiOptions) {
    return this.request<T>('PUT', path, body, undefined, options);
  }

  delete<T>(path: string, body?: unknown, options?: OfflineApiOptions) {
    return this.request<T>('DELETE', path, body, undefined, options);
  }
}

export class OfflineApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'OfflineApiError';
  }
}

export const offlineApi = new OfflineApi();

// Helper to check if response is an offline queue response
export function isOfflineQueuedResponse(response: unknown): boolean {
  return (
    response !== null &&
    typeof response === 'object' &&
    '__offline' in response &&
    '__queued' in response
  );
}
