import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

export function OrdersScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('orders.title')}</Text>
      <Text style={[styles.empty, { color: colors.textMuted }]}>{t('orders.empty')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', fontSize: 14, marginTop: 48 },
});
