'use client';

import * as React from 'react';
import { DeviceUnsupportedError, Room, RoomEvent, type VideoCodec } from 'livekit-client';
import { RoomContext } from '@livekit/components-react';
import { PreJoinStage } from '@/components/prejoin/PreJoinStage';
import { LeaveScreen } from '@/components/room/LeaveScreen';
import { RoomShell } from '@/components/room/RoomShell';
import { useE2EE } from '@/hooks/useE2EE';
import { buildRoomOptions, connectOptions } from '@/lib/room-options';
import type { ConnectionDetails, JoinChoices } from '@/lib/types';
import type { Receipt } from '@/lib/haina';

const ENDPOINT = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details';

type Phase = 'prejoin' | 'joining' | 'live' | 'left';

export function RoomClient({
  roomName,
  region,
  hq,
  codec,
}: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const e2ee = useE2EE();
  const [room, setRoom] = React.useState<Room | null>(null);
  const [phase, setPhase] = React.useState<Phase>('prejoin');
  const [failure, setFailure] = React.useState<string | null>(null);
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);

  React.useEffect(() => {
    if (!room) return;
    return () => {
      room.disconnect().catch(() => undefined);
    };
  }, [room]);

  const join = React.useCallback(
    async (choices: JoinChoices) => {
      setPhase('joining');
      setFailure(null);

      let next: Room | undefined;
      try {
        const url = new URL(ENDPOINT, window.location.origin);
        url.searchParams.set('roomName', roomName);
        url.searchParams.set('participantName', choices.username);
        if (region) url.searchParams.set('region', region);

        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error((await response.text()) || 'The token server said no.');
        }
        const details: ConnectionDetails = await response.json();

        next = new Room(buildRoomOptions(choices, { hq, codec }, e2ee));
        next.once(RoomEvent.Disconnected, () => setPhase('left'));

        if (e2ee.enabled && e2ee.passphrase) {
          await e2ee.keyProvider.setKey(e2ee.passphrase);
          await next.setE2EEEnabled(true);
        }

        await next.connect(details.serverUrl, details.participantToken, connectOptions);

        if (choices.audioEnabled) {
          await next.localParticipant.setMicrophoneEnabled(true).catch(() => undefined);
        }
        if (choices.videoEnabled) {
          await next.localParticipant.setCameraEnabled(true).catch(() => undefined);
        }

        setRoom(next);
        setPhase('live');
      } catch (error) {
        await next?.disconnect().catch(() => undefined);
        setPhase('prejoin');
        setFailure(
          error instanceof DeviceUnsupportedError
            ? 'This browser cannot join encrypted calls. Update it, or drop the passphrase from the link.'
            : error instanceof Error
              ? error.message
              : 'Could not get you in. Try again.',
        );
      }
    },
    [roomName, region, hq, codec, e2ee],
  );

  if (phase === 'left') {
    return (
      <LeaveScreen
        roomName={roomName}
        receipts={receipts}
        onRejoin={() => {
          setRoom(null);
          setReceipts([]);
          setPhase('prejoin');
        }}
      />
    );
  }

  if (room && phase === 'live') {
    return (
      <RoomContext.Provider value={room}>
        <RoomShell roomName={roomName} onReceipts={setReceipts} />
      </RoomContext.Provider>
    );
  }

  return (
    <PreJoinStage
      roomName={roomName}
      encrypted={e2ee.enabled}
      connecting={phase === 'joining'}
      failure={failure}
      onEnter={join}
    />
  );
}
