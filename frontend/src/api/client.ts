import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Tokens are kept in memory (not localStorage) to reduce XSS token-theft risk.
// They are lost on full page reload by design; the app re-authenticates via
// the httpOnly-free refresh flow held in a module-level variable instead.
let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(tokens: { accessToken: string; refreshToken: string } | null) {
  accessToken = tokens?.accessToken ?? null;
  refreshToken = tokens?.refreshToken ?? null;
}

export function getAccessToken() {
  return accessToken;
}

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

let refreshingPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && refreshToken && !original._retry) {
      original._retry = true;

      if (!refreshingPromise) {
        refreshingPromise = axios
          .post<AuthResponse>(`${BASE_URL}/auth/refresh`, { refreshToken })
          .then((res) => {
            setTokens(res.data);
          })
          .catch((err) => {
            setTokens(null);
            throw err;
          })
          .finally(() => {
            refreshingPromise = null;
          });
      }

      try {
        await refreshingPromise;
        return api(original);
      } catch {
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
