import {
  AudioPresets,
  VideoPresets,
  type ExternalE2EEKeyProvider,
  type RoomConnectOptions,
  type RoomOptions,
  type TrackPublishDefaults,
  type VideoCaptureOptions,
  type VideoCodec,
  type VideoPreset,
} from 'livekit-client';
import { isLowPowerDevice } from './client-utils';
import type { JoinChoices, RoomOptionsFromUrl } from './types';

export type E2EESetup = {
  enabled: boolean;
  keyProvider: ExternalE2EEKeyProvider;
  worker?: Worker;
};

type Ladder = { capture: VideoPreset; layers: VideoPreset[] };

const FRUGAL: Ladder = {
  capture: VideoPresets.h360,
  layers: [VideoPresets.h180],
};

const STANDARD: Ladder = {
  capture: VideoPresets.h540,
  layers: [VideoPresets.h180, VideoPresets.h360],
};

const HIGH: Ladder = {
  capture: VideoPresets.h1080,
  layers: [VideoPresets.h360, VideoPresets.h720],
};

function pickLadder(hq: boolean): Ladder {
  if (isLowPowerDevice()) return FRUGAL;
  return hq ? HIGH : STANDARD;
}

export function buildRoomOptions(
  choices: JoinChoices,
  wanted: RoomOptionsFromUrl,
  e2ee?: E2EESetup,
): RoomOptions {
  const ladder = pickLadder(wanted.hq);

  let videoCodec: VideoCodec | undefined = wanted.codec;
  if (e2ee?.enabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
    videoCodec = undefined;
  }

  const videoCaptureDefaults: VideoCaptureOptions = {
    deviceId: choices.videoDeviceId,
    resolution: ladder.capture.resolution,
  };

  const publishDefaults: TrackPublishDefaults = {
    audioPreset: AudioPresets.speech,
    dtx: true,
    red: !e2ee?.enabled,
    simulcast: true,
    videoCodec,
    videoEncoding: ladder.capture.encoding,
    videoSimulcastLayers: ladder.layers,
  };

  return {
    videoCaptureDefaults,
    publishDefaults,
    audioCaptureDefaults: {
      deviceId: choices.audioDeviceId,
      autoGainControl: true,
      echoCancellation: true,
      noiseSuppression: true,
    },
    adaptiveStream: true,
    dynacast: true,
    e2ee:
      e2ee?.enabled && e2ee.worker
        ? { keyProvider: e2ee.keyProvider, worker: e2ee.worker }
        : undefined,
  };
}

export const connectOptions: RoomConnectOptions = {
  autoSubscribe: true,
  maxRetries: 6,
  peerConnectionTimeout: 25_000,
  websocketTimeout: 25_000,
};
