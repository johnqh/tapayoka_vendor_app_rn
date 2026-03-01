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
import type { VendorServiceControl } from '@sudobility/tapayoka_types';

interface Props {
  visible: boolean;
  control: VendorServiceControl | null;
  onClose: () => void;
  onSave: (data: { pinNumber: number; duration: number }) => Promise<void>;
}

export function ServiceControlForm({ visible, control, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  const [pinNumber, setPinNumber] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setPinNumber(control ? String(control.pinNumber) : '');
      setDuration(control ? String(control.duration) : '');
    }
  }, [visible, control]);

  const handleSave = async () => {
    const pin = parseInt(pinNumber, 10);
    const dur = parseInt(duration, 10);
    if (isNaN(pin) || pin < 1 || pin > 5 || isNaN(dur) || dur <= 0) return;
    setSaving(true);
    try {
      await onSave({ pinNumber: pin, duration: dur });
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
            {control ? t('serviceControls.edit') : t('serviceControls.add')}
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('serviceControls.pinNumber')} (1-5)
          </Text>
          <TextInput
            style={inputStyle}
            value={pinNumber}
            onChangeText={setPinNumber}
            keyboardType="number-pad"
            maxLength={1}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {t('serviceControls.durationSeconds')}
          </Text>
          <TextInput
            style={inputStyle}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor={colors.textMuted}
          />

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
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  cancelBtn: { padding: 14 },
  cancelText: { fontSize: 16 },
  saveBtn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
