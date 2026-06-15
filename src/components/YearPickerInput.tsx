import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface YearPickerInputProps {
  label: string;
  value: number | undefined;
  onChange: (year: number | undefined) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

const DEFAULT_YEAR_DATE = new Date(2015, 0, 1);
const MIN_YEAR_DATE = new Date(1950, 0, 1);

function yearToDate(year: number): Date {
  return new Date(year, 0, 1);
}

export default function YearPickerInput({
  label,
  value,
  onChange,
  placeholder = 'Select year',
  maximumDate = new Date(),
  minimumDate = MIN_YEAR_DATE,
}: YearPickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = value ? String(value) : undefined;

  const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    onChange(selectedDate.getFullYear());

    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.input}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
      >
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue ?? placeholder}
        </Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={value ? yearToDate(value) : DEFAULT_YEAR_DATE}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onValueChange={handleValueChange}
          onDismiss={() => setShowPicker(false)}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      ) : null}

      {value && !showPicker ? (
        <Pressable style={styles.clearButton} onPress={() => onChange(undefined)}>
          <Text style={styles.clearButtonText}>Clear year</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
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
    paddingHorizontal: 4,
  },
  doneButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'flex-start',
    paddingTop: 4,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
