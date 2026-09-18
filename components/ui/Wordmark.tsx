import * as React from 'react';
import Image from 'next/image';
import styles from '@/styles/brand.module.css';

export function Wordmark({ size = 26, tone = 'full' }: { size?: number; tone?: 'full' | 'quiet' }) {
  const box = Math.round(size * 1.5);

  return (
    <span className={styles.lockup} style={{ fontSize: size }}>
      <Image
        className={styles.mark}
        src="/images/mark.png"
        alt=""
        width={box}
        height={box}
        priority
      />
      <span className={styles.word} style={tone === 'quiet' ? { opacity: 0.72 } : undefined}>
        Hainameet
      </span>
    </span>
  );
}
