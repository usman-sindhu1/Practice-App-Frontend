import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  APPOINTMENT_STATUS_COLORS,
  formatAppointmentStatus,
} from '../constants/appointment';
import { colors } from '../theme/colors';
import type { Appointment } from '../types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
  subtitle?: string;
}

export default function AppointmentCard({ appointment, onPress, subtitle }: AppointmentCardProps) {
  const statusColor = APPOINTMENT_STATUS_COLORS[appointment.status];

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.cardPressed : null]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.doctorName}>{appointment.doctor_info.doctor}</Text>
        <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {formatAppointmentStatus(appointment.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>{appointment.appointment_info.date}</Text>
      <Text style={styles.time}>{appointment.appointment_info.time}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {appointment.status === 'rejected' && appointment.rejection_reason ? (
        <Text style={styles.rejectionReason}>Reason: {appointment.rejection_reason}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  doctorName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  date: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  rejectionReason: {
    fontSize: 13,
    color: colors.danger,
    marginTop: 4,
    lineHeight: 18,
  },
});
