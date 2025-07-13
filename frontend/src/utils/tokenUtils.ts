export interface TokenData {
  access: string;
  refresh?: string;
}

/**
 * Manager for JWT tokens with automatic refresh and request queueing.
 */
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private static readonly API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api';

  private static refreshPromise: Promise<string> | null = null;

  /** Get access token from storage */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /** Get refresh token from storage */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /** Save both tokens */
  static setTokens(tokens: TokenData): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
    if (tokens.refresh) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
    }
  }

  /** Save only access token */
  static setAccessToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /** Clear tokens */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  static hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  /**
   * Refresh access token. Blocks concurrent refresh calls.
   */
  static async refreshAccessToken(): Promise<string> {
    if (!this.refreshPromise) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
  
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(`${this.API_BASE}/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
          });
  
          if (!res.ok) {
            this.clearTokens();
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to refresh token');
          }
  
          const data = await res.json();
          this.setAccessToken(data.access);
          if (data.refresh) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh);
          }
          return data.access;
        } catch (error) {
          console.error('Token refresh failed:', error);
          throw error;
        }
      })();
    }
    return this.refreshPromise;
  }

  /**
   * Perform fetch with automatic token header, refresh on 401, and retry.
   */
  static async fetchWithAuth(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers as HeadersInit);
    let token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    let options: RequestInit = { ...init, headers };
  
    // Первый запрос
    let response = await fetch(input, options);
    
    // Если получили 401 и есть refresh token
    if (response.status === 401 && this.hasRefreshToken()) {
      try {
        // Обновляем токен
        token = await this.refreshAccessToken();
        headers.set('Authorization', `Bearer ${token}`);
        options = { ...init, headers };
        
        // Повторяем запрос
        response = await fetch(input, options);
        
        // Если снова 401 - очищаем токены
        if (response.status === 401) {
          this.clearTokens();
        }
      } catch (e) {
        this.clearTokens();
        throw e;
      }
    }
    return response;
  }

  /**
   * Verify access token validity via /token/verify endpoint.
   */
  static async verifyToken(): Promise<boolean> {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const res = await fetch(`${this.API_BASE}/token/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Ensure we have a valid access token. If the current token is
   * expired and a refresh token is available, it will be refreshed.
   */
  static async getValidAccessToken(): Promise<string | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    // Decode exp field to avoid an extra network call when possible
    try {
      // Lazy load to avoid including in server bundle unnecessarily
      const { jwtDecode } = await import('jwt-decode');
      const { exp } = jwtDecode<{ exp: number }>(token);
      if (Date.now() < exp * 1000 - 30_000) {
        return token;
      }
    } catch {
      // Fallback to verify endpoint
      const ok = await this.verifyToken();
      if (ok) return token;
    }

    if (!this.hasRefreshToken()) return null;
    try {
      const newToken = await this.refreshAccessToken();
      return newToken;
    } catch {
      return null;
    }
  }

  /**
   * Initialize storage listener to react to token changes in other tabs.
   * Pass a callback to handle logout or UI update.
   */
  static initStorageListener(onTokenCleared: () => void): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === this.ACCESS_TOKEN_KEY && event.newValue === null) {
        onTokenCleared();
      }
    });
  }
}
