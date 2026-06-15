import type { SignupRole, UserRole } from '../types/auth';

const ROLE_LABELS: Record<UserRole, string> = {
  patient: 'Patient',
  doctor: 'Doctor',
  admin: 'Admin',
};

export const SIGNUP_ROLE_OPTIONS: { value: SignupRole; label: string }[] = [
  { value: 'patient', label: ROLE_LABELS.patient },
  { value: 'doctor', label: ROLE_LABELS.doctor },
];

export function formatRole(role: UserRole | null | undefined): string {
  if (!role) return '—';
  return ROLE_LABELS[role] ?? role;
}
