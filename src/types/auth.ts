export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type UserRole = 'patient' | 'doctor' | 'admin';
export type SignupRole = 'patient' | 'doctor';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_no: string;
  role: UserRole;
  gender: Gender | null;
  date_of_birth: string | null;
  profile_image_url?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_no: string;
  role: SignupRole;
  gender?: Gender;
  date_of_birth?: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_no?: string;
  gender?: Gender | null;
  date_of_birth?: string | null;
  profile_image_url?: string | null;
}
