import type { Gender } from './auth';

export interface BookingDoctorInfo {
  doctorUserId: string;
  doctorName: string;
  specialty: string;
  serviceName: string;
}

export interface BookingSlotInfo {
  slotId: string;
  slotLabel: string;
  slotStartTime: string;
  slotEndTime: string;
  appointmentDate: string;
}

export interface BookingPatientSelection {
  patientType: 'me' | 'someone_else';
  age: number;
}

export interface BookingPersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  age: number;
}

export interface BookingMedicalInfo {
  isFirstTherapy: boolean;
  isTakingMedicine: boolean;
  lastVisitDate: string | null;
  preCondition: string;
  currentCondition: string;
}

export interface BookingDraft {
  doctor: BookingDoctorInfo;
  slot: BookingSlotInfo;
  patientSelection?: BookingPatientSelection;
  personal?: BookingPersonalInfo;
  medical?: BookingMedicalInfo;
}

export interface BookingContext {
  doctor: BookingDoctorInfo;
  slot: BookingSlotInfo;
  patientSelection: BookingPatientSelection;
  personal: BookingPersonalInfo;
  medical: BookingMedicalInfo;
}

export function formatAppointmentDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getAppointmentDateFromSlot(startTime: string): string {
  const date = new Date(startTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function buildBookingContext(draft: BookingDraft): BookingContext {
  if (!draft.patientSelection || !draft.personal || !draft.medical) {
    throw new Error('Booking draft is incomplete');
  }

  return {
    doctor: draft.doctor,
    slot: draft.slot,
    patientSelection: draft.patientSelection,
    personal: draft.personal,
    medical: draft.medical,
  };
}
