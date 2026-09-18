import * as React from 'react';
import styles from '@/styles/landing.module.css';
import { Wordmark } from '@/components/ui/Wordmark';
import { JoinCard } from '@/components/home/JoinCard';

export function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Wordmark size={23} />
      </header>

      <main className={styles.shell}>
        <JoinCard />
      </main>
    </div>
  );
}
