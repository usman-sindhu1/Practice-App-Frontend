import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField, { FormSection } from '../components/FormField';
import ServicePicker from '../components/ServicePicker';
import YearPickerInput from '../components/YearPickerInput';
import { useAuth } from '../context/AuthContext';
import { fetchActiveServices } from '../services/serviceService';
import { colors } from '../theme/colors';
import type { SubmitDoctorProfilePayload } from '../types/doctor';
import type { Service } from '../types/service';
import { getApiErrorMessage } from '../utils/apiError';

import type { DoctorProfile } from '../types/doctor';

function profileToForm(profile: DoctorProfile | null, user: ReturnType<typeof useAuth>['user']) {
  return {
    fullName: profile?.full_name ?? '',
    personalContactNo: profile?.personal_contact_no ?? '',
    personalEmail: profile?.personal_email ?? '',
    address: profile?.address ?? '',
    professionalContactNo: profile?.professional_contact_no ?? '',
    professionalEmail: profile?.professional_email ?? '',
    degreeTitle: profile?.degree_title ?? '',
    instituteName: profile?.institute_name ?? '',
    startYear: profile?.start_year ?? undefined,
    completionYear: profile?.completion_year ?? undefined,
    instituteAddress: profile?.institute_address ?? '',
    profession: profile?.profession ?? '',
    language: profile?.language ?? '',
    serviceId: profile?.service_id ?? null,
  };
}

export default function DoctorCompleteProfileScreen() {
  const { user, doctorProfile, submitDoctorProfile, logout } = useAuth();
  const isResubmit = doctorProfile?.status === 'rejected';

  const [fullName, setFullName] = useState('');
  const [personalContactNo, setPersonalContactNo] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [address, setAddress] = useState('');
  const [professionalContactNo, setProfessionalContactNo] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [startYear, setStartYear] = useState<number | undefined>();
  const [completionYear, setCompletionYear] = useState<number | undefined>();
  const [instituteAddress, setInstituteAddress] = useState('');
  const [profession, setProfession] = useState('');
  const [language, setLanguage] = useState('');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const form = profileToForm(doctorProfile, user);
    setFullName(form.fullName || `Dr. ${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim());
    setPersonalContactNo(form.personalContactNo || user?.phone_no || '');
    setPersonalEmail(form.personalEmail || user?.email || '');
    setAddress(form.address);
    setProfessionalContactNo(form.professionalContactNo);
    setProfessionalEmail(form.professionalEmail);
    setDegreeTitle(form.degreeTitle);
    setInstituteName(form.instituteName);
    setStartYear(form.startYear);
    setCompletionYear(form.completionYear);
    setInstituteAddress(form.instituteAddress);
    setProfession(form.profession);
    setLanguage(form.language);
    setServiceId(form.serviceId);
  }, [doctorProfile, user]);

  useEffect(() => {
    async function loadServices() {
      setLoadingServices(true);
      try {
        const data = await fetchActiveServices();
        setServices(data);
      } catch (error) {
        Alert.alert('Could not load services', getApiErrorMessage(error));
      } finally {
        setLoadingServices(false);
      }
    }

    void loadServices();
  }, []);

  const handleSubmit = async () => {
    const payload: SubmitDoctorProfilePayload = {
      full_name: fullName.trim(),
      personal_contact_no: personalContactNo.trim(),
      personal_email: personalEmail.trim(),
      address: address.trim(),
      professional_contact_no: professionalContactNo.trim(),
      professional_email: professionalEmail.trim(),
      degree_title: degreeTitle.trim(),
      institute_name: instituteName.trim(),
      start_year: startYear!,
      completion_year: completionYear!,
      institute_address: instituteAddress.trim(),
      profession: profession.trim(),
      language: language.trim(),
      service_id: serviceId ?? '',
    };

    const requiredStrings = [
      payload.full_name,
      payload.personal_contact_no,
      payload.personal_email,
      payload.address,
      payload.professional_contact_no,
      payload.professional_email,
      payload.degree_title,
      payload.institute_name,
      payload.institute_address,
      payload.profession,
      payload.language,
    ];

    if (
      requiredStrings.some((field) => !field.trim()) ||
      !startYear ||
      !completionYear ||
      !serviceId
    ) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }

    if (payload.completion_year < payload.start_year) {
      Alert.alert('Invalid years', 'Completion year must be after start year.');
      return;
    }

    setSubmitting(true);
    try {
      await submitDoctorProfile(payload);
    } catch (error) {
      Alert.alert('Submission failed', getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isResubmit ? 'Resubmit Profile' : 'Complete Profile'}</Text>
          <Text style={styles.description}>
            {isResubmit
              ? 'Update your details and resubmit for admin review.'
              : 'Fill in your professional details to request access to Pocket Med.'}
          </Text>

          {isResubmit && doctorProfile?.rejection_reason ? (
            <View style={styles.rejectionBanner}>
              <Text style={styles.rejectionTitle}>Previous rejection</Text>
              <Text style={styles.rejectionText}>{doctorProfile.rejection_reason}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <FormSection title="Personal & Contact">
              <FormField label="Full name" value={fullName} onChangeText={setFullName} />
              <FormField
                label="Personal contact"
                value={personalContactNo}
                onChangeText={setPersonalContactNo}
                keyboardType="phone-pad"
              />
              <FormField
                label="Personal email"
                value={personalEmail}
                onChangeText={setPersonalEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <FormField label="Address" value={address} onChangeText={setAddress} />
            </FormSection>

            <FormSection title="Professional Contact">
              <FormField
                label="Professional contact"
                value={professionalContactNo}
                onChangeText={setProfessionalContactNo}
                keyboardType="phone-pad"
              />
              <FormField
                label="Professional email"
                value={professionalEmail}
                onChangeText={setProfessionalEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </FormSection>

            <FormSection title="Education">
              <FormField label="Degree title" value={degreeTitle} onChangeText={setDegreeTitle} />
              <FormField
                label="Institute name"
                value={instituteName}
                onChangeText={setInstituteName}
              />
              <YearPickerInput
                label="Start year"
                value={startYear}
                onChange={setStartYear}
                placeholder="Select start year"
              />
              <YearPickerInput
                label="Completion year"
                value={completionYear}
                onChange={setCompletionYear}
                placeholder="Select completion year"
                minimumDate={startYear ? new Date(startYear, 0, 1) : undefined}
              />
              <FormField
                label="Institute address"
                value={instituteAddress}
                onChangeText={setInstituteAddress}
              />
            </FormSection>

            <FormSection title="General">
              <FormField label="Profession" value={profession} onChangeText={setProfession} />
              <FormField
                label="Languages"
                value={language}
                onChangeText={setLanguage}
                placeholder="e.g. English, Urdu"
              />
              {loadingServices ? (
                <View style={styles.serviceLoading}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.serviceLoadingText}>Loading services...</Text>
                </View>
              ) : (
                <ServicePicker services={services} value={serviceId} onChange={setServiceId} />
              )}
            </FormSection>
          </View>

          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isResubmit ? 'Resubmit for Review' : 'Submit for Review'}
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.logoutButton} onPress={() => void logout()}>
            <Text style={styles.logoutButtonText}>Sign out</Text>
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
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  rejectionBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 6,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  rejectionText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 24,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  serviceLoading: {
    gap: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceLoadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
