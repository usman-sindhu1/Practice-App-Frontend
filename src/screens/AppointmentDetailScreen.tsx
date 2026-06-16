import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  APPOINTMENT_STATUS_COLORS,
  formatAppointmentStatus,
} from '../constants/appointment';
import { useAuth } from '../context/AuthContext';
import { AdminStackParamList, MainStackParamList } from '../navigation/types';
import {
  fetchDoctorAppointment,
  fetchPatientAppointment,
  updateAppointmentStatus,
} from '../services/appointmentService';
import { colors } from '../theme/colors';
import type { Appointment } from '../types/appointment';
import { getApiErrorMessage } from '../utils/apiError';
import { formatDateOfBirth } from '../utils/dateOfBirth';

type MainProps = NativeStackScreenProps<MainStackParamList, 'AppointmentDetail'>;
type AdminProps = NativeStackScreenProps<AdminStackParamList, 'AppointmentDetail'>;
type Props = MainProps | AdminProps;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export default function AppointmentDetailScreen({ route, navigation }: Props) {
  const { appointmentId } = route.params;
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadAppointment = useCallback(async () => {
    setLoading(true);
    try {
      const data = isDoctor
        ? await fetchDoctorAppointment(appointmentId)
        : await fetchPatientAppointment(appointmentId);
      setAppointment(data);
      setRejectionReason(data.rejection_reason ?? '');
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error), [
        { text: 'Go back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, isDoctor, navigation]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    void loadAppointment();
  }, [isAdmin, loadAppointment]);

  useEffect(() => {
    if (!isAdmin) return;

    const adminAppointment = (route.params as AdminProps['route']['params']).appointment;
    setAppointment(adminAppointment);
    setRejectionReason(adminAppointment.rejection_reason ?? '');
    setLoading(false);
  }, [isAdmin, route.params]);

  const handleApprove = () => {
    if (!appointment) return;

    Alert.alert('Approve appointment', 'Confirm this appointment for the patient and doctor?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          void (async () => {
            setActionLoading(true);
            try {
              const updated = await updateAppointmentStatus(appointment.id, { action: 'approve' });
              setAppointment(updated);
              Alert.alert('Approved', 'Appointment has been approved.');
            } catch (error) {
              Alert.alert('Action failed', getApiErrorMessage(error));
            } finally {
              setActionLoading(false);
            }
          })();
        },
      },
    ]);
  };

  const handleReject = () => {
    if (!appointment) return;

    if (!rejectionReason.trim()) {
      Alert.alert('Rejection reason required', 'Please enter a reason before rejecting.');
      return;
    }

    Alert.alert('Reject appointment', 'Reject this appointment and release the time slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setActionLoading(true);
            try {
              const updated = await updateAppointmentStatus(appointment.id, {
                action: 'reject',
                rejection_reason: rejectionReason.trim(),
              });
              setAppointment(updated);
              Alert.alert('Rejected', 'Appointment has been rejected.');
            } catch (error) {
              Alert.alert('Action failed', getApiErrorMessage(error));
            } finally {
              setActionLoading(false);
            }
          })();
        },
      },
    ]);
  };

  if (loading || !appointment) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.doctorName}>{appointment.doctor_info.doctor}</Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {formatAppointmentStatus(appointment.status)}
            </Text>
          </View>
          <Text style={styles.date}>{appointment.appointment_info.date}</Text>
          <Text style={styles.time}>{appointment.appointment_info.time}</Text>
          {appointment.status === 'rejected' && appointment.rejection_reason ? (
            <Text style={styles.rejectionReason}>{appointment.rejection_reason}</Text>
          ) : null}
        </View>

        <Section title="Personal Info">
          <DetailRow label="Name" value={appointment.personal_info.name} />
          <DetailRow label="Email" value={appointment.personal_info.email} />
          <DetailRow label="Phone" value={appointment.personal_info.phone} />
          <DetailRow label="Sex" value={appointment.personal_info.sex} />
          <DetailRow label="Age" value={String(appointment.personal_info.age)} />
        </Section>

        <Section title="Appointment Info">
          <DetailRow label="Patient" value={appointment.appointment_info.patient} />
          <DetailRow label="Date" value={appointment.appointment_info.date} />
          <DetailRow label="Time" value={appointment.appointment_info.time} />
        </Section>

        <Section title="Medical Info">
          <DetailRow
            label="First therapy"
            value={appointment.medical_info.is_first_therapy ? 'Yes' : 'No'}
          />
          <DetailRow
            label="Taking medicine"
            value={appointment.medical_info.is_taking_medicine ? 'Yes' : 'No'}
          />
          {appointment.medical_info.last_visit_date ? (
            <DetailRow
              label="Last visit"
              value={formatDateOfBirth(appointment.medical_info.last_visit_date)}
            />
          ) : null}
          <DetailRow label="Pre condition" value={appointment.medical_info.pre_condition} />
          <DetailRow label="Current condition" value={appointment.medical_info.current_condition} />
        </Section>

        <Section title="Doctor Info">
          <DetailRow label="Doctor" value={appointment.doctor_info.doctor} />
          <DetailRow label="Specialty" value={appointment.doctor_info.specialty} />
          <DetailRow label="Service" value={appointment.doctor_info.service} />
        </Section>

        {isAdmin && appointment.status === 'pending' ? (
          <View style={styles.adminActions}>
            <Text style={styles.sectionTitle}>Admin actions</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Rejection reason</Text>
              <TextInput
                style={styles.input}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Required if rejecting"
                multiline
              />
            </View>
            <Pressable
              style={styles.approveButton}
              onPress={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.approveButtonText}>Approve</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={actionLoading}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
  },
  time: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  rejectionReason: {
    fontSize: 14,
    color: colors.danger,
    marginTop: 4,
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  adminActions: {
    gap: 12,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  approveButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  approveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  rejectButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
