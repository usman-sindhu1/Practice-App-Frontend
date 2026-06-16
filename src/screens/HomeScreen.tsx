import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatGender } from '../constants/gender';
import { formatRole } from '../constants/role';
import { useAuth } from '../context/AuthContext';
import { AdminStackParamList, MainStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { formatDateOfBirth } from '../utils/dateOfBirth';

type PatientHomeProps = NativeStackScreenProps<MainStackParamList, 'Home'>;
type AdminHomeProps = NativeStackScreenProps<AdminStackParamList, 'AdminHome'>;
type Props = PatientHomeProps | AdminHomeProps;

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.charAt(0) ?? '';
  const last = lastName?.charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || '?';
}

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const openProfileSettings = () => {
    if (isAdmin) {
      (navigation as AdminHomeProps['navigation']).navigate('ProfileSettings');
      return;
    }
    (navigation as PatientHomeProps['navigation']).navigate('ProfileSettings');
  };
  const openAdminDoctors = () => {
    if (isAdmin) {
      (navigation as AdminHomeProps['navigation']).navigate('AdminDoctors');
    }
  };
  const openAdminServices = () => {
    if (isAdmin) {
      (navigation as AdminHomeProps['navigation']).navigate('AdminServices');
    }
  };
  const openDoctorAvailability = () => {
    (navigation as PatientHomeProps['navigation']).navigate('DoctorAvailability');
  };
  const openFindDoctors = () => {
    (navigation as PatientHomeProps['navigation']).navigate('FindDoctors');
  };
  const openPatientAppointments = () => {
    (navigation as PatientHomeProps['navigation']).navigate('PatientAppointments');
  };
  const openDoctorAppointments = () => {
    (navigation as PatientHomeProps['navigation']).navigate('DoctorAppointments');
  };
  const openAdminAppointments = () => {
    if (isAdmin) {
      (navigation as AdminHomeProps['navigation']).navigate('AdminAppointments');
    }
  };

  const fullName = user ? `${user.first_name} ${user.last_name}` : 'Guest';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.first_name, user?.last_name)}
            </Text>
          </View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.first_name ?? 'User'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{formatRole(user?.role)}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full name</Text>
            <Text style={styles.infoValue}>{fullName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
          </View>
          {!isAdmin ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone_no ?? '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{formatGender(user?.gender)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of birth</Text>
                <Text style={styles.infoValue}>{formatDateOfBirth(user?.date_of_birth)}</Text>
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.actions}>
          {isDoctor ? (
            <Pressable style={styles.actionButton} onPress={openDoctorAppointments}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📋</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Appointments</Text>
                <Text style={styles.actionSubtitle}>View approved patient bookings</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isDoctor ? (
            <Pressable style={styles.actionButton} onPress={openDoctorAvailability}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📅</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Manage Availability</Text>
                <Text style={styles.actionSubtitle}>Create appointment slots on your calendar</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isPatient ? (
            <Pressable style={styles.actionButton} onPress={openPatientAppointments}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📋</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>My Appointments</Text>
                <Text style={styles.actionSubtitle}>View pending, approved, and rejected bookings</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isPatient ? (
            <Pressable style={styles.actionButton} onPress={openFindDoctors}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🩺</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Find a Doctor</Text>
                <Text style={styles.actionSubtitle}>Browse open appointment slots</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isAdmin ? (
            <Pressable style={styles.actionButton} onPress={openAdminAppointments}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📅</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Appointments</Text>
                <Text style={styles.actionSubtitle}>Approve or reject booking requests</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isAdmin ? (
            <Pressable style={styles.actionButton} onPress={openAdminDoctors}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🩺</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Doctor Applications</Text>
                <Text style={styles.actionSubtitle}>Review, approve, or reject doctors</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          {isAdmin ? (
            <Pressable style={styles.actionButton} onPress={openAdminServices}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📋</Text>
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Services Catalog</Text>
                <Text style={styles.actionSubtitle}>Add, activate, or remove services</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.actionButton} onPress={openProfileSettings}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Profile Settings</Text>
              <Text style={styles.actionSubtitle}>
                {isAdmin ? 'Update your name' : 'Update name, phone & more'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <View style={[styles.actionIcon, styles.logoutIcon]}>
              <Text style={styles.actionIconText}>↪</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.logoutText]}>Logout</Text>
              <Text style={styles.actionSubtitle}>Sign out of your account</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    gap: 20,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  greeting: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  email: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 18,
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
  logoutButton: {
    marginBottom: 8,
  },
  logoutIcon: {
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: colors.danger,
  },
});
