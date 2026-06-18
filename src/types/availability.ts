export type SlotDuration = 'thirty_min' | 'one_hour';

export interface AppointmentSlot {
  id: string;
  availability_id: string;
  doctor_profile_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface DoctorAvailability {
  id: string;
  doctor_profile_id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: SlotDuration;
  created_at: string;
  updated_at: string;
  slots: AppointmentSlot[];
}

export interface CreateAvailabilityPayload {
  date: string;
  start_time: string;
  end_time: string;
  slot_duration: SlotDuration;
}

export interface PublicDoctor {
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string | null;
  profession: string | null;
  service: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  profile_image_url?: string | null;
}

export interface PatientDoctorSlotsResponse {
  doctor: PublicDoctor;
  slots: AppointmentSlot[];
}
