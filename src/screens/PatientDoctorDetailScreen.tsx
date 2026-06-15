import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SlotChip from '../components/SlotChip';
import WeekCalendar from '../components/WeekCalendar';
import { MainStackParamList } from '../navigation/types';
import {
  fetchDoctorProfileForPatient,
  fetchDoctorSlotsForPatient,
} from '../services/availabilityService';
import { colors } from '../theme/colors';
import type { AppointmentSlot, PublicDoctor } from '../types/availability';
import { groupSlotsByDate, toApiDate } from '../utils/availability';
import { getApiErrorMessage } from '../utils/apiError';
import { getDoctorDisplayName } from '../utils/publicDoctor';

type Props = NativeStackScreenProps<MainStackParamList, 'DoctorDetail'>;

export default function PatientDoctorDetailScreen({ route }: Props) {
  const { userId, doctor: initialDoctor } = route.params;
  const [doctor, setDoctor] = useState<PublicDoctor | null>(initialDoctor ?? null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  const weekRange = useMemo(() => {
    const from = new Date(selectedDate);
    from.setDate(from.getDate() - from.getDay());
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from: toApiDate(from), to: toApiDate(to) };
  }, [selectedDate]);

  const loadDoctorDetails = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const profile = await fetchDoctorProfileForPatient(userId);
      setDoctor(profile);
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setLoadingProfile(false);
    }
  }, [userId]);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const data = await fetchDoctorSlotsForPatient(userId, weekRange);
      setDoctor(data.doctor);
      setSlots(data.slots);
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setLoadingSlots(false);
    }
  }, [userId, weekRange]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadDoctorDetails(), loadSlots()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadDoctorDetails, loadSlots]);

  useEffect(() => {
    void loadDoctorDetails();
  }, [loadDoctorDetails]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const slotsByDate = useMemo(() => groupSlotsByDate(slots), [slots]);
  const selectedDateKey = toApiDate(selectedDate);
  const daySlots = slotsByDate[selectedDateKey] ?? [];

  const handleSelectSlot = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
    Alert.alert(
      'Slot selected',
      'Booking will be available in a future update. Your slot id has been saved for the next step.',
    );
  };

  if (loadingProfile && !doctor) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refreshAll()} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {doctor?.first_name?.charAt(0) ?? '?'}
              {doctor?.last_name?.charAt(0) ?? ''}
            </Text>
          </View>
          <Text style={styles.name}>{doctor ? getDoctorDisplayName(doctor) : 'Doctor'}</Text>
          <Text style={styles.profession}>{doctor?.profession ?? 'General practice'}</Text>
          {doctor?.service_name ? <Text style={styles.service}>{doctor.service_name}</Text> : null}
          <View style={styles.approvedBadge}>
            <Text style={styles.approvedBadgeText}>Approved doctor</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctor details</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Specialty</Text>
              <Text style={styles.detailValue}>{doctor?.profession ?? '—'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{doctor?.service_name ?? '—'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available slots</Text>
          <Text style={styles.sectionSubtitle}>Pick a day to see open appointment times.</Text>

          <WeekCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onWeekChange={setSelectedDate}
          />

          {loadingSlots ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : daySlots.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No open slots</Text>
              <Text style={styles.emptyText}>Try another day or check back later.</Text>
            </View>
          ) : (
            <View style={styles.slotGrid}>
              {daySlots.map((slot) => (
                <SlotChip
                  key={slot.id}
                  slot={slot}
                  selected={selectedSlot?.id === slot.id}
                  onPress={() => handleSelectSlot(slot)}
                />
              ))}
            </View>
          )}
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
  profileCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  profession: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  service: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  approvedBadge: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  approvedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -6,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  loader: {
    marginTop: 8,
  },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
