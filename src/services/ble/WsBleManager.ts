/**
 * WebSocket transport for vendor device setup (local development).
 * Drop-in replacement for BleManager when EXPO_PUBLIC_TRANSPORT=ws.
 */

import { env } from '@/config/env';
import type { DiscoveredDevice, DeviceInfo } from './BleManager';

const connections = new Map<string, WebSocket>();

function getOrCreateConnection(url: string): Promise<WebSocket> {
  const existing = connections.get(url);
  if (existing && existing.readyState === WebSocket.OPEN) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.onopen = () => {
      connections.set(url, ws);
      resolve(ws);
    };
    ws.onerror = (e) => reject(e);
  });
}

function sendAndReceive<T>(
  ws: WebSocket,
  message: object,
  expectedType: string,
  timeoutMs: number = 10000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error('WS timeout'));
    }, timeoutMs);
    const handler = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === expectedType) {
          ws.removeEventListener('message', handler);
          clearTimeout(timeout);
          resolve(msg.data as T);
        }
      } catch {
        /* ignore parse errors from other messages */
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify(message));
  });
}

export async function scanForDevices(_timeoutMs: number = 10000): Promise<DiscoveredDevice[]> {
  const wsUrl = env.WS_DEVICE_URL;
  try {
    const ws = await getOrCreateConnection(wsUrl);
    const info = await sendAndReceive<{ walletAddress: string }>(
      ws,
      { type: 'read_device_info' },
      'device_info',
      _timeoutMs,
    );

    return [
      {
        id: wsUrl,
        name: `tapayoka-${info.walletAddress.slice(2, 10).toLowerCase()}`,
        walletAddressPrefix: info.walletAddress.slice(2, 10).toLowerCase(),
        rssi: -30,
      },
    ];
  } catch (e) {
    console.log('[WS] Scan failed:', e);
    return [];
  }
}

export async function readDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
  try {
    const ws = await getOrCreateConnection(deviceId);
    return await sendAndReceive<DeviceInfo>(ws, { type: 'read_device_info' }, 'device_info');
  } catch (e) {
    console.log('[WS] readDeviceInfo failed:', e);
    return null;
  }
}

export async function setupServerWallet(
  deviceId: string,
  serverWalletAddress: string,
): Promise<boolean> {
  try {
    const ws = await getOrCreateConnection(deviceId);
    const result = await sendAndReceive<{ status: string }>(
      ws,
      {
        type: 'command',
        data: { command: 'SETUP_SERVER', payload: serverWalletAddress },
      },
      'response',
    );
    return result.status === 'OK';
  } catch (e) {
    console.log('[WS] setupServerWallet failed:', e);
    return false;
  }
}
