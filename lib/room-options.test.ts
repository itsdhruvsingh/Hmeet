import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioPresets, VideoPresets } from 'livekit-client';
import { buildRoomOptions, connectOptions } from './room-options';
import type { JoinChoices } from './types';

const choices: JoinChoices = { username: 'dhruv', videoEnabled: true, audioEnabled: true };

function withCores(cores: number) {
  vi.stubGlobal('navigator', { hardwareConcurrency: cores });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('audio publishing', () => {
  it('leaves discontinuous transmission on so silence costs nothing', () => {
    withCores(8);
    expect(buildRoomOptions(choices, { hq: false, codec: 'vp8' }).publishDefaults?.dtx).toBe(true);
  });

  it('publishes speech rather than music bitrate', () => {
    withCores(8);
    const options = buildRoomOptions(choices, { hq: false, codec: 'vp8' });
    expect(options.publishDefaults?.audioPreset).toBe(AudioPresets.speech);
    expect(options.publishDefaults?.audioPreset?.maxBitrate).toBe(24_000);
  });

  it('keeps redundant audio on, except under end to end encryption', () => {
    withCores(8);
    expect(buildRoomOptions(choices, { hq: false, codec: 'vp8' }).publishDefaults?.red).toBe(true);
    const encrypted = buildRoomOptions(
      choices,
      { hq: false, codec: 'vp8' },
      {
        enabled: true,
        keyProvider: {} as never,
        worker: {} as never,
      },
    );
    expect(encrypted.publishDefaults?.red).toBe(false);
  });
});

describe('video ladder', () => {
  it('caps standard capture at 540p with a 180p floor', () => {
    withCores(8);
    const options = buildRoomOptions(choices, { hq: false, codec: 'vp8' });
    expect(options.videoCaptureDefaults?.resolution).toEqual(VideoPresets.h540.resolution);
    expect(options.publishDefaults?.videoSimulcastLayers).toEqual([
      VideoPresets.h180,
      VideoPresets.h360,
    ]);
  });

  it('raises the ladder only when high quality is requested', () => {
    withCores(8);
    const options = buildRoomOptions(choices, { hq: true, codec: 'vp8' });
    expect(options.videoCaptureDefaults?.resolution).toEqual(VideoPresets.h1080.resolution);
  });

  it('drops resolution on weak devices but never gives up simulcast', () => {
    withCores(2);
    const options = buildRoomOptions(choices, { hq: false, codec: 'vp8' });
    expect(options.videoCaptureDefaults?.resolution).toEqual(VideoPresets.h360.resolution);
    expect(options.publishDefaults?.simulcast).toBe(true);
  });

  it('carries a frame rate into the capture constraints', () => {
    withCores(8);
    const resolution = buildRoomOptions(choices, { hq: false, codec: 'vp8' }).videoCaptureDefaults
      ?.resolution;
    expect(resolution?.frameRate).toBeGreaterThan(0);
  });
});

describe('codec selection', () => {
  it('honours an explicit codec', () => {
    withCores(8);
    expect(buildRoomOptions(choices, { hq: false, codec: 'vp9' }).publishDefaults?.videoCodec).toBe(
      'vp9',
    );
  });

  it('falls back off svc codecs under end to end encryption', () => {
    withCores(8);
    const options = buildRoomOptions(
      choices,
      { hq: false, codec: 'vp9' },
      {
        enabled: true,
        keyProvider: {} as never,
        worker: {} as never,
      },
    );
    expect(options.publishDefaults?.videoCodec).toBeUndefined();
  });
});

describe('room behaviour', () => {
  it('lets the receiver drive layer selection', () => {
    withCores(8);
    const options = buildRoomOptions(choices, { hq: false, codec: 'vp8' });
    expect(options.adaptiveStream).toBe(true);
    expect(options.dynacast).toBe(true);
  });

  it('retries hard enough to survive a flaky signal link', () => {
    expect(connectOptions.maxRetries).toBeGreaterThanOrEqual(5);
  });
});
