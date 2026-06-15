import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DurationToggle from '../components/DurationToggle';
import SlotChip from '../components/SlotChip';
import TimePickerInput from '../components/TimePickerInput';
import WeekCalendar from '../components/WeekCalendar';
import {
  createAvailability,
  deleteAvailability,
  fetchMyAvailabilities,
} from '../services/availabilityService';
import { colors } from '../theme/colors';
import type { DoctorAvailability, SlotDuration } from '../types/availability';
import {
  formatSlotRange,
  getDateKeyFromIso,
  previewSlotCount,
  toApiDate,
  toApiTime,
} from '../utils/availability';
import { getApiErrorMessage } from '../utils/apiError';

function defaultStartTime(): Date {
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  return date;
}

function defaultEndTime(): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
}

export default function DoctorAvailabilityScreen() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);
  const [slotDuration, setSlotDuration] = useState<SlotDuration>('thirty_min');

  const weekRange = useMemo(() => {
    const from = new Date(selectedDate);
    from.setDate(from.getDate() - from.getDay());
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    return { from: toApiDate(from), to: toApiDate(to) };
  }, [selectedDate]);

  const loadAvailabilities = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchMyAvailabilities(weekRange);
      setAvailabilities(data);
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [weekRange]);

  useEffect(() => {
    void loadAvailabilities();
  }, [loadAvailabilities]);

  const selectedDateKey = toApiDate(selectedDate);
  const dayAvailabilities = availabilities.filter(
    (item) => getDateKeyFromIso(item.date) === selectedDateKey,
  );

  const startTimeValue = toApiTime(startTime);
  const endTimeValue = toApiTime(endTime);
  const slotPreview = previewSlotCount(startTimeValue, endTimeValue, slotDuration);

  const handleCreate = async () => {
    if (slotPreview === null || slotPreview <= 0) {
      Alert.alert(
        'Invalid time range',
        'End time must be after start time and divide evenly by the slot duration.',
      );
      return;
    }

    setCreating(true);
    try {
      await createAvailability({
        date: selectedDateKey,
        start_time: startTimeValue,
        end_time: endTimeValue,
        slot_duration: slotDuration,
      });
      await loadAvailabilities(true);
      Alert.alert('Slots created', `${slotPreview} appointment slots were added.`);
    } catch (error) {
      Alert.alert('Could not create slots', getApiErrorMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (availability: DoctorAvailability) => {
    const hasBooked = availability.slots.some((slot) => slot.is_booked);
    if (hasBooked) {
      Alert.alert('Cannot delete', 'This window has booked slots and cannot be removed.');
      return;
    }

    Alert.alert('Delete availability', 'Remove this time window and all its slots?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteAvailability(availability.id);
              await loadAvailabilities(true);
            } catch (error) {
              Alert.alert('Delete failed', getApiErrorMessage(error));
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadAvailabilities(true)} />
        }
      >
        <Text style={styles.title}>Availability</Text>
        <Text style={styles.subtitle}>Pick a day, set your hours, and Pocket Med creates the slots.</Text>

        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onWeekChange={setSelectedDate}
        />

        <View style={styles.createCard}>
          <Text style={styles.sectionTitle}>Create slots for {selectedDate.toLocaleDateString()}</Text>
          <View style={styles.timeRow}>
            <TimePickerInput label="Start" value={startTime} onChange={setStartTime} />
            <TimePickerInput label="End" value={endTime} onChange={setEndTime} />
          </View>
          <DurationToggle value={slotDuration} onChange={setSlotDuration} />
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Preview</Text>
            <Text style={styles.previewValue}>
              {slotPreview && slotPreview > 0
                ? `${slotPreview} slot${slotPreview === 1 ? '' : 's'} will be created`
                : 'Time range must divide evenly by slot duration'}
            </Text>
          </View>
          <Pressable
            style={[styles.createButton, (creating || !slotPreview) && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={creating || !slotPreview}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create slots</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Scheduled windows</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : dayAvailabilities.length === 0 ? (
            <Text style={styles.emptyText}>No availability for this day yet.</Text>
          ) : (
            dayAvailabilities.map((availability) => (
              <View key={availability.id} style={styles.windowCard}>
                <View style={styles.windowHeader}>
                  <View style={styles.windowInfo}>
                    <Text style={styles.windowTime}>
                      {formatSlotRange({
                        start_time: availability.start_time,
                        end_time: availability.end_time,
                      })}
                    </Text>
                    <Text style={styles.windowMeta}>
                      {availability.slot_duration === 'one_hour' ? '1 hour' : '30 min'} slots ·{' '}
                      {availability.slots.length} total
                    </Text>
                  </View>
                  <Pressable style={styles.deleteButton} onPress={() => handleDelete(availability)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </Pressable>
                </View>
                <View style={styles.slotGrid}>
                  {availability.slots.map((slot) => (
                    <SlotChip key={slot.id} slot={slot} />
                  ))}
                </View>
              </View>
            ))
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
  container: {
    padding: 20,
    gap: 18,
    paddingBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  createCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  previewBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  previewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.55,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    gap: 12,
  },
  loader: {
    marginTop: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
  },
  windowCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  windowInfo: {
    flex: 1,
    gap: 4,
  },
  windowTime: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  windowMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
