/**
 * Transport-agnostic BLE exports.
 * Delegates to WsBleManager in WS mode, BleManager otherwise.
 */

import { env } from '@/config/env';

export {
  BLE_DEVICE_NAME_PREFIX,
  BLE_SERVICE_UUID,
  BLE_CHAR_DEVICE_INFO_UUID,
  BLE_CHAR_COMMAND_UUID,
} from './BleManager';
export type { DiscoveredDevice, DeviceInfo } from './BleManager';

import * as Ble from './BleManager';
import * as Ws from './WsBleManager';

const transport = env.TRANSPORT === 'ws' ? Ws : Ble;

export const scanForDevices = transport.scanForDevices;
export const readDeviceInfo = transport.readDeviceInfo;
export const setupServerWallet = transport.setupServerWallet;
