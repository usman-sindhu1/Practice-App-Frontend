import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface TimePickerInputProps {
  label: string;
  value: Date | undefined;
  onChange: (value: Date) => void;
  placeholder?: string;
}

const DEFAULT_TIME = parseDefaultTime('09:00');

function parseDefaultTime(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export default function TimePickerInput({
  label,
  value,
  onChange,
  placeholder = 'Select time',
}: TimePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = value
    ? value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : undefined;

  const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    onChange(selectedDate);
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setShowPicker(true)} accessibilityRole="button">
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue ?? placeholder}
        </Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={value ?? DEFAULT_TIME}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={false}
          onValueChange={handleValueChange}
          onDismiss={() => setShowPicker(false)}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
  },
  doneButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
