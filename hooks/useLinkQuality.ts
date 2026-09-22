'use client';

import * as React from 'react';
import { ConnectionQuality, RoomEvent, type Participant } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';

export function useLinkQuality(): ConnectionQuality {
  const room = useRoomContext();
  const [quality, setQuality] = React.useState<ConnectionQuality>(
    () => room.localParticipant.connectionQuality ?? ConnectionQuality.Unknown,
  );

  React.useEffect(() => {
    const onChange = (next: ConnectionQuality, participant: Participant) => {
      if (participant.identity !== room.localParticipant.identity) return;
      setQuality(next);
    };

    setQuality(room.localParticipant.connectionQuality ?? ConnectionQuality.Unknown);
    room.on(RoomEvent.ConnectionQualityChanged, onChange);
    return () => {
      room.off(RoomEvent.ConnectionQualityChanged, onChange);
    };
  }, [room]);

  return quality;
}
