'use client';

import * as React from 'react';
import styles from '@/styles/prejoin.module.css';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { MicMeter } from '@/components/prejoin/MicMeter';
import { deviceLabel, useMediaDevices } from '@/hooks/useMediaDevices';
import { usePreviewStream } from '@/hooks/usePreviewStream';
import { useStoredIdentity } from '@/hooks/useStoredIdentity';
import { initialsOf } from '@/lib/client-utils';
import { prettifySlug } from '@/lib/room-names';
import type { JoinChoices } from '@/lib/types';

export function PreJoinStage({
  roomName,
  encrypted,
  connecting,
  failure,
  onEnter,
}: {
  roomName: string;
  encrypted: boolean;
  connecting: boolean;
  failure: string | null;
  onEnter: (choices: JoinChoices) => void;
}) {
  const { name, setName, remember, hydrated } = useStoredIdentity();
  const [cameraOn, setCameraOn] = React.useState(true);
  const [micOn, setMicOn] = React.useState(true);
  const [cameraId, setCameraId] = React.useState('');
  const [micId, setMicId] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const { devices: cameras, refresh: refreshCameras } = useMediaDevices('videoinput');
  const { devices: mics, refresh: refreshMics } = useMediaDevices('audioinput');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const preview = usePreviewStream({
    videoEnabled: cameraOn,
    audioEnabled: micOn,
    videoDeviceId: cameraId || undefined,
    audioDeviceId: micId || undefined,
  });

  React.useEffect(() => {
    if (preview.stream) {
      refreshCameras();
      refreshMics();
    }
  }, [preview.stream, refreshCameras, refreshMics]);

  React.useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.srcObject = preview.stream;
    if (preview.stream) element.play().catch(() => undefined);
  }, [preview.stream]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const enter = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim() || 'Guest';
    remember(trimmed);
    onEnter({
      username: trimmed,
      videoEnabled: cameraOn,
      audioEnabled: micOn,
      videoDeviceId: cameraId || undefined,
      audioDeviceId: micId || undefined,
    });
  };

  const showVideo = cameraOn && Boolean(preview.stream?.getVideoTracks().length);

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Wordmark size={20} />
        {encrypted ? (
          <span className={`pill ${styles.secretPill}`}>
            <Icon name="lock" size={12} /> End to end encrypted
          </span>
        ) : (
          <span className="pill">Waiting room</span>
        )}
      </header>

      <div className={styles.stage}>
        <div className={styles.preview}>
          <video ref={videoRef} muted playsInline style={{ opacity: showVideo ? 1 : 0 }} />

          {!showVideo ? (
            <div className={styles.previewIdle}>
              <span className={styles.initials}>{initialsOf(name || 'Guest')}</span>
              <p className={styles.idleNote}>
                {preview.denied
                  ? 'Your browser is holding on to the camera. Check the permission chip in the address bar.'
                  : 'Camera is off. Nobody will see you, and that is completely fine.'}
              </p>
            </div>
          ) : null}

          <span className={styles.previewTag}>{name.trim() || 'Guest'}</span>

          <div className={styles.previewDock}>
            <MicMeter track={micOn ? preview.audioTrack : null} />
            <button
              type="button"
              className={styles.round}
              data-off={!micOn}
              onClick={() => setMicOn((on) => !on)}
              aria-pressed={micOn}
              aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              <Icon name={micOn ? 'mic' : 'micOff'} size={18} />
            </button>
            <button
              type="button"
              className={styles.round}
              data-off={!cameraOn}
              onClick={() => setCameraOn((on) => !on)}
              aria-pressed={cameraOn}
              aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              <Icon name={cameraOn ? 'cam' : 'camOff'} size={18} />
            </button>
          </div>
        </div>

        <form className={styles.side} onSubmit={enter}>
          <div className={styles.heading}>
            <span className={styles.roomEyebrow}>You are joining</span>
            <h1 className={styles.roomName}>{prettifySlug(roomName)}</h1>
            <div className={styles.roomMeta}>
              <span className={styles.code}>{roomName}</span>
              <button type="button" className={`btn btn-quiet ${styles.copy}`} onClick={copyLink}>
                <Icon name={copied ? 'check' : 'copy'} size={13} />
                {copied ? 'Copied' : 'Copy invite'}
              </button>
            </div>
          </div>

          <div className={`pane ${styles.controls}`}>
            <div>
              <label className="label" htmlFor="prejoin-name">
                Your name
              </label>
              <input
                id="prejoin-name"
                className="field"
                value={name}
                maxLength={32}
                autoComplete="nickname"
                placeholder={hydrated ? 'Guest' : ''}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="prejoin-camera">
                Camera
              </label>
              <select
                id="prejoin-camera"
                className={styles.select}
                value={cameraId}
                onChange={(event) => setCameraId(event.target.value)}
              >
                <option value="">System default</option>
                {cameras.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {deviceLabel(device, index, 'videoinput')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="prejoin-mic">
                Microphone
              </label>
              <select
                id="prejoin-mic"
                className={styles.select}
                value={micId}
                onChange={(event) => setMicId(event.target.value)}
              >
                <option value="">System default</option>
                {mics.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {deviceLabel(device, index, 'audioinput')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {preview.denied ? (
            <p className={styles.denied}>
              No camera or microphone access. You can still walk in and listen, but the room will
              only hear silence from you.
            </p>
          ) : null}

          {failure ? <p className={styles.fail}>{failure}</p> : null}

          <button type="submit" className={`btn btn-gold ${styles.enter}`} disabled={connecting}>
            {connecting ? 'Getting you in…' : 'Join the room'}
            {connecting ? null : <Icon name="arrow" size={17} />}
          </button>
        </form>
      </div>
    </div>
  );
}
