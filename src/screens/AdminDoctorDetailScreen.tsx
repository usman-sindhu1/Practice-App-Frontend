import { useCallback, useEffect, useState } from 'react';
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
  DOCTOR_STATUS_COLORS,
  formatDoctorStatus,
  getDoctorDisplayName,
} from '../constants/doctorProfile';
import { AdminStackParamList } from '../navigation/types';
import { fetchDoctorByUserId, updateDoctorStatus } from '../services/adminService';
import { colors } from '../theme/colors';
import type { AdminDoctorProfile } from '../types/doctor';
import { getApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDoctorDetail'>;

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

export default function AdminDoctorDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [doctor, setDoctor] = useState<AdminDoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDoctor = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDoctorByUserId(userId);
      setDoctor(data);
      setRejectionReason(data.rejection_reason ?? '');
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error), [
        { text: 'Go back', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [navigation, userId]);

  useEffect(() => {
    void loadDoctor();
  }, [loadDoctor]);

  const handleApprove = () => {
    Alert.alert('Approve doctor', 'Grant this doctor full access?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          void (async () => {
            setActionLoading(true);
            try {
              const updated = await updateDoctorStatus(userId, { action: 'approve' });
              setDoctor(updated);
              Alert.alert('Approved', 'Doctor profile has been approved.');
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
    if (!rejectionReason.trim()) {
      Alert.alert('Rejection reason required', 'Please enter a reason before rejecting.');
      return;
    }

    Alert.alert('Reject doctor', 'Reject this profile submission?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setActionLoading(true);
            try {
              const updated = await updateDoctorStatus(userId, {
                action: 'reject',
                rejection_reason: rejectionReason.trim(),
              });
              setDoctor(updated);
              Alert.alert('Rejected', 'Doctor has been notified to resubmit.');
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

  if (loading || !doctor) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isPending = doctor.status === 'pending';

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={[styles.statusValue, { color: DOCTOR_STATUS_COLORS[doctor.status] }]}>
            {formatDoctorStatus(doctor.status)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          <InfoRow
            label="Name"
            value={
              doctor.user
                ? `${doctor.user.first_name} ${doctor.user.last_name}`
                : getDoctorDisplayName(doctor)
            }
          />
          <InfoRow label="Email" value={doctor.user?.email} />
          <InfoRow label="Phone" value={doctor.user?.phone_no} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal & Contact</Text>
          <InfoRow label="Full name" value={doctor.full_name} />
          <InfoRow label="Personal contact" value={doctor.personal_contact_no} />
          <InfoRow label="Personal email" value={doctor.personal_email} />
          <InfoRow label="Address" value={doctor.address} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Professional Contact</Text>
          <InfoRow label="Professional contact" value={doctor.professional_contact_no} />
          <InfoRow label="Professional email" value={doctor.professional_email} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Education</Text>
          <InfoRow label="Degree" value={doctor.degree_title} />
          <InfoRow label="Institute" value={doctor.institute_name} />
          <InfoRow label="Years" value={`${doctor.start_year ?? '—'} – ${doctor.completion_year ?? '—'}`} />
          <InfoRow label="Institute address" value={doctor.institute_address} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>General</Text>
          <InfoRow label="Profession" value={doctor.profession} />
          <InfoRow label="Languages" value={doctor.language} />
          <InfoRow label="Service" value={doctor.service_name} />
        </View>

        {doctor.rejection_reason ? (
          <View style={styles.rejectionCard}>
            <Text style={styles.rejectionTitle}>Rejection reason</Text>
            <Text style={styles.rejectionText}>{doctor.rejection_reason}</Text>
          </View>
        ) : null}

        {isPending ? (
          <View style={styles.actions}>
            <Text style={styles.actionsTitle}>Review actions</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Rejection reason (required to reject)"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
            />
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
    gap: 14,
    paddingBottom: 32,
  },
  statusBanner: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  infoRow: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  rejectionCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  rejectionText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
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
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
