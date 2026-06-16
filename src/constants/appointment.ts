import type { AppointmentStatus } from '../types/appointment';

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: '#d97706',
  approved: '#16a34a',
  rejected: '#dc2626',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Waiting for admin approval',
  approved: 'Confirmed',
  rejected: 'Rejected',
};

export function formatAppointmentStatus(status: AppointmentStatus): string {
  return APPOINTMENT_STATUS_LABELS[status];
}
