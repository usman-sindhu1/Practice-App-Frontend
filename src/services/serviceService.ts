import { API_CONFIG } from '../config/api';
import { api } from './api';
import type { Service } from '../types/service';

export interface UpsertServicePayload {
  name?: string;
  description?: string | null;
  is_active?: boolean;
}

export async function fetchActiveServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>(API_CONFIG.ENDPOINTS.SERVICES);
  return data;
}

export async function fetchAdminServices(): Promise<Service[]> {
  const { data } = await api.get<Service[]>(API_CONFIG.ENDPOINTS.ADMIN_SERVICES);
  return data;
}

export async function createService(payload: UpsertServicePayload): Promise<Service> {
  const { data } = await api.post<Service>(API_CONFIG.ENDPOINTS.ADMIN_SERVICES, payload);
  return data;
}

export async function updateService(
  serviceId: string,
  payload: UpsertServicePayload,
): Promise<Service> {
  const { data } = await api.patch<Service>(API_CONFIG.ENDPOINTS.ADMIN_SERVICE(serviceId), payload);
  return data;
}

export async function deleteService(serviceId: string): Promise<void> {
  await api.delete(API_CONFIG.ENDPOINTS.ADMIN_SERVICE(serviceId));
}
