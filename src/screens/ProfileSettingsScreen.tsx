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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateOfBirthInput from '../components/DateOfBirthInput';
import GenderSelect from '../components/GenderSelect';
import { useAuth } from '../context/AuthContext';
import { MainStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import type { Gender } from '../types/auth';
import { parseDateOfBirth, toDateOfBirthPayload } from '../utils/dateOfBirth';
import { getApiErrorMessage } from '../utils/apiError';

type Props = NativeStackScreenProps<MainStackParamList, 'ProfileSettings'>;

export default function ProfileSettingsScreen({ navigation }: Props) {
  const { user, updateProfile } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFirstName(user?.first_name ?? '');
    setLastName(user?.last_name ?? '');
    setPhoneNo(user?.phone_no ?? '');
    setGender(user?.gender ?? null);
    setDateOfBirth(parseDateOfBirth(user?.date_of_birth));
  }, [user]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing fields', 'Please fill in all editable fields.');
      return;
    }

    if (!isAdmin && !phoneNo.trim()) {
      Alert.alert('Missing fields', 'Please fill in all editable fields.');
      return;
    }

    if (!isAdmin && phoneNo.trim().length < 10) {
      Alert.alert('Invalid phone', 'Phone number must be at least 10 characters.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        ...(isAdmin
          ? {}
          : {
              phone_no: phoneNo.trim(),
              gender,
              date_of_birth: dateOfBirth ? toDateOfBirthPayload(dateOfBirth) : null,
            }),
      });
      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Update failed', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.description}>
            {isAdmin
              ? 'Update your account name. Email cannot be changed here.'
              : 'Update your personal information. Email cannot be changed here.'}
          </Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email ?? ''}
                editable={false}
              />
              <Text style={styles.hint}>Email is read-only</Text>
            </View>

            {!isAdmin ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Phone number</Text>
                  <TextInput
                    style={styles.input}
                    value={phoneNo}
                    onChangeText={setPhoneNo}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Gender</Text>
                  <GenderSelect
                    value={gender}
                    onChange={setGender}
                    placeholder="Select gender"
                    inputStyle={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Date of birth</Text>
                  <DateOfBirthInput
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder="Select date of birth"
                    inputStyle={styles.input}
                  />
                </View>
              </>
            ) : null}
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
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
    gap: 20,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 18,
  },
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
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#fafafa',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: colors.textSecondary,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 80,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
