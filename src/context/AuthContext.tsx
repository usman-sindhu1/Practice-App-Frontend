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
import { fetchDoctorProfile, submitDoctorProfile as submitDoctorProfileRequest } from '../services/doctorService';
import { isUnauthorizedError } from '../utils/apiError';
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';
import type { DoctorProfile, SubmitDoctorProfilePayload } from '../types/doctor';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  doctorProfile: DoctorProfile | null;
  isLoading: boolean;
  isDoctorProfileLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshDoctorProfile: () => Promise<DoctorProfile | null>;
  submitDoctorProfile: (payload: SubmitDoctorProfilePayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadDoctorProfileForUser(user: User | null): Promise<DoctorProfile | null> {
  if (user?.role !== 'doctor') return null;
  return fetchDoctorProfile();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorProfileLoading, setIsDoctorProfileLoading] = useState(false);

  const clearSession = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setUser(null);
    setDoctorProfile(null);
  }, []);

  const refreshDoctorProfile = useCallback(async () => {
    if (user?.role !== 'doctor') {
      setDoctorProfile(null);
      return null;
    }

    setIsDoctorProfileLoading(true);
    try {
      const profile = await fetchDoctorProfile();
      setDoctorProfile(profile);
      return profile;
    } finally {
      setIsDoctorProfileLoading(false);
    }
  }, [user?.role]);

  const establishSession = useCallback(async (authToken: string, authUser: User) => {
    if (!authUser?.id) {
      throw new Error('Login response is missing user data.');
    }

    setToken(authToken);
    setUser(authUser);

    if (authUser.role === 'doctor') {
      setIsDoctorProfileLoading(true);
      try {
        const profile = await loadDoctorProfileForUser(authUser);
        setDoctorProfile(profile);
      } finally {
        setIsDoctorProfileLoading(false);
      }
    } else {
      setDoctorProfile(null);
    }
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

        if (currentUser.role === 'doctor') {
          setIsDoctorProfileLoading(true);
          try {
            const profile = await loadDoctorProfileForUser(currentUser);
            setDoctorProfile(profile);
          } finally {
            setIsDoctorProfileLoading(false);
          }
        }
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

  const login = useCallback(
    async (payload: LoginPayload) => {
      const auth = await loginRequest(payload);
      await establishSession(auth.token, auth.user);
    },
    [establishSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const auth = await registerRequest(payload);
      await establishSession(auth.token, auth.user);
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const submitDoctorProfile = useCallback(async (payload: SubmitDoctorProfilePayload) => {
    const profile = await submitDoctorProfileRequest(payload);
    setDoctorProfile(profile);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateProfileRequest(payload);
    setUser(updatedUser);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      doctorProfile,
      isLoading,
      isDoctorProfileLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
      refreshDoctorProfile,
      submitDoctorProfile,
      updateProfile,
    }),
    [
      user,
      token,
      doctorProfile,
      isLoading,
      isDoctorProfileLoading,
      login,
      register,
      logout,
      refreshUser,
      refreshDoctorProfile,
      submitDoctorProfile,
      updateProfile,
    ],
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
