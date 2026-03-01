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
import type {
  VendorLocation,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
} from '@sudobility/tapayoka_types';

interface Props {
  visible: boolean;
  location: VendorLocation | null;
  onClose: () => void;
  onSave: (data: VendorLocationCreateRequest | VendorLocationUpdateRequest) => Promise<void>;
}

export function LocationFormModal({ visible, location, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (location) {
        setName(location.name);
        setAddress(location.address);
        setCity(location.city);
        setStateProvince(location.stateProvince);
        setZipcode(location.zipcode);
        setCountry(location.country);
      } else {
        setName('');
        setAddress('');
        setCity('');
        setStateProvince('');
        setZipcode('');
        setCountry('');
      }
    }
  }, [visible, location]);

  const handleSave = async () => {
    if (!name.trim() || !address.trim() || !city.trim() || !stateProvince.trim() || !zipcode.trim() || !country.trim()) {
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        stateProvince: stateProvince.trim(),
        zipcode: zipcode.trim(),
        country: country.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {location ? t('locations.edit') : t('locations.add')}
          </Text>

          <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.name')}</Text>
            <TextInput style={inputStyle} value={name} onChangeText={setName} placeholder={t('locations.name')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.address')}</Text>
            <TextInput style={inputStyle} value={address} onChangeText={setAddress} placeholder={t('locations.address')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.city')}</Text>
            <TextInput style={inputStyle} value={city} onChangeText={setCity} placeholder={t('locations.city')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.stateProvince')}</Text>
            <TextInput style={inputStyle} value={stateProvince} onChangeText={setStateProvince} placeholder={t('locations.stateProvince')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.zipcode')}</Text>
            <TextInput style={inputStyle} value={zipcode} onChangeText={setZipcode} placeholder={t('locations.zipcode')} placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>{t('locations.country')}</Text>
            <TextInput style={inputStyle} value={country} onChangeText={setCountry} placeholder={t('locations.country')} placeholderTextColor={colors.textMuted} />
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
              <Text style={styles.saveText}>{t('locations.save')}</Text>
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
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { padding: 14 },
  cancelText: { fontSize: 16 },
  saveBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
