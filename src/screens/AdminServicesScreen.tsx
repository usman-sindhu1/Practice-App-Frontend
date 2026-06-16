import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createService,
  deleteService,
  fetchAdminServices,
  updateService,
} from '../services/serviceService';
import { colors } from '../theme/colors';
import type { Service } from '../types/service';
import { getApiErrorMessage } from '../utils/apiError';

export default function AdminServicesScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => Number(b.is_active) - Number(a.is_active)),
    [services],
  );

  const loadServices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAdminServices();
      setServices(data);
    } catch (error) {
      Alert.alert('Could not load services', getApiErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Service name is required.');
      return;
    }

    setSaving(true);
    try {
      const created = await createService({
        name: name.trim(),
        description: description.trim() ? description.trim() : null,
        is_active: isActive,
      });
      setServices((prev) => [created, ...prev]);
      setName('');
      setDescription('');
      setIsActive(true);
    } catch (error) {
      Alert.alert('Create failed', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (service: Service) => {
    try {
      const updated = await updateService(service.id, { is_active: !service.is_active });
      setServices((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      Alert.alert('Update failed', getApiErrorMessage(error));
    }
  };

  const handleDelete = (service: Service) => {
    Alert.alert('Delete service', `Delete "${service.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteService(service.id);
              setServices((prev) => prev.filter((item) => item.id !== service.id));
            } catch (error) {
              Alert.alert('Delete failed', getApiErrorMessage(error));
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={sortedServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadServices(true)} />
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Services Catalog</Text>
            <Text style={styles.subtitle}>Create and activate/deactivate doctor services.</Text>

            <View style={styles.createCard}>
              <Text style={styles.sectionTitle}>Add service</Text>
              <TextInput
                style={styles.input}
                placeholder="Name (e.g. Cardiology)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
              />
              <Pressable style={styles.toggleRow} onPress={() => setIsActive((prev) => !prev)}>
                <Text style={styles.toggleLabel}>Active on create</Text>
                <View style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}>
                  <Text style={styles.pillText}>{isActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </Pressable>
              <Pressable style={styles.createButton} onPress={handleCreate} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Service</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>All services</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.emptyText}>No services yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <View style={[styles.pill, item.is_active ? styles.pillActive : styles.pillInactive]}>
                <Text style={styles.pillText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>
            {item.description ? <Text style={styles.serviceDescription}>{item.description}</Text> : null}
            <View style={styles.actions}>
              <Pressable style={styles.actionBtn} onPress={() => void handleToggle(item)}>
                <Text style={styles.actionBtnText}>{item.is_active ? 'Deactivate' : 'Activate'}</Text>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item)}>
                <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { padding: 20, gap: 12, paddingBottom: 32 },
  headerWrap: { gap: 12, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  createCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafafa',
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  createButtonText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: colors.textSecondary, textAlign: 'center', marginTop: 12 },
  serviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  serviceName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  serviceDescription: { fontSize: 13, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  actionBtnText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  deleteBtn: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  deleteBtnText: { color: colors.danger },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  pillActive: { backgroundColor: '#dcfce7' },
  pillInactive: { backgroundColor: '#f3f4f6' },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase' },
});
