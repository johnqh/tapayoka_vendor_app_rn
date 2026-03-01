import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import type { VendorEquipment } from '@sudobility/tapayoka_types';

interface Props {
  visible: boolean;
  equipment: VendorEquipment | null;
  onClose: () => void;
  onSave: (data: { name: string; walletAddress?: string }) => Promise<void>;
}

const generateWalletAddress = (): string => {
  const bytes = new Uint8Array(20);
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

export function EquipmentForm({ visible, equipment, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  const [name, setName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (equipment) {
        setName(equipment.name);
        setWalletAddress(equipment.walletAddress);
      } else {
        setName('');
        setWalletAddress(generateWalletAddress());
      }
    }
  }, [visible, equipment]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (equipment) {
        await onSave({ name: name.trim() });
      } else {
        await onSave({ name: name.trim(), walletAddress });
      }
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
            {equipment ? t('equipments.edit') : t('equipments.add')}
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('equipments.name')}
          </Text>
          <TextInput
            style={inputStyle}
            value={name}
            onChangeText={setName}
            placeholder={t('equipments.name')}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('equipments.walletAddress')}
          </Text>
          <View style={[inputStyle, styles.addressContainer]}>
            <Text style={[styles.addressText, { color: equipment ? colors.textMuted : colors.text }]} numberOfLines={1}>
              {walletAddress}
            </Text>
            {!equipment && (
              <TouchableOpacity onPress={() => setWalletAddress(generateWalletAddress())}>
                <Text style={[styles.regenerate, { color: colors.primary }]}>
                  {t('equipments.regenerate')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  addressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addressText: { fontSize: 12, fontFamily: 'monospace', flex: 1 },
  regenerate: { fontSize: 13, fontWeight: '500', marginLeft: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelBtn: { padding: 14 },
  cancelText: { fontSize: 16 },
  saveBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
