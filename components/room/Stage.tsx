'use client';

import * as React from 'react';
import { Track } from 'livekit-client';
import {
  ParticipantTile,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import styles from '@/styles/room.module.css';
import { initialsOf } from '@/lib/client-utils';

function referenceId(reference: TrackReferenceOrPlaceholder): string {
  return `${reference.participant.identity}:${reference.publication?.trackSid ?? reference.source}`;
}

function columnsFor(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  if (count <= 16) return 4;
  return 5;
}

function Tile({
  reference,
  focused,
  onFocus,
}: {
  reference: TrackReferenceOrPlaceholder;
  focused?: boolean;
  onFocus?: () => void;
}) {
  const { participant } = reference;
  const dark = reference.source === Track.Source.Camera && !participant.isCameraEnabled;

  return (
    <>
      <ParticipantTile trackRef={reference} />
      {dark ? (
        <div className={styles.faceplate}>
          <span className={styles.face}>
            {initialsOf(participant.name || participant.identity)}
          </span>
        </div>
      ) : null}
      {onFocus ? (
        <button type="button" className={styles.pin} onClick={onFocus}>
          {focused ? 'Unpin' : 'Pin'}
        </button>
      ) : null}
    </>
  );
}

export const Stage = React.memo(function Stage() {
  const [pinned, setPinned] = React.useState<string | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const shared = tracks.find(
    (reference) => reference.publication?.source === Track.Source.ScreenShare,
  );

  const pinnedReference = pinned
    ? tracks.find((reference) => referenceId(reference) === pinned)
    : undefined;
  const hero = shared ?? pinnedReference;

  if (hero) {
    const rest = tracks.filter((reference) => referenceId(reference) !== referenceId(hero));
    return (
      <div className={styles.spotlight}>
        <div className={styles.spotMain}>
          <Tile
            reference={hero}
            focused={Boolean(pinnedReference) && !shared}
            onFocus={() => setPinned(null)}
          />
        </div>
        {rest.length > 0 ? (
          <div className={styles.strip}>
            {rest.map((reference) => (
              <div key={referenceId(reference)} className={styles.stripCell}>
                <Tile reference={reference} onFocus={() => setPinned(referenceId(reference))} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (tracks.length <= 1) {
    return (
      <div className={styles.spotlight}>
        <div className={styles.spotMain}>{tracks[0] ? <Tile reference={tracks[0]} /> : null}</div>
        <div className={styles.solo}>
          <h2 className={styles.soloTitle}>Nobody else is here yet</h2>
          <p className={styles.soloHint}>
            Copy the invite from the top bar and send it. The moment someone walks in you can put a
            question to the room.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.grid}
      style={{ '--cols': columnsFor(tracks.length) } as React.CSSProperties}
    >
      {tracks.map((reference) => (
        <div key={referenceId(reference)} className={styles.cell}>
          <Tile
            reference={reference}
            focused={referenceId(reference) === pinned}
            onFocus={() =>
              setPinned((current) =>
                current === referenceId(reference) ? null : referenceId(reference),
              )
            }
          />
        </div>
      ))}
    </div>
  );
});
