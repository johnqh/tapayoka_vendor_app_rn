import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

export function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
      <Text style={[styles.item, { color: colors.text, borderBottomColor: colors.border }]}>
        {t('settings.account')}
      </Text>
      <Text style={[styles.item, { color: colors.text, borderBottomColor: colors.border }]}>
        {t('settings.notifications')}
      </Text>
      <Text style={[styles.item, { color: colors.text, borderBottomColor: colors.border }]}>
        {t('settings.about')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  item: { fontSize: 16, paddingVertical: 12, borderBottomWidth: 1 },
});
