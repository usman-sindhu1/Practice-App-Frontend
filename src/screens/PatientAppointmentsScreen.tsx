import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppointmentCard from '../components/AppointmentCard';
import { MainStackParamList } from '../navigation/types';
import { fetchPatientAppointments } from '../services/appointmentService';
import { colors } from '../theme/colors';
import type { Appointment } from '../types/appointment';
import { getApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<MainStackParamList, 'PatientAppointments'>;

export default function PatientAppointmentsScreen({ navigation }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchPatientAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadAppointments(true)} />
        }
        ListHeaderComponent={
          <Text style={styles.header}>
            Your booked appointments. Pending requests wait for admin approval.
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptyText}>
              {error ?? 'Book a doctor from Find a Doctor to get started.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            subtitle={`${item.doctor_info.service} · ${item.personal_info.name}`}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
          />
        )}
      />
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
  list: {
    padding: 20,
    gap: 12,
    paddingBottom: 32,
  },
  header: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 24,
    gap: 8,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
