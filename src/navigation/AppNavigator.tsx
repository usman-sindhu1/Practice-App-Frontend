import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import {
  AdminAppointmentsScreen,
  AdminDoctorDetailScreen,
  AdminDoctorsScreen,
  AdminServicesScreen,
  AppointmentDetailScreen,
  BookAppointmentDetailsScreen,
  BookAppointmentReviewScreen,
  BookAppointmentScreen,
  DoctorAppointmentsScreen,
  DoctorAvailabilityScreen,
  DoctorCompleteProfileScreen,
  DoctorProfileUnderReviewScreen,
  PatientAppointmentsScreen,
  PatientDoctorDetailScreen,
  PatientFindDoctorsScreen,
  ProfileSettingsScreen,
} from '../screens';
import {
  AdminStackParamList,
  AuthStackParamList,
  MainStackParamList,
} from './types';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: '#2563eb' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={headerOptions}>
      <MainStack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <MainStack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{ title: 'Profile Settings' }}
      />
      <MainStack.Screen
        name="DoctorAvailability"
        component={DoctorAvailabilityScreen}
        options={{ title: 'Availability' }}
      />
      <MainStack.Screen
        name="FindDoctors"
        component={PatientFindDoctorsScreen}
        options={{ title: 'Find a Doctor' }}
      />
      <MainStack.Screen
        name="DoctorDetail"
        component={PatientDoctorDetailScreen}
        options={{ title: 'Doctor Profile' }}
      />
      <MainStack.Screen
        name="BookAppointment"
        component={BookAppointmentScreen}
        options={{ title: 'Book Appointment' }}
      />
      <MainStack.Screen
        name="BookAppointmentDetails"
        component={BookAppointmentDetailsScreen}
        options={{ title: 'Book Appointment' }}
      />
      <MainStack.Screen
        name="BookAppointmentReview"
        component={BookAppointmentReviewScreen}
        options={{ title: 'Book Appointment' }}
      />
      <MainStack.Screen
        name="PatientAppointments"
        component={PatientAppointmentsScreen}
        options={{ title: 'My Appointments' }}
      />
      <MainStack.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <MainStack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Appointment Details' }}
      />
    </MainStack.Navigator>
  );
}

function DoctorGate() {
  const { doctorProfile } = useAuth();

  if (doctorProfile?.status === 'pending') {
    return <DoctorProfileUnderReviewScreen />;
  }

  return <DoctorCompleteProfileScreen />;
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={headerOptions}>
      <AdminStack.Screen name="AdminHome" component={HomeScreen} options={{ title: 'Admin' }} />
      <AdminStack.Screen
        name="AdminDoctors"
        component={AdminDoctorsScreen}
        options={{ title: 'Doctor Applications' }}
      />
      <AdminStack.Screen
        name="AdminServices"
        component={AdminServicesScreen}
        options={{ title: 'Services Catalog' }}
      />
      <AdminStack.Screen
        name="AdminAppointments"
        component={AdminAppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <AdminStack.Screen
        name="AdminDoctorDetail"
        component={AdminDoctorDetailScreen}
        options={{ title: 'Doctor Profile' }}
      />
      <AdminStack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Appointment Details' }}
      />
      <AdminStack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{ title: 'Profile Settings' }}
      />
    </AdminStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}

function AuthenticatedNavigator() {
  const { user, doctorProfile, isDoctorProfileLoading } = useAuth();

  if (user?.role === 'doctor') {
    if (isDoctorProfileLoading) {
      return <LoadingScreen />;
    }

    if (
      !doctorProfile ||
      doctorProfile.status === 'not_submitted' ||
      doctorProfile.status === 'rejected' ||
      doctorProfile.status === 'pending'
    ) {
      return <DoctorGate />;
    }

    return <MainNavigator />;
  }

  if (user?.role === 'admin') {
    return <AdminNavigator />;
  }

  return <MainNavigator />;
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AuthenticatedNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
