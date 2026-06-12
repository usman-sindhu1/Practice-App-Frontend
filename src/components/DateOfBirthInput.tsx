import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { formatDateOfBirth, toDateOfBirthPayload } from '../utils/dateOfBirth';

interface DateOfBirthInputProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  placeholder?: string;
  inputStyle?: object;
}

const DEFAULT_DATE = new Date(1995, 0, 1);

export default function DateOfBirthInput({
  value,
  onChange,
  placeholder = 'Date of birth (optional)',
  inputStyle,
}: DateOfBirthInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayValue = value ? formatDateOfBirth(toDateOfBirthPayload(value)) : undefined;

  const handleValueChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    onChange(selectedDate);

    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
  };

  const handleDismiss = () => {
    setShowPicker(false);
  };

  return (
    <>
      <Pressable
        style={[styles.input, inputStyle]}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
      >
        <Text style={displayValue ? styles.valueText : styles.placeholderText}>
          {displayValue ?? placeholder}
        </Text>
      </Pressable>

      {showPicker ? (
        <DateTimePicker
          value={value ?? DEFAULT_DATE}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onValueChange={handleValueChange}
          onDismiss={handleDismiss}
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      ) : null}

      {value && !showPicker ? (
        <Pressable style={styles.clearButton} onPress={() => onChange(undefined)}>
          <Text style={styles.clearButtonText}>Clear date</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
