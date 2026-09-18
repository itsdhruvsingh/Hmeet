'use client';

import * as React from 'react';
import { Track } from 'livekit-client';
import { useParticipants, useRoomContext } from '@livekit/components-react';
import panels from '@/styles/panels.module.css';
import { Panel } from '@/components/room/Panel';
import { Icon } from '@/components/ui/Icon';
import { initialsOf } from '@/lib/client-utils';

export function PeoplePanel({ onClose }: { onClose: () => void }) {
  const room = useRoomContext();
  const participants = useParticipants();

  return (
    <Panel title={`In the room · ${participants.length}`} onClose={onClose}>
      {participants.map((participant) => {
        const label =
          participant.identity === room.localParticipant.identity
            ? `${participant.name || participant.identity} (you)`
            : participant.name || participant.identity;
        const micOn = participant.isMicrophoneEnabled;
        const camOn = participant.isCameraEnabled;
        const sharing = participant.getTrackPublication(Track.Source.ScreenShare) !== undefined;

        return (
          <div key={participant.identity} className={panels.peopleRow}>
            <span className={panels.avatar}>
              {initialsOf(participant.name || participant.identity)}
            </span>
            <span className={panels.peopleName}>{label}</span>
            {sharing ? <Icon name="screen" size={15} /> : null}
            <Icon name={camOn ? 'cam' : 'camOff'} size={15} style={{ opacity: camOn ? 1 : 0.4 }} />
            <Icon name={micOn ? 'mic' : 'micOff'} size={15} style={{ opacity: micOn ? 1 : 0.4 }} />
          </div>
        );
      })}
    </Panel>
  );
}
