import { API_CONFIG } from '../config/api';
import type {
  Appointment,
  AppointmentStatusFilter,
  BookAppointmentPayload,
  UpdateAppointmentStatusPayload,
} from '../types/appointment';
import { api } from './api';

export async function bookAppointment(payload: BookAppointmentPayload): Promise<Appointment> {
  const { data } = await api.post<Appointment>(API_CONFIG.ENDPOINTS.PATIENT_APPOINTMENTS, payload);
  return data;
}

export async function fetchPatientAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>(API_CONFIG.ENDPOINTS.PATIENT_APPOINTMENTS);
  return data;
}

export async function fetchPatientAppointment(appointmentId: string): Promise<Appointment> {
  const { data } = await api.get<Appointment>(
    API_CONFIG.ENDPOINTS.PATIENT_APPOINTMENT(appointmentId),
  );
  return data;
}

export async function fetchDoctorAppointments(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>(API_CONFIG.ENDPOINTS.DOCTOR_APPOINTMENTS);
  return data;
}

export async function fetchDoctorAppointment(appointmentId: string): Promise<Appointment> {
  const { data } = await api.get<Appointment>(
    API_CONFIG.ENDPOINTS.DOCTOR_APPOINTMENT(appointmentId),
  );
  return data;
}

export async function fetchAdminAppointments(
  status?: AppointmentStatusFilter,
): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>(API_CONFIG.ENDPOINTS.ADMIN_APPOINTMENTS, {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  payload: UpdateAppointmentStatusPayload,
): Promise<Appointment> {
  const { data } = await api.patch<Appointment>(
    API_CONFIG.ENDPOINTS.ADMIN_APPOINTMENT_STATUS(appointmentId),
    payload,
  );
  return data;
}
