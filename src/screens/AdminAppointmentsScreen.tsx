import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppointmentCard from '../components/AppointmentCard';
import { AdminStackParamList } from '../navigation/types';
import { fetchAdminAppointments } from '../services/appointmentService';
import { colors } from '../theme/colors';
import type { Appointment, AppointmentStatusFilter } from '../types/appointment';
import { getApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminAppointments'>;

type FilterOption = 'all' | AppointmentStatusFilter;

const FILTERS: { key: FilterOption; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminAppointmentsScreen({ navigation }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<FilterOption>('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await fetchAdminAppointments(filter === 'all' ? undefined : filter);
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter],
  );

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
          <View style={styles.headerBlock}>
            <Text style={styles.header}>
              Review appointment requests. Pending items need approve or reject action.
            </Text>
            <View style={styles.filterRow}>
              {FILTERS.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filter === item.key && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No appointments</Text>
            <Text style={styles.emptyText}>
              {error ?? 'No appointments match this filter.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            subtitle={`${item.personal_info.name} · ${item.doctor_info.doctor}`}
            onPress={() =>
              navigation.navigate('AppointmentDetail', { appointmentId: item.id, appointment: item })
            }
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
  headerBlock: {
    gap: 12,
    marginBottom: 8,
  },
  header: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
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
