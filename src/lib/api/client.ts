// ============================================================
// MediVision AI – Base API Client
// Centralized fetch wrapper with auth headers, error handling,
// and demo-mode awareness.
// ============================================================

function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://medivision-backend-df3i.onrender.com/api/v1';
    }
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1';
}

/** Retrieve the stored JWT token from localStorage (client-side only). */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('mv_token');
}

/** Persist a JWT token to localStorage. */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mv_token', token);
  }
}

/** Remove the stored JWT token (logout). */
export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mv_token');
    localStorage.removeItem('mv_user');
  }
}

/** Persist basic user info alongside the token. */
export function setStoredUser(user: { id: string; name: string; email: string }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mv_user', JSON.stringify(user));
  }
}

/** Read stored user info from localStorage. */
export function getStoredUser(): { id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('mv_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ── Core fetch wrapper ─────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** If true, body must already be FormData — don't JSON-stringify */
  formData?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, formData = false } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!formData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${getApiBase()}${path}`, {
    method,
    headers,
    body: formData
      ? (body as FormData)
      : body
        ? JSON.stringify(body)
        : undefined,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.detail ?? detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
