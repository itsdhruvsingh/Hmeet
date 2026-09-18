'use client';

import * as React from 'react';
import { isLocalTrack, type LocalTrackPublication } from 'livekit-client';
import { useLocalParticipant } from '@livekit/components-react';

export const BACKDROP_NONE = 'none';
export const BACKDROP_BLUR = 'blur';

export function useBackdrop() {
  const { cameraTrack } = useLocalParticipant();
  const [backdrop, setBackdrop] = React.useState(BACKDROP_NONE);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    const track = (cameraTrack as LocalTrackPublication | undefined)?.track;
    if (!isLocalTrack(track)) return;

    let live = true;
    setPending(true);

    const apply = async () => {
      if (backdrop === BACKDROP_NONE) {
        await track.stopProcessor();
        return;
      }
      const { BackgroundBlur, VirtualBackground } = await import('@livekit/track-processors');
      if (!live) return;
      await track.setProcessor(
        backdrop === BACKDROP_BLUR ? BackgroundBlur() : VirtualBackground(backdrop),
      );
    };

    apply()
      .catch(() => undefined)
      .finally(() => {
        if (live) setPending(false);
      });

    return () => {
      live = false;
    };
  }, [cameraTrack, backdrop]);

  return { backdrop, setBackdrop, pending };
}
