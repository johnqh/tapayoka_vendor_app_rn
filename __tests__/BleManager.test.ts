import {
  BLE_DEVICE_NAME_PREFIX,
  BLE_SERVICE_UUID,
  BLE_CHAR_DEVICE_INFO_UUID,
  BLE_CHAR_COMMAND_UUID,
  scanForDevices,
  readDeviceInfo,
  setupServerWallet,
} from '../src/services/ble/BleManager';

describe('BLE constants', () => {
  it('exports correct device name prefix', () => {
    expect(BLE_DEVICE_NAME_PREFIX).toBe('tapayoka-');
  });

  it('exports correct service UUID', () => {
    expect(BLE_SERVICE_UUID).toBe('000088F4-0000-1000-8000-00805f9b34fb');
  });

  it('exports correct characteristic UUIDs', () => {
    expect(BLE_CHAR_DEVICE_INFO_UUID).toBe('00000E32-0000-1000-8000-00805f9b34fb');
    expect(BLE_CHAR_COMMAND_UUID).toBe('00000E33-0000-1000-8000-00805f9b34fb');
  });
});

describe('scanForDevices', () => {
  it('returns empty array (stub)', async () => {
    const devices = await scanForDevices();
    expect(devices).toEqual([]);
  });
});

describe('readDeviceInfo', () => {
  it('returns null (stub)', async () => {
    const info = await readDeviceInfo('device-id');
    expect(info).toBeNull();
  });
});

describe('setupServerWallet', () => {
  it('returns false (stub)', async () => {
    const result = await setupServerWallet('device-id', '0xabc');
    expect(result).toBe(false);
  });
});
