'use client';

import * as React from 'react';
import styles from '@/styles/room.module.css';
import type { FlyingStamp } from '@/hooks/useHaina';

export const StampLayer = React.memo(function StampLayer({ stamps }: { stamps: FlyingStamp[] }) {
  return (
    <div className={styles.stampLayer} aria-hidden="true">
      {stamps.map((stamp) => (
        <span
          key={stamp.key}
          className={styles.stamp}
          style={
            {
              left: `${stamp.lane}%`,
              '--drift': `${stamp.drift}px`,
              '--spin': `${stamp.spin}deg`,
              '--scale': stamp.scale,
            } as React.CSSProperties
          }
        >
          {stamp.glyph}
          <span className={styles.stampWho}>{stamp.from}</span>
        </span>
      ))}
    </div>
  );
});
