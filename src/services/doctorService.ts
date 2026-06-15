import { API_CONFIG } from '../config/api';
import { api } from './api';
import type { DoctorProfile, SubmitDoctorProfilePayload } from '../types/doctor';

export async function fetchDoctorProfile(): Promise<DoctorProfile> {
  const { data } = await api.get<DoctorProfile>(API_CONFIG.ENDPOINTS.DOCTOR_PROFILE);
  return data;
}

export async function submitDoctorProfile(
  payload: SubmitDoctorProfilePayload,
): Promise<DoctorProfile> {
  const { data } = await api.post<DoctorProfile>(API_CONFIG.ENDPOINTS.DOCTOR_PROFILE, payload);
  return data;
}
