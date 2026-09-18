'use client';

import * as React from 'react';
import { Track, type RemoteTrackPublication } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import styles from '@/styles/diagnostics.module.css';

function kbps(bitrate: number | undefined): string {
  return bitrate ? `${Math.ceil(bitrate / 1000)} kbps` : '-';
}

function publicationStatus(publication: RemoteTrackPublication): string {
  if (!publication.isSubscribed) return 'unsubscribed';
  return publication.isEnabled ? 'enabled' : 'disabled';
}

export function Diagnostics() {
  const room = useRoomContext();
  const [open, setOpen] = React.useState(false);
  const [, force] = React.useReducer((count: number) => count + 1, 0);
  const [sid, setSid] = React.useState('');

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === 'Escape') {
        setOpen(false);
      }
      if (event.shiftKey && event.key.toLowerCase() === 'd' && !event.ctrlKey && !event.metaKey) {
        setOpen((current) => !current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    room
      .getSid()
      .then(setSid)
      .catch(() => undefined);
    const handle = setInterval(force, 1000);
    return () => clearInterval(handle);
  }, [open, room]);

  if (!open) return null;

  const local = room.localParticipant;

  return (
    <div className={`pane pane-float ${styles.overlay}`}>
      <div className={styles.head}>
        <span>Diagnostics</span>
        <button type="button" className={styles.close} onClick={() => setOpen(false)}>
          Esc
        </button>
      </div>

      <div className={styles.row}>
        <span>Room</span>
        <span>{room.name}</span>
      </div>
      <div className={styles.row}>
        <span>SID</span>
        <span>{sid || '-'}</span>
      </div>
      <div className={styles.row}>
        <span>State</span>
        <span>{room.state}</span>
      </div>
      <div className={styles.row}>
        <span>Encryption</span>
        <span>{room.isE2EEEnabled ? 'On' : 'Off'}</span>
      </div>

      <div className={styles.group}>
        <div className={styles.groupTitle}>You · {local.identity}</div>
        {Array.from(local.trackPublications.values()).map((publication) => (
          <div key={publication.trackSid} className={styles.row}>
            <span>{publication.source}</span>
            <span>
              {publication.kind === Track.Kind.Video && publication.track?.dimensions
                ? `${publication.track.dimensions.width}x${publication.track.dimensions.height} · `
                : ''}
              {kbps(publication.track?.currentBitrate)}
            </span>
          </div>
        ))}
      </div>

      {Array.from(room.remoteParticipants.values()).map((participant) => (
        <div key={participant.sid} className={styles.group}>
          <div className={styles.groupTitle}>{participant.name || participant.identity}</div>
          {Array.from(participant.trackPublications.values()).map((publication) => (
            <div key={publication.trackSid} className={styles.row}>
              <span>{publication.source}</span>
              <span>
                {publicationStatus(publication)} · {kbps(publication.track?.currentBitrate)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
