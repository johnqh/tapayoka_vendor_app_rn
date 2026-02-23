import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function DevicesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Devices</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Set Up New Device via BLE</Text>
      </TouchableOpacity>
      <Text style={styles.empty}>
        No devices registered. Tap above to set up a device using Bluetooth.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6b7280', fontSize: 14 },
});
