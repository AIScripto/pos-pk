// ─────────────────────────────────────────────────────────────────────────────
// Base API client — handles auth headers, error parsing, standard envelope
// ─────────────────────────────────────────────────────────────────────────────

import { API_URL } from '@/config/api';

const BASE_URL = API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code:   string,
    message:       string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Keep token in localStorage as a fallback for sessions that predate the cookie migration.
// New logins set an HttpOnly cookie; the Authorization header covers existing sessions
// until they log out and back in.
export function setToken(token: string): void {
  localStorage.setItem('pos-app-token', token);
}

export function clearToken(): void {
  localStorage.removeItem('pos-app-token');
}

async function request<T>(
  method:  string,
  path:    string,
  body?:   unknown,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const base = BASE_URL.startsWith('http') ? BASE_URL : `${origin}${BASE_URL.startsWith('/') ? '' : '/'}${BASE_URL}`;
  const url = new URL(`${base.endsWith('/') ? base.slice(0, -1) : base}${path.startsWith('/') ? path : `/${path}`}`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Cookie is the primary auth mechanism; Authorization header covers existing sessions
  // that were established before the cookie migration.
  const legacyToken = localStorage.getItem('pos-app-token');
  if (legacyToken) headers['Authorization'] = `Bearer ${legacyToken}`;

  const res = await fetch(url.toString(), {
    method,
    credentials: 'include',  // send HttpOnly cookie with every request
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message = json?.error?.message ?? json?.message ?? `HTTP ${res.status}`;
    const code    = json?.error?.code    ?? String(res.status);
    throw new ApiError(res.status, code, message);
  }

  // Standard envelope: { data: T, error: null, meta?: ... }
  // Must check 'data' in json explicitly — json.data can be null (e.g. no
  // open till session), and null ?? json would return the envelope object
  // instead of null, corrupting callers that test for a null response.
  if (json !== null && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  get:    <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>('GET', path, undefined, params),
  post:   <T>(path: string, body: unknown) => request<T>('POST',   path, body),
  patch:  <T>(path: string, body: unknown) => request<T>('PATCH',  path, body),
  put:    <T>(path: string, body: unknown) => request<T>('PUT',    path, body),
  delete: <T>(path: string, body?: unknown) => request<T>('DELETE', path, body),
};
