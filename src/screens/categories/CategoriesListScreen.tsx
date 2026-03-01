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
import { useVendorEquipmentCategoriesManager } from '@sudobility/tapayoka_lib';
import type { VendorEquipmentCategory, VendorEquipmentCategoryCreateRequest } from '@sudobility/tapayoka_types';
import type { CategoriesStackScreenProps } from '@/navigation/types';
import { CategoryFormModal } from './CategoryFormModal';

export function CategoriesListScreen({
  navigation,
}: CategoriesStackScreenProps<'CategoriesList'>) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { networkClient, baseUrl, token } = useApi();
  const manager = useVendorEquipmentCategoriesManager(networkClient, baseUrl, null, token);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VendorEquipmentCategory | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleEdit = (category: VendorEquipmentCategory) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleDelete = (category: VendorEquipmentCategory) => {
    Alert.alert(t('common.delete'), t('categories.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const ok = await manager.deleteCategory(category.id);
          if (!ok && manager.error) {
            Alert.alert(t('common.error'), manager.error);
          }
        },
      },
    ]);
  };

  const handlePress = (category: VendorEquipmentCategory) => {
    navigation.navigate('CategoryServices', {
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const onRefresh = useCallback(() => {
    manager.refresh();
  }, [manager]);

  const renderItem = ({ item }: { item: VendorEquipmentCategory }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => handlePress(item)}
      onLongPress={() =>
        Alert.alert(item.name, undefined, [
          { text: t('categories.edit'), onPress: () => handleEdit(item) },
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
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={manager.categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={manager.isLoading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !manager.isLoading ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              {t('categories.empty')}
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

      <CategoryFormModal
        visible={modalVisible}
        category={editingCategory}
        onClose={() => setModalVisible(false)}
        onSave={async data => {
          if (editingCategory) {
            await manager.updateCategory(editingCategory.id, data);
          } else {
            await manager.addCategory(data as VendorEquipmentCategoryCreateRequest);
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
