'use client';

import * as React from 'react';
import styles from '@/styles/haina.module.css';
import { ASK_DURATIONS } from '@/lib/haina';

export function AskComposer({
  onAsk,
  onDismiss,
}: {
  onAsk: (question: string, ms: number) => void;
  onDismiss: () => void;
}) {
  const [question, setQuestion] = React.useState('');
  const [duration, setDuration] = React.useState<number>(ASK_DURATIONS[0]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onAsk(question, duration);
    onDismiss();
  };

  return (
    <form
      className={`pane pane-float ${styles.composer}`}
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss();
      }}
    >
      <div className={styles.composerRow}>
        <input
          ref={inputRef}
          className="field"
          value={question}
          maxLength={140}
          placeholder="Ship it on Friday, haina?"
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button type="submit" className="btn btn-gold">
          Ask
        </button>
      </div>

      <div className={styles.durations}>
        <span className={styles.durationsLabel}>Window</span>
        {ASK_DURATIONS.map((ms) => (
          <button
            key={ms}
            type="button"
            className={styles.duration}
            data-on={duration === ms}
            onClick={() => setDuration(ms)}
          >
            {ms / 1000}s
          </button>
        ))}
      </div>
    </form>
  );
}
