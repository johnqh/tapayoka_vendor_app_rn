/**
 * BLE Manager for vendor device setup.
 * Wraps react-native-ble-plx for scanning, connecting, and configuring Tapayoka devices.
 */

export const BLE_DEVICE_NAME_PREFIX = 'tapayoka-';
export const BLE_SERVICE_UUID = '000088F4-0000-1000-8000-00805f9b34fb';
export const BLE_CHAR_DEVICE_INFO_UUID = '00000E32-0000-1000-8000-00805f9b34fb';
export const BLE_CHAR_COMMAND_UUID = '00000E33-0000-1000-8000-00805f9b34fb';

export interface DiscoveredDevice {
  id: string;
  name: string;
  walletAddressPrefix: string;
  rssi: number;
}

export interface DeviceInfo {
  walletAddress: string;
  firmwareVersion: string;
  hasServerWallet: boolean;
  signedPayload: string;
  signature: string;
}

export async function scanForDevices(_timeoutMs: number = 10000): Promise<DiscoveredDevice[]> {
  // TODO: Implement with react-native-ble-plx
  console.log('[BLE] Scanning for devices with prefix:', BLE_DEVICE_NAME_PREFIX);
  return [];
}

export async function readDeviceInfo(_deviceId: string): Promise<DeviceInfo | null> {
  // TODO: Connect via BLE, read BLE_CHAR_DEVICE_INFO_UUID
  return null;
}

export async function setupServerWallet(
  _deviceId: string,
  _serverWalletAddress: string,
): Promise<boolean> {
  // TODO: Write SETUP_SERVER command to BLE_CHAR_COMMAND_UUID
  return false;
}
