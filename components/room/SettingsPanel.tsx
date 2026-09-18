'use client';

import * as React from 'react';
import { useRoomContext } from '@livekit/components-react';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import panels from '@/styles/panels.module.css';
import { Panel } from '@/components/room/Panel';
import { BACKDROP_BLUR, BACKDROP_NONE, useBackdrop } from '@/hooks/useBackdrop';
import { deviceLabel, useMediaDevices, type DeviceKind } from '@/hooks/useMediaDevices';
import { isLowPowerDevice } from '@/lib/client-utils';

type Backdrop = { id: string; label: string; image?: string };

const BACKDROPS: Backdrop[] = [
  { id: BACKDROP_NONE, label: 'Off' },
  { id: BACKDROP_BLUR, label: 'Blur' },
  { id: '/background-images/samantha-gades-BlIhVfXbi9s-unsplash.jpg', label: 'Desk' },
  { id: '/background-images/ali-kazal-tbw_KQE3Cbg-unsplash.jpg', label: 'Leaf' },
];

const SHORTCUTS = [
  { keys: 'Ctrl + Shift + H', what: 'Ask the room' },
  { keys: 'Ctrl + Shift + A', what: 'Toggle microphone' },
  { keys: 'Ctrl + Shift + V', what: 'Toggle camera' },
  { keys: 'Shift + D', what: 'Diagnostics overlay' },
];

function DeviceSelect({
  kind,
  label,
  id,
  onPick,
}: {
  kind: DeviceKind;
  label: string;
  id: string;
  onPick: (deviceId: string) => void;
}) {
  const { devices } = useMediaDevices(kind);
  const [value, setValue] = React.useState('');

  if (devices.length === 0) return null;

  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={panels.select}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onPick(event.target.value);
        }}
      >
        <option value="">System default</option>
        {devices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            {deviceLabel(device, index, kind)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const room = useRoomContext();
  const { backdrop, setBackdrop, pending } = useBackdrop();
  const { isNoiseFilterEnabled, setNoiseFilterEnabled, isNoiseFilterPending } = useKrispNoiseFilter(
    {
      filterOptions: { quality: isLowPowerDevice() ? 'low' : 'medium' },
    },
  );

  const switchDevice = (kind: MediaDeviceKind) => (deviceId: string) => {
    if (!deviceId) return;
    room.switchActiveDevice(kind, deviceId).catch(() => undefined);
  };

  return (
    <Panel title="Settings" onClose={onClose}>
      <section className={panels.section}>
        <div className={panels.sectionTitle}>Camera</div>
        <div className={panels.stack}>
          <DeviceSelect
            kind="videoinput"
            id="settings-camera"
            label="Input"
            onPick={switchDevice('videoinput')}
          />
          <div>
            <span className="label">Backdrop</span>
            <div className={panels.backdrops}>
              {BACKDROPS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={panels.backdrop}
                  data-on={backdrop === option.id}
                  disabled={pending}
                  onClick={() => setBackdrop(option.id)}
                  style={
                    option.id.startsWith('/') ? { backgroundImage: `url(${option.id})` } : undefined
                  }
                >
                  {option.id === 'blur' ? <span className={panels.blurPreview} /> : null}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={panels.section}>
        <div className={panels.sectionTitle}>Audio</div>
        <div className={panels.stack}>
          <DeviceSelect
            kind="audioinput"
            id="settings-mic"
            label="Microphone"
            onPick={switchDevice('audioinput')}
          />
          <DeviceSelect
            kind="audiooutput"
            id="settings-speaker"
            label="Speaker"
            onPick={switchDevice('audiooutput')}
          />
          <div className={panels.toggleRow}>
            <span>Background noise removal</span>
            <button
              type="button"
              className={panels.switch}
              data-on={isNoiseFilterEnabled}
              disabled={isNoiseFilterPending}
              onClick={() => setNoiseFilterEnabled(!isNoiseFilterEnabled)}
              aria-pressed={isNoiseFilterEnabled}
              aria-label="Toggle background noise removal"
            />
          </div>
        </div>
      </section>

      <section className={panels.section}>
        <div className={panels.sectionTitle}>Shortcuts</div>
        <div className={panels.keys}>
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys} className={panels.keyRow}>
              <span>{shortcut.what}</span>
              <span className={panels.keyCombo}>{shortcut.keys}</span>
            </div>
          ))}
        </div>
      </section>
    </Panel>
  );
}
