import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { MainStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { calculateAgeFromDateOfBirth } from '../utils/dateOfBirth';

type Props = NativeStackScreenProps<MainStackParamList, 'BookAppointment'>;

type PatientType = 'me' | 'someone_else';

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.radioRow} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

export default function BookAppointmentScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { booking } = route.params;
  const [patientType, setPatientType] = useState<PatientType>('me');
  const [age, setAge] = useState('');

  const myAge = calculateAgeFromDateOfBirth(user?.date_of_birth);

  useEffect(() => {
    if (patientType === 'me') {
      setAge(myAge !== null ? String(myAge) : '');
    } else {
      setAge('');
    }
  }, [patientType, myAge]);

  const handleContinue = () => {
    const parsedAge = Number(age);

    if (!age.trim() || Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Invalid age', 'Please enter a valid patient age between 1 and 120.');
      return;
    }

    navigation.navigate('BookAppointmentDetails', {
      booking: {
        ...booking,
        patientSelection: {
          patientType,
          age: parsedAge,
        },
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Book Your Appointment</Text>
          <Text style={styles.subtitle}>
            Complete the following steps to schedule appointment.
          </Text>

          {booking.doctor.doctorName || booking.slot.slotLabel ? (
            <View style={styles.summaryCard}>
              {booking.doctor.doctorName ? (
                <Text style={styles.summaryText}>Doctor: {booking.doctor.doctorName}</Text>
              ) : null}
              {booking.slot.slotLabel ? (
                <Text style={styles.summaryText}>Time: {booking.slot.slotLabel}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Who Requires Medical Attention?</Text>
            <RadioOption
              label="Me"
              selected={patientType === 'me'}
              onPress={() => setPatientType('me')}
            />
            <RadioOption
              label="Someone else"
              selected={patientType === 'someone_else'}
              onPress={() => setPatientType('someone_else')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Age</Text>
            <TextInput
              style={[styles.input, patientType === 'me' && myAge !== null && styles.inputDisabled]}
              placeholder="e.g. 25"
              placeholderTextColor={colors.textMuted}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              editable={patientType === 'someone_else' || myAge === null}
            />
            {patientType === 'me' && myAge === null ? (
              <Text style={styles.hint}>
                Your profile has no date of birth. Update it in Profile Settings or choose
                &quot;Someone else&quot;.
              </Text>
            ) : null}
            {patientType === 'me' && myAge !== null ? (
              <Text style={styles.hint}>Calculated from your profile date of birth.</Text>
            ) : null}
          </View>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: -12,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
