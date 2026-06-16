import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { PublicDoctor } from '../types/availability';
import { getDoctorDisplayName } from '../utils/publicDoctor';

interface DoctorCardProps {
  doctor: PublicDoctor;
  onPress: () => void;
}

export default function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {doctor.first_name.charAt(0)}
          {doctor.last_name.charAt(0)}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{getDoctorDisplayName(doctor)}</Text>
        <Text style={styles.profession}>{doctor.profession ?? 'General practice'}</Text>
        {doctor.service?.name ? <Text style={styles.service}>{doctor.service.name}</Text> : null}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Approved</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  profession: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  service: {
    fontSize: 13,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
    textTransform: 'uppercase',
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: '300',
  },
});
