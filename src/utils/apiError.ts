import { isAxiosError } from 'axios';
import { API_CONFIG } from '../config/api';

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return `Cannot reach the API at ${API_CONFIG.BASE_URL}. Make sure the backend is running and the port matches.`;
    }

    const data = error.response?.data;
    if (data?.errors) {
      const fieldMessages = Object.entries(data.errors)
        .flatMap(([field, messages]) => messages.map((message) => `${field}: ${message}`));
      if (fieldMessages.length > 0) {
        return fieldMessages.join('\n');
      }
    }
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function isUnauthorizedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}
