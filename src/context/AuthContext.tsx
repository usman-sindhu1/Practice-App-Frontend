import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setUnauthorizedHandler } from '../services/api';
import {
  fetchCurrentUser,
  getStoredToken,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  updateProfile as updateProfileRequest,
} from '../services/authService';
import { isUnauthorizedError } from '../utils/apiError';
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });

    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  useEffect(() => {
    async function bootstrapAuth() {
      try {
        const storedToken = await getStoredToken();
        if (!storedToken) return;

        setToken(storedToken);
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    }

    bootstrapAuth();
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await loginRequest(payload);
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const auth = await registerRequest(payload);
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateProfileRequest(payload);
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, token, isLoading, login, register, logout, refreshUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
