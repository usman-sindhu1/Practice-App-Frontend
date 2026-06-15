import { API_CONFIG } from '../config/api';
import { api } from './api';
import type { AdminDoctorProfile, UpdateDoctorStatusPayload } from '../types/doctor';

export async function fetchAllDoctors(): Promise<AdminDoctorProfile[]> {
  const { data } = await api.get<AdminDoctorProfile[]>(API_CONFIG.ENDPOINTS.ADMIN_DOCTORS);
  return data;
}

export async function fetchDoctorByUserId(userId: string): Promise<AdminDoctorProfile> {
  const { data } = await api.get<AdminDoctorProfile>(
    `${API_CONFIG.ENDPOINTS.ADMIN_DOCTORS}/${userId}`,
  );
  return data;
}

export async function updateDoctorStatus(
  userId: string,
  payload: UpdateDoctorStatusPayload,
): Promise<AdminDoctorProfile> {
  const { data } = await api.patch<AdminDoctorProfile>(
    API_CONFIG.ENDPOINTS.ADMIN_DOCTOR_STATUS(userId),
    payload,
  );
  return data;
}
