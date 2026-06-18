export interface PatientMedicalInfo {
  id?: string;
  user_id: string;
  is_first_therapy: boolean | null;
  is_taking_medicine: boolean | null;
  last_visit_date: string | null;
  pre_condition: string | null;
  current_condition: string | null;
  document_urls: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UpsertMedicalInfoPayload {
  is_first_therapy: boolean;
  is_taking_medicine: boolean;
  last_visit_date?: string;
  pre_condition: string;
  current_condition: string;
  document_urls?: string[];
}
