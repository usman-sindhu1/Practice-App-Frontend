import type { PublicDoctor } from '../types/availability';
import type { Appointment } from '../types/appointment';
import type { BookingContext, BookingDraft } from '../types/booking';

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
  BookAppointment: {
    booking: BookingDraft;
  };
  BookAppointmentDetails: {
    booking: BookingDraft;
  };
  BookAppointmentReview: {
    booking: BookingContext;
  };
  PatientAppointments: undefined;
  DoctorAppointments: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminDoctors: undefined;
  AdminServices: undefined;
  AdminAppointments: undefined;
  AdminDoctorDetail: { userId: string };
  ProfileSettings: undefined;
  AppointmentDetail: { appointmentId: string; appointment: Appointment };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends MainStackParamList {}
  }
}
