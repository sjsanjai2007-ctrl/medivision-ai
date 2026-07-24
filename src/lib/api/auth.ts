// ============================================================
// MediVision AI – Auth API
// POST /auth/login  →  TokenResponse
// POST /auth/register  →  TokenResponse
// ============================================================

import { apiRequest, setToken, setStoredUser } from './client';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  name: string;
  email: string;
}

export async function loginApi(email: string, password: string): Promise<TokenResponse> {
  const res = await apiRequest<TokenResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  // Persist token & basic user info
  setToken(res.access_token);
  setStoredUser({ id: res.user_id, name: res.name, email: res.email });
  return res;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await apiRequest<TokenResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  setToken(res.access_token);
  setStoredUser({ id: res.user_id, name: res.name, email: res.email });
  return res;
}
