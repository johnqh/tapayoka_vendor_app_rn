import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SectionList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import { useApi } from '@/context';
import {
  useVendorServiceControlsManager,
  useVendorEquipmentsManager,
} from '@sudobility/tapayoka_lib';
import type {
  VendorServiceControl,
  VendorEquipment,
} from '@sudobility/tapayoka_types';
import type { LocationsStackScreenProps } from '@/navigation/types';
import { ServiceControlForm } from './ServiceControlForm';
import { EquipmentForm } from './EquipmentForm';

type Props = LocationsStackScreenProps<'ServiceDetail'>;

const generateWalletAddress = (): string => {
  const bytes = new Uint8Array(20);
  // Use Math.random as fallback for environments without crypto.getRandomValues
  for (let i = 0; i < 20; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return (
    '0x' +
    Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );
};

export function ServiceDetailScreen({ route }: Props) {
  const { serviceId, serviceName } = route.params;
  const { t } = useTranslation();
  const colors = useAppColors();
  const { networkClient, baseUrl, token } = useApi();

  const controlsManager = useVendorServiceControlsManager(
    networkClient,
    baseUrl,
    null,
    token,
    serviceId
  );
  const equipmentsManager = useVendorEquipmentsManager(
    networkClient,
    baseUrl,
    null,
    token,
    serviceId
  );

  const [showControlForm, setShowControlForm] = useState(false);
  const [editingControl, setEditingControl] = useState<VendorServiceControl | null>(null);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<VendorEquipment | null>(null);

  // --- Control handlers ---
  const handleAddControl = () => {
    setEditingControl(null);
    setShowControlForm(true);
  };

  const handleEditControl = (control: VendorServiceControl) => {
    setEditingControl(control);
    setShowControlForm(true);
  };

  const handleDeleteControl = (control: VendorServiceControl) => {
    Alert.alert(t('common.delete'), t('serviceControls.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => controlsManager.deleteControl(control.id),
      },
    ]);
  };

  const handleSaveControl = async (data: { pinNumber: number; duration: number }) => {
    if (editingControl) {
      await controlsManager.updateControl(editingControl.id, data);
    } else {
      await controlsManager.addControl({ vendorServiceId: serviceId, ...data });
    }
    setShowControlForm(false);
  };

  // --- Equipment handlers ---
  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setShowEquipmentForm(true);
  };

  const handleEditEquipment = (equipment: VendorEquipment) => {
    setEditingEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = (equipment: VendorEquipment) => {
    Alert.alert(t('common.delete'), t('equipments.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => equipmentsManager.deleteEquipment(equipment.walletAddress),
      },
    ]);
  };

  const handleSaveEquipment = async (data: { name: string; walletAddress?: string }) => {
    if (editingEquipment) {
      await equipmentsManager.updateEquipment(editingEquipment.walletAddress, {
        name: data.name,
      });
    } else {
      const walletAddress = data.walletAddress || generateWalletAddress();
      await equipmentsManager.addEquipment({
        walletAddress,
        vendorServiceId: serviceId,
        name: data.name,
      });
    }
    setShowEquipmentForm(false);
  };

  const sections = [
    {
      title: t('serviceControls.title'),
      data: controlsManager.controls as any[],
      type: 'control' as const,
    },
    {
      title: t('equipments.title'),
      data: equipmentsManager.equipments as any[],
      type: 'equipment' as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Service header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{serviceName}</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id ?? item.walletAddress ?? String(index)}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <TouchableOpacity
              onPress={
                section.type === 'control' ? handleAddControl : handleAddEquipment
              }
            >
              <Text style={[styles.addBtn, { color: colors.primary }]}>
                + {t('common.add')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ item, section }) => {
          if (section.type === 'control') {
            const control = item as VendorServiceControl;
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => handleEditControl(control)}
                onLongPress={() =>
                  Alert.alert(`Pin ${control.pinNumber}`, undefined, [
                    { text: t('common.delete'), style: 'destructive', onPress: () => handleDeleteControl(control) },
                    { text: t('common.cancel'), style: 'cancel' },
                  ])
                }
              >
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Pin {control.pinNumber}
                </Text>
                <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
                  {t('serviceControls.duration')}: {control.duration}s
                </Text>
              </TouchableOpacity>
            );
          }
          const equipment = item as VendorEquipment;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => handleEditEquipment(equipment)}
              onLongPress={() =>
                Alert.alert(equipment.name, undefined, [
                  { text: t('common.delete'), style: 'destructive', onPress: () => handleDeleteEquipment(equipment) },
                  { text: t('common.cancel'), style: 'cancel' },
                ])
              }
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {equipment.name}
              </Text>
              <Text style={[styles.cardAddress, { color: colors.textMuted }]} numberOfLines={1}>
                {equipment.walletAddress}
              </Text>
            </TouchableOpacity>
          );
        }}
        renderSectionFooter={({ section }) => {
          if (section.data.length === 0) {
            return (
              <Text style={[styles.emptySection, { color: colors.textMuted }]}>
                {section.type === 'control'
                  ? t('serviceControls.empty')
                  : t('equipments.empty')}
              </Text>
            );
          }
          return null;
        }}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />

      <ServiceControlForm
        visible={showControlForm}
        control={editingControl}
        onClose={() => setShowControlForm(false)}
        onSave={handleSaveControl}
      />

      <EquipmentForm
        visible={showEquipmentForm}
        equipment={editingEquipment}
        onClose={() => setShowEquipmentForm(false)}
        onSave={handleSaveEquipment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  list: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  addBtn: { fontSize: 15, fontWeight: '500' },
  card: { padding: 14, borderRadius: 10, marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSubtitle: { fontSize: 13, marginTop: 2 },
  cardAddress: { fontSize: 11, fontFamily: 'monospace', marginTop: 2 },
  emptySection: { textAlign: 'center', fontSize: 13, paddingVertical: 12 },
});
