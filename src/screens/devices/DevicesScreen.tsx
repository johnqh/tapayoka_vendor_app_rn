import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

export function DevicesScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('devices.title')}</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={styles.buttonText}>{t('devices.setupBle')}</Text>
      </TouchableOpacity>
      <Text style={[styles.empty, { color: colors.textMuted }]}>
        {t('devices.empty')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', fontSize: 14 },
});
