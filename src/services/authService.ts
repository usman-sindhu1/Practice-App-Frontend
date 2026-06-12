import { API_CONFIG } from '../config/api';
import { api } from './api';
import { clearStoredToken, getStoredToken, setStoredToken } from './tokenStorage';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '../types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, payload);
  await setStoredToken(data.token);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.REGISTER, payload);
  await setStoredToken(data.token);
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>(API_CONFIG.ENDPOINTS.ME);
  return data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await api.patch<User>(API_CONFIG.ENDPOINTS.ME, payload);
  return data;
}

export async function logout(): Promise<void> {
  await clearStoredToken();
}

export { getStoredToken };
