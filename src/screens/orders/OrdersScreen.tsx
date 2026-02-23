import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.empty}>No orders yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  empty: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 48 },
});
