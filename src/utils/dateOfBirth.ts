export function formatDateOfBirth(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function parseDateOfBirth(isoDate: string | null | undefined): Date | undefined {
  if (!isoDate) return undefined;

  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function toDateOfBirthPayload(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}
