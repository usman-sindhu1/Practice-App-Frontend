import { isAxiosError } from 'axios';

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorBody>(error)) {
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
