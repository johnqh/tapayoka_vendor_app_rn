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
import { useVendorLocationsManager } from '@sudobility/tapayoka_lib';
import type { VendorLocation, VendorLocationCreateRequest } from '@sudobility/tapayoka_types';
import type { LocationsStackScreenProps } from '@/navigation/types';
import { LocationFormModal } from './LocationFormModal';

export function LocationsListScreen({
  navigation,
}: LocationsStackScreenProps<'LocationsList'>) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { networkClient, baseUrl, token } = useApi();
  const manager = useVendorLocationsManager(networkClient, baseUrl, null, token);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<VendorLocation | null>(null);

  const handleAdd = () => {
    setEditingLocation(null);
    setModalVisible(true);
  };

  const handleEdit = (location: VendorLocation) => {
    setEditingLocation(location);
    setModalVisible(true);
  };

  const handleDelete = (location: VendorLocation) => {
    Alert.alert(t('common.delete'), t('locations.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const ok = await manager.deleteLocation(location.id);
          if (!ok && manager.error) {
            Alert.alert(t('common.error'), manager.error);
          }
        },
      },
    ]);
  };

  const handlePress = (location: VendorLocation) => {
    navigation.navigate('LocationServices', {
      locationId: location.id,
      locationName: location.name,
    });
  };

  const onRefresh = useCallback(() => {
    manager.refresh();
  }, [manager]);

  const renderItem = ({ item }: { item: VendorLocation }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => handlePress(item)}
      onLongPress={() =>
        Alert.alert(item.name, undefined, [
          { text: t('locations.edit'), onPress: () => handleEdit(item) },
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
        {item.city}, {item.stateProvince}, {item.country}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={manager.locations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={manager.isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !manager.isLoading ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              {t('locations.empty')}
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

      <LocationFormModal
        visible={modalVisible}
        location={editingLocation}
        onClose={() => setModalVisible(false)}
        onSave={async data => {
          if (editingLocation) {
            await manager.updateLocation(editingLocation.id, data);
          } else {
            await manager.addLocation(data as VendorLocationCreateRequest);
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
