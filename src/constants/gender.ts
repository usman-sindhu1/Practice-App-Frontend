import type { Gender } from '../types/auth';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function formatGender(gender: Gender | null | undefined): string {
  if (!gender) return '—';
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label ?? gender;
}
