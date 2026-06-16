import type { Gender } from './auth';
import type { Service } from './service';

export type DoctorProfileStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface DoctorProfile {
  id: string;
  user_id: string;
  status: DoctorProfileStatus;
  full_name: string | null;
  personal_contact_no: string | null;
  personal_email: string | null;
  address: string | null;
  professional_contact_no: string | null;
  professional_email: string | null;
  degree_title: string | null;
  institute_name: string | null;
  start_year: number | null;
  completion_year: number | null;
  institute_address: string | null;
  profession: string | null;
  language: string | null;
  service_id: string | null;
  service: Service | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmitDoctorProfilePayload {
  full_name: string;
  personal_contact_no: string;
  personal_email: string;
  address: string;
  professional_contact_no: string;
  professional_email: string;
  degree_title: string;
  institute_name: string;
  start_year: number;
  completion_year: number;
  institute_address: string;
  profession: string;
  language: string;
  service_id: string;
}

export interface AdminDoctorUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  gender: Gender | null;
  date_of_birth: string | null;
}

export interface AdminDoctorProfile extends DoctorProfile {
  user?: AdminDoctorUser;
}

export type DoctorStatusAction = 'approve' | 'reject';

export interface UpdateDoctorStatusPayload {
  action: DoctorStatusAction;
  rejection_reason?: string;
}
