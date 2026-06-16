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
import {
  DOCTOR_STATUS_COLORS,
  formatDoctorStatus,
  getDoctorAccountEmail,
  getDoctorDisplayName,
} from '../constants/doctorProfile';
import { AdminStackParamList } from '../navigation/types';
import { fetchAllDoctors } from '../services/adminService';
import { colors } from '../theme/colors';
import type { AdminDoctorProfile } from '../types/doctor';
import { getApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDoctors'>;

function StatusBadge({ status }: { status: AdminDoctorProfile['status'] }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${DOCTOR_STATUS_COLORS[status]}20` }]}>
      <Text style={[styles.badgeText, { color: DOCTOR_STATUS_COLORS[status] }]}>
        {formatDoctorStatus(status)}
      </Text>
    </View>
  );
}

export default function AdminDoctorsScreen({ navigation }: Props) {
  const [doctors, setDoctors] = useState<AdminDoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAllDoctors();
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

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
        data={doctors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadDoctors(true)} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Doctor Applications</Text>
            <Text style={styles.headerSubtitle}>
              Review and approve or reject doctor profiles.
            </Text>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No doctor profiles yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('AdminDoctorDetail', { userId: item.user_id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{getDoctorDisplayName(item)}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text style={styles.cardEmail}>{getDoctorAccountEmail(item)}</Text>
            {item.profession ? <Text style={styles.cardMeta}>{item.profession}</Text> : null}
            {item.service?.name ? <Text style={styles.cardMeta}>Service: {item.service.name}</Text> : null}
            <Text style={styles.chevron}>›</Text>
          </Pressable>
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
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
    fontSize: 22,
    color: colors.textMuted,
  },
});
