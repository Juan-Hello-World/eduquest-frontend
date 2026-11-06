import { AuthResponse } from '../types';

const AUTH_STORAGE_KEY = 'eduquest_auth_session';

let inMemorySession: AuthResponse | null = null;

export const tokenStorage = {
  getSession(): AuthResponse | null {
    if (inMemorySession) return inMemorySession;
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    try {
      inMemorySession = JSON.parse(raw) as AuthResponse;
      return inMemorySession;
    } catch {
      return null;
    }
  },

  setSession(session: AuthResponse): void {
    inMemorySession = session;
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    inMemorySession = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  },

  getAccessToken(): string | null {
    return this.getSession()?.token ?? null;
  },

  getRefreshToken(): string | null {
    return this.getSession()?.refreshToken ?? null;
  },
};