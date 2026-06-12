import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GENDER_OPTIONS } from '../constants/gender';
import { colors } from '../theme/colors';
import type { Gender } from '../types/auth';

interface GenderSelectProps {
  value: Gender | null;
  onChange: (value: Gender | null) => void;
  placeholder?: string;
  inputStyle?: object;
}

export default function GenderSelect({
  value,
  onChange,
  placeholder = 'Select gender (optional)',
  inputStyle,
}: GenderSelectProps) {
  const [open, setOpen] = useState(false);
  const label = GENDER_OPTIONS.find((option) => option.value === value)?.label;

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
            <Text style={styles.sheetTitle}>Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.option, value === option.value && styles.optionSelected]}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <Text
                  style={[styles.optionText, value === option.value && styles.optionTextSelected]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <Text style={styles.clearButtonText}>Clear selection</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
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
  clearButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
