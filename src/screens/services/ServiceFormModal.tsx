import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import { useApi } from '@/context';
import {
  useVendorLocationsManager,
  useVendorEquipmentCategoriesManager,
} from '@sudobility/tapayoka_lib';
import type {
  VendorService,
  VendorServiceCreateRequest,
  VendorServiceUpdateRequest,
} from '@sudobility/tapayoka_types';

interface Props {
  visible: boolean;
  service: VendorService | null;
  parentType: 'location' | 'category';
  preSelectedLocationId?: string;
  preSelectedLocationName?: string;
  preSelectedCategoryId?: string;
  preSelectedCategoryName?: string;
  onClose: () => void;
  onSave: (data: VendorServiceCreateRequest | VendorServiceUpdateRequest) => Promise<void>;
}

export function ServiceFormModal({
  visible,
  service,
  parentType,
  preSelectedLocationId,
  preSelectedLocationName,
  preSelectedCategoryId,
  preSelectedCategoryName,
  onClose,
  onSave,
}: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { networkClient, baseUrl, token } = useApi();

  const locationsManager = useVendorLocationsManager(networkClient, baseUrl, null, token);
  const categoriesManager = useVendorEquipmentCategoriesManager(networkClient, baseUrl, null, token);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (service) {
        setName(service.name);
        setPrice(service.price);
        setCurrencyCode(service.currencyCode);
        setSelectedLocationId(service.vendorLocationId);
        setSelectedCategoryId(service.vendorEquipmentCategoryId);
      } else {
        setName('');
        setPrice('');
        setCurrencyCode('USD');
        setSelectedLocationId(preSelectedLocationId ?? null);
        setSelectedCategoryId(preSelectedCategoryId ?? null);
      }
      setShowPicker(false);
    }
  }, [visible, service, preSelectedLocationId, preSelectedCategoryId]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || !selectedLocationId || !selectedCategoryId) return;
    setSaving(true);
    try {
      if (service) {
        await onSave({
          name: name.trim(),
          price: price.trim(),
          currencyCode,
        } as VendorServiceUpdateRequest);
      } else {
        await onSave({
          vendorLocationId: selectedLocationId,
          vendorEquipmentCategoryId: selectedCategoryId,
          name: name.trim(),
          price: price.trim(),
          currencyCode,
        } as VendorServiceCreateRequest);
      }
    } finally {
      setSaving(false);
    }
  };

  const pickerItems =
    parentType === 'location'
      ? categoriesManager.categories.map(c => ({ id: c.id, label: c.name }))
      : locationsManager.locations.map(l => ({ id: l.id, label: l.name }));

  const pickerLabel =
    parentType === 'location' ? t('services.selectCategory') : t('services.selectLocation');

  const selectedPickerItem = pickerItems.find(
    i => i.id === (parentType === 'location' ? selectedCategoryId : selectedLocationId)
  );

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {service ? t('services.edit') : t('services.add')}
          </Text>

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('services.name')}</Text>
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder={t('services.name')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('services.price')}</Text>
            <TextInput style={inputStyle} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('services.currencyCode')}</Text>
            <TextInput style={inputStyle} value={currencyCode} onChangeText={setCurrencyCode} maxLength={3} placeholder="USD" placeholderTextColor={colors.textMuted} />

            {/* Pre-selected parent */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              {parentType === 'location' ? t('services.location') : t('services.category')}
            </Text>
            <View style={[inputStyle, styles.readonlyField]}>
              <Text style={{ color: colors.text }}>
                {parentType === 'location'
                  ? preSelectedLocationName ?? t('services.selectLocation')
                  : preSelectedCategoryName ?? t('services.selectCategory')}
              </Text>
            </View>

            {/* Picker for opposite parent */}
            {!service && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{pickerLabel}</Text>
                <TouchableOpacity
                  style={[inputStyle, styles.pickerTrigger]}
                  onPress={() => setShowPicker(!showPicker)}
                >
                  <Text style={{ color: selectedPickerItem ? colors.text : colors.textMuted }}>
                    {selectedPickerItem?.label ?? pickerLabel}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {pickerItems.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.pickerItem}
                        onPress={() => {
                          if (parentType === 'location') {
                            setSelectedCategoryId(item.id);
                          } else {
                            setSelectedLocationId(item.id);
                          }
                          setShowPicker(false);
                        }}
                      >
                        <Text style={{ color: colors.text }}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                    {pickerItems.length === 0 && (
                      <Text style={[styles.pickerEmpty, { color: colors.textMuted }]}>
                        {parentType === 'location'
                          ? t('services.noCategoriesAvailable')
                          : t('services.noLocationsAvailable')}
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{t('services.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  form: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  readonlyField: { opacity: 0.7 },
  pickerTrigger: { justifyContent: 'center' },
  pickerDropdown: { borderWidth: 1, borderRadius: 8, marginTop: 4 },
  pickerItem: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e5e5' },
  pickerEmpty: { padding: 12, textAlign: 'center' },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: 14 },
  cancelText: { fontSize: 16 },
  saveBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
