import {
  VideoPresets,
  type ExternalE2EEKeyProvider,
  type RoomOptions,
  type TrackPublishDefaults,
  type VideoCaptureOptions,
  type VideoCodec,
} from 'livekit-client';
import { isLowPowerDevice } from './client-utils';
import type { JoinChoices, RoomOptionsFromUrl } from './types';

export type E2EESetup = {
  enabled: boolean;
  keyProvider: ExternalE2EEKeyProvider;
  worker?: Worker;
};

export function buildRoomOptions(
  choices: JoinChoices,
  wanted: RoomOptionsFromUrl,
  e2ee?: E2EESetup,
): RoomOptions {
  let videoCodec: VideoCodec | undefined = wanted.codec ?? 'vp9';
  if (e2ee?.enabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
    videoCodec = undefined;
  }

  const videoCaptureDefaults: VideoCaptureOptions = {
    deviceId: choices.videoDeviceId,
    resolution: wanted.hq ? VideoPresets.h2160 : VideoPresets.h720,
  };

  const publishDefaults: TrackPublishDefaults = {
    dtx: false,
    red: !e2ee?.enabled,
    videoCodec,
    videoSimulcastLayers: wanted.hq
      ? [VideoPresets.h1080, VideoPresets.h720]
      : [VideoPresets.h540, VideoPresets.h216],
  };

  if (isLowPowerDevice()) {
    videoCaptureDefaults.resolution = VideoPresets.h360;
    publishDefaults.simulcast = false;
    publishDefaults.scalabilityMode = 'L1T3';
  }

  return {
    videoCaptureDefaults,
    publishDefaults,
    audioCaptureDefaults: { deviceId: choices.audioDeviceId },
    adaptiveStream: { pixelDensity: 'screen' },
    dynacast: true,
    e2ee:
      e2ee?.enabled && e2ee.worker
        ? { keyProvider: e2ee.keyProvider, worker: e2ee.worker }
        : undefined,
  };
}
