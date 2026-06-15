import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function DoctorProfileUnderReviewScreen() {
  const { user, logout, refreshDoctorProfile } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      await refreshDoctorProfile();
    } finally {
      setChecking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⏳</Text>
        </View>
        <Text style={styles.title}>Profile Under Review</Text>
        <Text style={styles.description}>
          Thanks, Dr. {user?.last_name ?? 'Doctor'}. Your profile has been submitted and is being
          reviewed by our admin team. You will get full access once approved.
        </Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current status</Text>
          <Text style={styles.statusValue}>Pending review</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={() => void handleCheckStatus()} disabled={checking}>
          {checking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.refreshButtonText}>Check status</Text>
          )}
        </Pressable>
        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Text style={styles.logoutButtonText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    gap: 6,
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d97706',
  },
  refreshButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
