import { Pressable, StyleSheet, Text } from 'react-native';
import type { AppointmentSlot } from '../types/availability';
import { formatSlotDurationLabel, formatSlotRange, getSlotDurationMinutes } from '../utils/availability';
import { colors } from '../theme/colors';

interface SlotChipProps {
  slot: AppointmentSlot;
  selected?: boolean;
  onPress?: () => void;
}

export default function SlotChip({ slot, selected, onPress }: SlotChipProps) {
  const duration = formatSlotDurationLabel(getSlotDurationMinutes(slot));
  const booked = slot.is_booked;

  return (
    <Pressable
      style={[
        styles.chip,
        selected && styles.chipSelected,
        booked && styles.chipBooked,
        !onPress && styles.chipStatic,
      ]}
      onPress={onPress}
      disabled={!onPress || booked}
    >
      <Text style={[styles.time, selected && styles.textSelected, booked && styles.textBooked]}>
        {formatSlotRange(slot)}
      </Text>
      <Text style={[styles.meta, selected && styles.textSelected, booked && styles.textBooked]}>
        {booked ? 'Booked' : duration}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
    minWidth: 130,
    gap: 2,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipBooked: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    opacity: 0.7,
  },
  chipStatic: {
    opacity: 1,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  textSelected: {
    color: '#fff',
  },
  textBooked: {
    color: colors.textMuted,
  },
});
