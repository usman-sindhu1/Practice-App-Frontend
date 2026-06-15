import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SlotDuration } from '../types/availability';
import { colors } from '../theme/colors';

const OPTIONS: { value: SlotDuration; label: string }[] = [
  { value: 'thirty_min', label: '30 min' },
  { value: 'one_hour', label: '1 hour' },
];

interface DurationToggleProps {
  value: SlotDuration;
  onChange: (value: SlotDuration) => void;
}

export default function DurationToggle({ value, onChange }: DurationToggleProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Slot duration</Text>
      <View style={styles.row}>
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: '#fff',
  },
});
