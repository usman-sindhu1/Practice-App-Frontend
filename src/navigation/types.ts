import type { PublicDoctor } from '../types/availability';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  ProfileSettings: undefined;
  DoctorAvailability: undefined;
  FindDoctors: undefined;
  DoctorDetail: { userId: string; doctor?: PublicDoctor };
};

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminDoctors: undefined;
  AdminDoctorDetail: { userId: string };
  ProfileSettings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
