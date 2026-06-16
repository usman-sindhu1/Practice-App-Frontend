import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import BooleanSelect from '../components/BooleanSelect';
import DateOfBirthInput from '../components/DateOfBirthInput';
import FormField, { FormSection } from '../components/FormField';
import GenderSelect from '../components/GenderSelect';
import { useAuth } from '../context/AuthContext';
import { MainStackParamList } from '../navigation/types';
import {
  fetchPatientMedicalInfo,
  upsertPatientMedicalInfo,
} from '../services/medicalInfoService';
import { colors } from '../theme/colors';
import type { Gender } from '../types/auth';
import { buildBookingContext } from '../types/booking';
import { getApiErrorMessage } from '../utils/apiError';
import { parseDateOfBirth, toDateOfBirthPayload } from '../utils/dateOfBirth';

type Props = NativeStackScreenProps<MainStackParamList, 'BookAppointmentDetails'>;

export default function BookAppointmentDetailsScreen({ navigation, route }: Props) {
  const { user, updateProfile } = useAuth();
  const { booking } = route.params;
  const patientType = booking.patientSelection?.patientType ?? 'me';
  const initialAge = booking.patientSelection?.age
    ? String(booking.patientSelection.age)
    : '';
  const isMe = patientType === 'me';

  const [loading, setLoading] = useState(isMe);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState(initialAge);

  const [isFirstTherapy, setIsFirstTherapy] = useState<boolean | null>(null);
  const [isTakingMedicine, setIsTakingMedicine] = useState<boolean | null>(null);
  const [lastVisitDate, setLastVisitDate] = useState<Date | undefined>();
  const [preCondition, setPreCondition] = useState('');
  const [currentCondition, setCurrentCondition] = useState('');

  const loadData = useCallback(async () => {
    if (!isMe || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setFirstName(user.first_name ?? '');
      setLastName(user.last_name ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone_no ?? '');
      setGender(user.gender ?? null);

      const medicalInfo = await fetchPatientMedicalInfo();
      if (medicalInfo.is_first_therapy !== null) {
        setIsFirstTherapy(medicalInfo.is_first_therapy);
      }
      if (medicalInfo.is_taking_medicine !== null) {
        setIsTakingMedicine(medicalInfo.is_taking_medicine);
      }
      if (medicalInfo.last_visit_date) {
        setLastVisitDate(parseDateOfBirth(medicalInfo.last_visit_date));
      }
      if (medicalInfo.pre_condition) {
        setPreCondition(medicalInfo.pre_condition);
      }
      if (medicalInfo.current_condition) {
        setCurrentCondition(medicalInfo.current_condition);
      }
    } catch (error) {
      Alert.alert('Error', getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [isMe, user]);

  useEffect(() => {
    if (isMe && user) {
      loadData();
      return;
    }

    setLoading(false);
  }, [isMe, user, loadData]);

  useEffect(() => {
    if (isFirstTherapy) {
      setLastVisitDate(undefined);
    }
  }, [isFirstTherapy]);

  const validateForm = (): boolean => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing fields', 'Please enter first and last name.');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Missing fields', 'Please enter a phone number.');
      return false;
    }

    if (!isMe && !email.trim()) {
      Alert.alert('Missing fields', 'Please enter an email address.');
      return false;
    }

    if (!isMe && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return false;
    }

    if (phone.trim().length < 10) {
      Alert.alert('Invalid phone', 'Phone number must be at least 10 characters.');
      return false;
    }

    if (!gender) {
      Alert.alert('Missing fields', 'Please select sex.');
      return false;
    }

    const parsedAge = Number(age);
    if (!age.trim() || Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Invalid age', 'Please enter a valid age between 1 and 120.');
      return false;
    }

    if (isFirstTherapy === null) {
      Alert.alert('Missing fields', 'Please answer whether this is your first therapy.');
      return false;
    }

    if (isTakingMedicine === null) {
      Alert.alert('Missing fields', 'Please answer whether you are taking any medicine.');
      return false;
    }

    if (!isFirstTherapy && !lastVisitDate) {
      Alert.alert('Missing fields', 'Please select your last visit date.');
      return false;
    }

    if (!preCondition.trim()) {
      Alert.alert('Missing fields', 'Please enter your pre-existing condition.');
      return false;
    }

    if (!currentCondition.trim()) {
      Alert.alert('Missing fields', 'Please enter your current condition.');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isMe) {
        await updateProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_no: phone.trim(),
          gender,
        });
      }

      const medicalPayload = {
        is_first_therapy: isFirstTherapy as boolean,
        is_taking_medicine: isTakingMedicine as boolean,
        pre_condition: preCondition.trim(),
        current_condition: currentCondition.trim(),
        ...(isFirstTherapy
          ? {}
          : { last_visit_date: toDateOfBirthPayload(lastVisitDate as Date) }),
      };

      await upsertPatientMedicalInfo(medicalPayload);

      const bookingContext = buildBookingContext({
        ...booking,
        personal: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          gender: gender as Gender,
          age: Number(age),
        },
        medical: {
          isFirstTherapy: isFirstTherapy as boolean,
          isTakingMedicine: isTakingMedicine as boolean,
          lastVisitDate: isFirstTherapy
            ? null
            : toDateOfBirthPayload(lastVisitDate as Date),
          preCondition: preCondition.trim(),
          currentCondition: currentCondition.trim(),
        },
      });

      navigation.navigate('BookAppointmentReview', { booking: bookingContext });
    } catch (error) {
      Alert.alert('Save failed', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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

          <FormSection title="Personal Info">
            {isMe ? (
              <Text style={styles.medicalHint}>
                Pre-filled from your profile. Edit any field and tap Continue to save changes.
              </Text>
            ) : null}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <FormField
                  label="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.halfField}>
                <FormField
                  label="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isMe}
              style={isMe ? styles.inputDisabled : undefined}
            />

            <FormField
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Sex</Text>
                <GenderSelect
                  value={gender}
                  onChange={setGender}
                  placeholder="Select"
                  inputStyle={styles.selectInput}
                />
              </View>
              <View style={styles.halfField}>
                <FormField
                  label="Age"
                  value={age}
                  onChangeText={setAge}
                  placeholder="e.g. 25"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </FormSection>

          <FormSection title="Medical Info">
            <Text style={styles.medicalHint}>
              Provide your medical history and your conditions. If you&apos;ve any.
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Is that your first therapy</Text>
              <BooleanSelect
                value={isFirstTherapy}
                onChange={setIsFirstTherapy}
                placeholder="Select"
                inputStyle={styles.selectInput}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Are you taking any medicine?</Text>
              <BooleanSelect
                value={isTakingMedicine}
                onChange={setIsTakingMedicine}
                placeholder="Select"
                inputStyle={styles.selectInput}
              />
            </View>

            {isFirstTherapy === false ? (
              <View style={styles.field}>
                <Text style={styles.label}>When was your last visit?</Text>
                <DateOfBirthInput
                  value={lastVisitDate}
                  onChange={setLastVisitDate}
                  placeholder="Select date"
                  inputStyle={styles.selectInput}
                />
              </View>
            ) : null}

            <FormField
              label="Pre condition"
              value={preCondition}
              onChangeText={setPreCondition}
              placeholder="e.g. Hypertension"
            />

            <FormField
              label="Current condition"
              value={currentCondition}
              onChangeText={setCurrentCondition}
              placeholder="e.g. Back pain"
            />
          </FormSection>

          <Pressable style={styles.continueButton} onPress={handleContinue} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    gap: 24,
    paddingBottom: 40,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  medicalHint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: -8,
  },
  selectInput: {
    borderColor: colors.border,
    backgroundColor: '#fafafa',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: colors.textSecondary,
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
