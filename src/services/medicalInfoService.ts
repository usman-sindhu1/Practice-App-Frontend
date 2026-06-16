import { API_CONFIG } from '../config/api';
import type { PatientMedicalInfo, UpsertMedicalInfoPayload } from '../types/medicalInfo';
import { api } from './api';

export async function fetchPatientMedicalInfo(): Promise<PatientMedicalInfo> {
  const { data } = await api.get<PatientMedicalInfo>(API_CONFIG.ENDPOINTS.PATIENT_MEDICAL_INFO);
  return data;
}

export async function upsertPatientMedicalInfo(
  payload: UpsertMedicalInfoPayload,
): Promise<PatientMedicalInfo> {
  const { data } = await api.put<PatientMedicalInfo>(
    API_CONFIG.ENDPOINTS.PATIENT_MEDICAL_INFO,
    payload,
  );
  return data;
}
