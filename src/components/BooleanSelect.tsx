import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface BooleanSelectProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  placeholder?: string;
  inputStyle?: object;
  yesLabel?: string;
  noLabel?: string;
}

export default function BooleanSelect({
  value,
  onChange,
  placeholder = 'Select an option',
  inputStyle,
  yesLabel = 'Yes',
  noLabel = 'No',
}: BooleanSelectProps) {
  const [open, setOpen] = useState(false);
  const label = value === null ? undefined : value ? yesLabel : noLabel;

  return (
    <>
      <Pressable
        style={[styles.input, inputStyle]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={label ? styles.valueText : styles.placeholderText}>{label ?? placeholder}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            {[true, false].map((option) => (
              <Pressable
                key={String(option)}
                style={[styles.option, value === option && styles.optionSelected]}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <Text
                  style={[styles.optionText, value === option && styles.optionTextSelected]}
                >
                  {option ? yesLabel : noLabel}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    gap: 8,
  },
  option: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
