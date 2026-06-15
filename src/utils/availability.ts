import type { AppointmentSlot, SlotDuration } from '../types/availability';

export function toApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toApiTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseApiTime(time: string, baseDate = new Date()): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatSlotTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatSlotRange(slot: Pick<AppointmentSlot, 'start_time' | 'end_time'>): string {
  return `${formatSlotTime(slot.start_time)} – ${formatSlotTime(slot.end_time)}`;
}

export function getSlotDurationMinutes(slot: Pick<AppointmentSlot, 'start_time' | 'end_time'>): number {
  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  return (end.getTime() - start.getTime()) / (1000 * 60);
}

export function formatSlotDurationLabel(minutes: number): string {
  if (minutes === 60) return '1 hour';
  if (minutes === 30) return '30 min';
  return `${minutes} min`;
}

export function getDurationMinutes(slotDuration: SlotDuration): number {
  return slotDuration === 'one_hour' ? 60 : 30;
}

export function previewSlotCount(
  startTime: string,
  endTime: string,
  slotDuration: SlotDuration,
): number | null {
  const start = parseApiTime(startTime);
  const end = parseApiTime(endTime);
  const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

  if (totalMinutes <= 0) return null;

  const duration = getDurationMinutes(slotDuration);
  if (totalMinutes % duration !== 0) return null;

  return totalMinutes / duration;
}

export function getDateKeyFromIso(iso: string): string {
  return iso.split('T')[0];
}

export function groupSlotsByDate<T extends Pick<AppointmentSlot, 'start_time'>>(
  slots: T[],
): Record<string, T[]> {
  return slots.reduce<Record<string, T[]>>((acc, slot) => {
    const date = getDateKeyFromIso(slot.start_time);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});
}

export function getWeekDates(anchor: Date): Date[] {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare < today;
}

export function formatWeekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatDayNumber(date: Date): string {
  return String(date.getDate());
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
