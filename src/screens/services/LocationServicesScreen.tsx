import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import { useApi } from '@/context';
import { useVendorServicesManager } from '@sudobility/tapayoka_lib';
import type { VendorService, VendorServiceCreateRequest } from '@sudobility/tapayoka_types';
import type { LocationsStackScreenProps } from '@/navigation/types';
import { ServiceFormModal } from './ServiceFormModal';

export function LocationServicesScreen({
  navigation,
  route,
}: LocationsStackScreenProps<'LocationServices'>) {
  const { locationId, locationName } = route.params;
  const { t } = useTranslation();
  const colors = useAppColors();
  const { networkClient, baseUrl, token } = useApi();
  const manager = useVendorServicesManager(
    networkClient,
    baseUrl,
    null,
    token,
    locationId,
    'location'
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<VendorService | null>(null);

  const handleAdd = () => {
    setEditingService(null);
    setModalVisible(true);
  };

  const handleDelete = (service: VendorService) => {
    Alert.alert(t('common.delete'), t('services.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const ok = await manager.deleteService(service.id);
          if (!ok && manager.error) {
            Alert.alert(t('common.error'), manager.error);
          }
        },
      },
    ]);
  };

  const handlePress = (service: VendorService) => {
    navigation.navigate('ServiceDetail', {
      serviceId: service.id,
      serviceName: service.name,
      parentType: 'location',
      parentId: locationId,
    });
  };

  const onRefresh = useCallback(() => {
    manager.refresh();
  }, [manager]);

  const renderItem = ({ item }: { item: VendorService }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => handlePress(item)}
      onLongPress={() =>
        Alert.alert(item.name, undefined, [
          {
            text: t('services.edit'),
            onPress: () => {
              setEditingService(item);
              setModalVisible(true);
            },
          },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => handleDelete(item),
          },
          { text: t('common.cancel'), style: 'cancel' },
        ])
      }
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
      <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
        {item.price} {item.currencyCode}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={manager.services}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={manager.isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !manager.isLoading ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              {t('services.empty')}
            </Text>
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAdd}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ServiceFormModal
        visible={modalVisible}
        service={editingService}
        preSelectedLocationId={locationId}
        preSelectedLocationName={locationName}
        parentType="location"
        onClose={() => setModalVisible(false)}
        onSave={async data => {
          if (editingService) {
            await manager.updateService(editingService.id, data);
          } else {
            await manager.addService(data as VendorServiceCreateRequest);
          }
          setModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 80 },
  card: { padding: 16, borderRadius: 12, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
});
