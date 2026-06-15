import { Platform } from 'react-native';

// Must match the port your Express API listens on (integration guide uses 3000).
const DEV_PORT = 8000;

const DEV_BASE_URL =
  Platform.OS === 'android' ? `http://10.0.2.2:${DEV_PORT}` : `http://localhost:${DEV_PORT}`;

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_BASE_URL : 'https://your-deployed-api.com',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/users/me',
    DOCTOR_PROFILE: '/doctors/me/profile',
    DOCTOR_AVAILABILITY: '/doctors/me/availability',
    DOCTOR_AVAILABILITY_SLOTS: '/doctors/me/availability/slots',
    DOCTORS_APPROVED: '/doctors/approved',
    DOCTORS: '/doctors',
    DOCTOR_PUBLIC_PROFILE: (userId: string) => `/doctors/${userId}`,
    DOCTOR_SLOTS: (userId: string) => `/doctors/${userId}/availability/slots`,
    ADMIN_DOCTORS: '/admin/doctors',
    ADMIN_DOCTOR_STATUS: (userId: string) => `/admin/doctors/${userId}/status`,
  },
} as const;
