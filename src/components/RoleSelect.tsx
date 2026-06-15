import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SIGNUP_ROLE_OPTIONS } from '../constants/role';
import { colors } from '../theme/colors';
import type { SignupRole } from '../types/auth';

interface RoleSelectProps {
  value: SignupRole;
  onChange: (value: SignupRole) => void;
}

export default function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {SIGNUP_ROLE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextSelected: {
    color: '#fff',
  },
});
