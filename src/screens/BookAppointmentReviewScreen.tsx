import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { bookAppointment } from '../services/appointmentService';
import { colors } from '../theme/colors';
import type { BookingContext } from '../types/booking';
import { formatAppointmentDateLabel } from '../types/booking';
import { formatGender } from '../constants/gender';
import { getApiErrorMessage } from '../utils/apiError';
import { formatDateOfBirth } from '../utils/dateOfBirth';

type Props = NativeStackScreenProps<MainStackParamList, 'BookAppointmentReview'>;

type ReviewTab = 'personal' | 'appointment' | 'doctor';

function ReviewTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={styles.reviewValue}>{value}</Text>
    </View>
  );
}

function PersonalInfoTab({ booking }: { booking: BookingContext }) {
  const { personal } = booking;

  return (
    <View style={styles.tabContent}>
      <ReviewRow label="Name" value={`${personal.firstName} ${personal.lastName}`} />
      <ReviewRow label="Email" value={personal.email} />
      <ReviewRow label="Phone" value={personal.phone} />
      <ReviewRow label="Sex" value={formatGender(personal.gender)} />
      <ReviewRow label="Age" value={String(personal.age)} />
    </View>
  );
}

function AppointmentInfoTab({ booking }: { booking: BookingContext }) {
  const { slot, patientSelection, medical } = booking;
  const patientLabel = patientSelection.patientType === 'me' ? 'Me' : 'Someone else';

  return (
    <View style={styles.tabContent}>
      <ReviewRow label="Patient" value={patientLabel} />
      <ReviewRow label="Date" value={formatAppointmentDateLabel(slot.slotStartTime)} />
      <ReviewRow label="Time" value={slot.slotLabel} />
      <ReviewRow
        label="First therapy"
        value={medical.isFirstTherapy ? 'Yes' : 'No'}
      />
      <ReviewRow
        label="Taking medicine"
        value={medical.isTakingMedicine ? 'Yes' : 'No'}
      />
      {!medical.isFirstTherapy && medical.lastVisitDate ? (
        <ReviewRow
          label="Last visit"
          value={formatDateOfBirth(medical.lastVisitDate)}
        />
      ) : null}
      <ReviewRow label="Pre condition" value={medical.preCondition} />
      <ReviewRow label="Current condition" value={medical.currentCondition} />
    </View>
  );
}

function DoctorInfoTab({ booking }: { booking: BookingContext }) {
  const { doctor } = booking;

  return (
    <View style={styles.tabContent}>
      <ReviewRow label="Doctor" value={doctor.doctorName} />
      <ReviewRow label="Specialty" value={doctor.specialty} />
      <ReviewRow label="Service" value={doctor.serviceName} />
    </View>
  );
}

export default function BookAppointmentReviewScreen({ navigation, route }: Props) {
  const { booking } = route.params;
  const [activeTab, setActiveTab] = useState<ReviewTab>('personal');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleBookAppointment = async () => {
    if (!acceptedTerms) {
      Alert.alert('Terms required', 'Please accept the terms and conditions to book your appointment.');
      return;
    }

    setIsBooking(true);
    try {
      await bookAppointment({
        slot_id: booking.slot.slotId,
        doctor_user_id: booking.doctor.doctorUserId,
        terms_accepted: true,
      });

      Alert.alert(
        'Request submitted',
        `Your appointment with ${booking.doctor.doctorName} on ${formatAppointmentDateLabel(booking.slot.slotStartTime)} at ${booking.slot.slotLabel} is pending admin approval.`,
        [
          {
            text: 'View appointments',
            onPress: () => navigation.navigate('PatientAppointments'),
          },
          { text: 'OK', onPress: () => navigation.popToTop() },
        ],
      );
    } catch (error) {
      Alert.alert('Booking failed', getApiErrorMessage(error));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Book Your Appointment</Text>
        <Text style={styles.subtitle}>
          Complete the following steps to schedule appointment.
        </Text>

        <Text style={styles.sectionTitle}>Review Info</Text>

        <View style={styles.tabBar}>
          <ReviewTabButton
            label="Personal Info"
            active={activeTab === 'personal'}
            onPress={() => setActiveTab('personal')}
          />
          <ReviewTabButton
            label="Appointment Info"
            active={activeTab === 'appointment'}
            onPress={() => setActiveTab('appointment')}
          />
          <ReviewTabButton
            label="Doctor Info"
            active={activeTab === 'doctor'}
            onPress={() => setActiveTab('doctor')}
          />
        </View>

        {activeTab === 'personal' ? <PersonalInfoTab booking={booking} /> : null}
        {activeTab === 'appointment' ? <AppointmentInfoTab booking={booking} /> : null}
        {activeTab === 'doctor' ? <DoctorInfoTab booking={booking} /> : null}

        <Pressable
          style={styles.termsRow}
          onPress={() => setAcceptedTerms((current) => !current)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            By submitting this request, you authorize the use of your data and acknowledge that
            you&apos;ve read and accept our Terms and Conditions and Privacy Policy.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.continueButton, (!acceptedTerms || isBooking) && styles.continueButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={!acceptedTerms || isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Book Appointment</Text>
          )}
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    gap: 20,
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
    marginTop: -8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reviewRow: {
    gap: 4,
  },
  reviewLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  reviewValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  continueButtonDisabled: {
    opacity: 0.6,
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
