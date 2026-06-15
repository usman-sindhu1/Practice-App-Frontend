import type { AdminDoctorProfile, DoctorProfile, DoctorProfileStatus } from '../types/doctor';

export const DOCTOR_STATUS_LABELS: Record<DoctorProfileStatus, string> = {
  not_submitted: 'Not submitted',
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const DOCTOR_STATUS_COLORS: Record<DoctorProfileStatus, string> = {
  not_submitted: '#6b7280',
  pending: '#d97706',
  approved: '#16a34a',
  rejected: '#ef4444',
};

export function formatDoctorStatus(status: DoctorProfileStatus): string {
  return DOCTOR_STATUS_LABELS[status];
}

export function getDoctorDisplayName(
  profile: Pick<DoctorProfile, 'full_name'> & { user?: AdminDoctorProfile['user'] },
): string {
  if (profile.full_name?.trim()) return profile.full_name.trim();
  if (profile.user) return `${profile.user.first_name} ${profile.user.last_name}`.trim();
  return 'Unknown doctor';
}

export function getDoctorAccountEmail(
  profile: Pick<DoctorProfile, 'personal_email'> & { user?: AdminDoctorProfile['user'] },
): string {
  return profile.user?.email ?? profile.personal_email ?? '—';
}
