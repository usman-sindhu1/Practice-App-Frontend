import { Platform } from 'react-native';

const DEV_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: __DEV__ ? DEV_BASE_URL : 'https://your-deployed-api.com',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/users/me',
  },
} as const;
