'use client';

import * as React from 'react';

export type PreviewRequest = {
  videoEnabled: boolean;
  audioEnabled: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
};

export type PreviewState = {
  stream: MediaStream | null;
  audioTrack: MediaStreamTrack | null;
  denied: boolean;
  pending: boolean;
};

export function usePreviewStream(request: PreviewRequest): PreviewState {
  const { videoEnabled, audioEnabled, videoDeviceId, audioDeviceId } = request;
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [denied, setDenied] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    if (!videoEnabled && !audioEnabled) {
      setStream(null);
      return;
    }

    let live = true;
    let acquired: MediaStream | null = null;
    setPending(true);

    navigator.mediaDevices
      .getUserMedia({
        video: videoEnabled
          ? { deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined }
          : false,
        audio: audioEnabled
          ? { deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined }
          : false,
      })
      .then((next) => {
        acquired = next;
        if (!live) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        setDenied(false);
        setStream(next);
      })
      .catch(() => {
        if (!live) return;
        setDenied(true);
        setStream(null);
      })
      .finally(() => {
        if (live) setPending(false);
      });

    return () => {
      live = false;
      acquired?.getTracks().forEach((track) => track.stop());
    };
  }, [videoEnabled, audioEnabled, videoDeviceId, audioDeviceId]);

  return {
    stream,
    audioTrack: stream?.getAudioTracks()[0] ?? null,
    denied,
    pending,
  };
}
