import { API_CONFIG } from '../config/api';
import { api } from './api';
import type {
  AppointmentSlot,
  CreateAvailabilityPayload,
  DoctorAvailability,
  PatientDoctorSlotsResponse,
  PublicDoctor,
} from '../types/availability';
import { normalizeApprovedDoctors } from '../utils/publicDoctor';
import { isAxiosError } from 'axios';

type DateRangeParams = {
  from?: string;
  to?: string;
};

function buildQuery(params?: DateRangeParams): string {
  if (!params?.from && !params?.to) return '';
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  return `?${search.toString()}`;
}

export async function createAvailability(
  payload: CreateAvailabilityPayload,
): Promise<DoctorAvailability> {
  const { data } = await api.post<DoctorAvailability>(
    API_CONFIG.ENDPOINTS.DOCTOR_AVAILABILITY,
    payload,
  );
  return data;
}

export async function fetchMyAvailabilities(
  params?: DateRangeParams,
): Promise<DoctorAvailability[]> {
  const { data } = await api.get<DoctorAvailability[]>(
    `${API_CONFIG.ENDPOINTS.DOCTOR_AVAILABILITY}${buildQuery(params)}`,
  );
  return data;
}

export async function fetchMySlots(params?: DateRangeParams): Promise<AppointmentSlot[]> {
  const { data } = await api.get<AppointmentSlot[]>(
    `${API_CONFIG.ENDPOINTS.DOCTOR_AVAILABILITY_SLOTS}${buildQuery(params)}`,
  );
  return data;
}

export async function deleteAvailability(availabilityId: string): Promise<void> {
  await api.delete(`${API_CONFIG.ENDPOINTS.DOCTOR_AVAILABILITY}/${availabilityId}`);
}

async function requestApprovedDoctors(path: string): Promise<PublicDoctor[]> {
  const { data } = await api.get<unknown>(path);
  return normalizeApprovedDoctors(data);
}

export async function fetchApprovedDoctors(): Promise<PublicDoctor[]> {
  const endpoints = [API_CONFIG.ENDPOINTS.DOCTORS_APPROVED, API_CONFIG.ENDPOINTS.DOCTORS];

  let lastError: unknown;
  for (const path of endpoints) {
    try {
      return await requestApprovedDoctors(path);
    } catch (error) {
      lastError = error;
      if (!isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError;
}

export async function fetchDoctorProfileForPatient(userId: string): Promise<PublicDoctor> {
  try {
    const { data } = await api.get<PublicDoctor>(API_CONFIG.ENDPOINTS.DOCTOR_PUBLIC_PROFILE(userId));
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      const slotsResponse = await fetchDoctorSlotsForPatient(userId);
      return slotsResponse.doctor;
    }
    throw error;
  }
}

export async function fetchDoctorSlotsForPatient(
  userId: string,
  params?: DateRangeParams,
): Promise<PatientDoctorSlotsResponse> {
  const { data } = await api.get<PatientDoctorSlotsResponse>(
    `${API_CONFIG.ENDPOINTS.DOCTOR_SLOTS(userId)}${buildQuery(params)}`,
  );
  return data;
}
