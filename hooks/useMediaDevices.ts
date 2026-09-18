'use client';

import * as React from 'react';

export type DeviceKind = 'videoinput' | 'audioinput' | 'audiooutput';

export function useMediaDevices(kind: DeviceKind) {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);

  const refresh = React.useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(all.filter((device) => device.kind === kind && device.deviceId));
    } catch {
      setDevices([]);
    }
  }, [kind]);

  React.useEffect(() => {
    refresh();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    const onChange = () => refresh();
    navigator.mediaDevices.addEventListener('devicechange', onChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', onChange);
  }, [refresh]);

  return { devices, refresh };
}

export function deviceLabel(device: MediaDeviceInfo, index: number, kind: DeviceKind): string {
  if (device.label) return device.label;
  const fallback: Record<DeviceKind, string> = {
    videoinput: 'Camera',
    audioinput: 'Microphone',
    audiooutput: 'Speaker',
  };
  return `${fallback[kind]} ${index + 1}`;
}
