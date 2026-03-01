import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import {
  scanForDevices,
  readDeviceInfo,
  setupServerWallet,
  type DiscoveredDevice,
  type DeviceInfo,
} from '@/services/ble';

export function DevicesScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();

  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<(DiscoveredDevice & { info?: DeviceInfo }) | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    setSelectedDevice(null);
    try {
      const found = await scanForDevices();
      setDevices(found);
      if (found.length === 0) {
        Alert.alert('No devices found', 'Make sure tapayoka_pi is running.');
      }
    } catch (e) {
      Alert.alert('Scan failed', String(e));
    } finally {
      setScanning(false);
    }
  };

  const handleSelectDevice = async (device: DiscoveredDevice) => {
    setLoading(true);
    try {
      const info = await readDeviceInfo(device.id);
      setSelectedDevice({ ...device, info: info ?? undefined });
    } catch (e) {
      Alert.alert('Read failed', String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleSetupServerWallet = async () => {
    if (!selectedDevice) return;
    setLoading(true);
    try {
      // Use a test server wallet address for local dev
      const testAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08';
      const ok = await setupServerWallet(selectedDevice.id, testAddress);
      if (ok) {
        Alert.alert('Success', 'Server wallet configured on device.');
        // Re-read device info to see updated hasServerWallet
        const info = await readDeviceInfo(selectedDevice.id);
        setSelectedDevice({ ...selectedDevice, info: info ?? undefined });
      } else {
        Alert.alert('Failed', 'Could not configure server wallet.');
      }
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{t('devices.title')}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleScan}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('devices.setupBle')}</Text>
        )}
      </TouchableOpacity>

      {devices.length === 0 && !scanning && (
        <Text style={[styles.empty, { color: colors.textMuted }]}>{t('devices.empty')}</Text>
      )}

      {devices.map((device) => (
        <TouchableOpacity
          key={device.id}
          style={[styles.deviceCard, { backgroundColor: colors.card }]}
          onPress={() => handleSelectDevice(device)}
        >
          <Text style={[styles.deviceName, { color: colors.text }]}>{device.name}</Text>
          <Text style={[styles.deviceMeta, { color: colors.textMuted }]}>
            RSSI: {device.rssi} dBm
          </Text>
        </TouchableOpacity>
      ))}

      {loading && <ActivityIndicator style={styles.loader} />}

      {selectedDevice?.info && (
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Device Info</Text>
          <Text style={[styles.infoRow, { color: colors.text }]}>
            Wallet: {selectedDevice.info.walletAddress}
          </Text>
          <Text style={[styles.infoRow, { color: colors.text }]}>
            Firmware: {selectedDevice.info.firmwareVersion}
          </Text>
          <Text style={[styles.infoRow, { color: colors.text }]}>
            Server wallet: {selectedDevice.info.hasServerWallet ? 'configured' : 'not set'}
          </Text>

          {!selectedDevice.info.hasServerWallet && (
            <TouchableOpacity
              style={[styles.setupButton, { backgroundColor: colors.primary }]}
              onPress={handleSetupServerWallet}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Setup Server Wallet</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  button: { padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', fontSize: 14 },
  deviceCard: { padding: 16, borderRadius: 12, marginBottom: 8 },
  deviceName: { fontSize: 16, fontWeight: '600' },
  deviceMeta: { fontSize: 12, marginTop: 4 },
  loader: { marginVertical: 16 },
  infoCard: { padding: 16, borderRadius: 12, marginTop: 16 },
  infoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  infoRow: { fontSize: 13, fontFamily: 'monospace', marginBottom: 6 },
  setupButton: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
});
