import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { getStoredToken } from './tokenStorage';

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url ?? '';
    const isPublicAuthRoute =
      requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && onUnauthorized && !isPublicAuthRoute) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);
