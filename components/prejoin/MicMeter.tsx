'use client';

import * as React from 'react';
import styles from '@/styles/prejoin.module.css';

const BARS = 14;

export function MicMeter({ track }: { track: MediaStreamTrack | null }) {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!track || !host) return;

    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const source = context.createMediaStreamSource(new MediaStream([track]));
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const cells = Array.from(host.children) as HTMLElement[];
    let frame = 0;

    const wake = () => context.resume().catch(() => undefined);
    wake();
    window.addEventListener('pointerdown', wake, { once: true });

    const tick = () => {
      analyser.getByteFrequencyData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
      const level = Math.min(1, Math.sqrt(sum / buffer.length) / 90);
      const lit = Math.round(level * BARS);
      cells.forEach((cell, index) => {
        cell.dataset.lit = index < lit ? 'true' : 'false';
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointerdown', wake);
      source.disconnect();
      context.close().catch(() => undefined);
    };
  }, [track]);

  return (
    <div className={styles.meter} ref={hostRef} aria-hidden="true">
      {Array.from({ length: BARS }, (_, index) => (
        <span key={index} className={styles.meterCell} data-lit="false" />
      ))}
    </div>
  );
}
