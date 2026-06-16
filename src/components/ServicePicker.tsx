import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Service } from '../types/service';

interface ServicePickerProps {
  services: Service[];
  value: string | null;
  onChange: (serviceId: string | null) => void;
}

export default function ServicePicker({ services, value, onChange }: ServicePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => services.find((item) => item.id === value), [services, value]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Service</Text>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.valueText : styles.placeholderText}>
          {selected?.name ?? 'Select service'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose a service</Text>
            <ScrollView style={styles.sheetList}>
              {services.map((service) => {
                const selectedItem = service.id === value;
                return (
                  <Pressable
                    key={service.id}
                    style={[styles.option, selectedItem && styles.optionSelected]}
                    onPress={() => {
                      onChange(service.id);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionName, selectedItem && styles.optionNameSelected]}>
                      {service.name}
                    </Text>
                    {service.description ? (
                      <Text style={styles.optionDescription}>{service.description}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sheetList: {
    maxHeight: 380,
  },
  option: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  optionNameSelected: {
    color: colors.primary,
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
