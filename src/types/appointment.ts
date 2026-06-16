export type AppointmentStatus = 'pending' | 'approved' | 'rejected';

export interface AppointmentPersonalInfo {
  name: string;
  email: string;
  phone: string;
  sex: string;
  age: number;
}

export interface AppointmentVisitInfo {
  patient: string;
  date: string;
  time: string;
  start_time: string;
  end_time: string;
}

export interface AppointmentMedicalInfo {
  is_first_therapy: boolean;
  is_taking_medicine: boolean;
  last_visit_date: string | null;
  pre_condition: string;
  current_condition: string;
}

export interface AppointmentDoctorInfo {
  doctor: string;
  specialty: string;
  service: string;
  service_id: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_user_id: string;
  doctor_profile_id: string;
  slot_id: string;
  status: AppointmentStatus;
  rejection_reason: string | null;
  terms_accepted: boolean;
  personal_info: AppointmentPersonalInfo;
  appointment_info: AppointmentVisitInfo;
  medical_info: AppointmentMedicalInfo;
  doctor_info: AppointmentDoctorInfo;
  created_at: string;
  updated_at: string;
}

export interface BookAppointmentPayload {
  slot_id: string;
  doctor_user_id: string;
  terms_accepted: boolean;
}

export type AppointmentStatusFilter = 'pending' | 'approved' | 'rejected';

export interface UpdateAppointmentStatusPayload {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}
