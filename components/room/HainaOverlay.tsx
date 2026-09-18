'use client';

import * as React from 'react';
import styles from '@/styles/haina.module.css';
import { CHOICES, CHOICE_META, tallyOf, totalVotes, type Choice, type LivePoll } from '@/lib/haina';
import type { FrozenResult } from '@/hooks/useHaina';

const RING_RADIUS = 15;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function Bars({ tally, dim }: { tally: Record<Choice, number>; dim: boolean }) {
  const total = Math.max(1, totalVotes(tally));
  return (
    <div className={styles.bars}>
      {CHOICES.map((choice) => (
        <div key={choice} className={styles.bar}>
          <span style={{ color: dim ? undefined : CHOICE_META[choice].tone }}>
            {CHOICE_META[choice].label}
          </span>
          <span className={styles.track}>
            <span
              className={styles.fill}
              style={{
                width: `${(tally[choice] / total) * 100}%`,
                background: CHOICE_META[choice].tone,
              }}
            />
          </span>
          <span className={styles.count}>{tally[choice]}</span>
        </div>
      ))}
    </div>
  );
}

function Countdown({ closesAt, openedAt }: { closesAt: number; openedAt: number }) {
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const handle = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(handle);
  }, []);

  const span = Math.max(1, closesAt - openedAt);
  const left = Math.max(0, closesAt - now);
  const fraction = Math.max(0, Math.min(1, left / span));

  return (
    <span className={styles.ring}>
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle
          className={styles.ringTrack}
          cx="17"
          cy="17"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
        />
        <circle
          className={styles.ringHand}
          cx="17"
          cy="17"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - fraction)}
        />
      </svg>
      <span className={styles.ringNum}>{Math.ceil(left / 1000)}</span>
    </span>
  );
}

export function HainaOverlay({
  poll,
  result,
  myChoice,
  onVote,
}: {
  poll: LivePoll | null;
  result: FrozenResult | null;
  myChoice: Choice | null;
  onVote: (choice: Choice) => void;
}) {
  if (poll) {
    const tally = tallyOf(poll);
    return (
      <div
        className={`pane pane-float ${styles.overlay}`}
        role="dialog"
        aria-label="Live room poll"
      >
        <div className={styles.head}>
          <span className={styles.asker}>
            <b>{poll.askedBy}</b> is asking the room
          </span>
          <Countdown closesAt={poll.closesAt} openedAt={poll.openedAt} />
        </div>

        <p className={styles.question}>{poll.question}</p>

        <div className={styles.choices}>
          {CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              className={styles.choice}
              data-mine={myChoice === choice}
              style={myChoice === choice ? { color: CHOICE_META[choice].tone } : undefined}
              onClick={() => onVote(choice)}
            >
              <span className={styles.choiceLabel}>{CHOICE_META[choice].label}</span>
              <span className={styles.choiceGloss}>{CHOICE_META[choice].gloss}</span>
            </button>
          ))}
        </div>

        <Bars tally={tally} dim={false} />
      </div>
    );
  }

  if (result) {
    return (
      <div
        className={`pane pane-float ${styles.overlay}`}
        data-verdict={result.verdict.kind}
        role="status"
      >
        <div className={styles.head}>
          <span className={styles.asker}>
            <b>{result.askedBy}</b> asked the room
          </span>
          <span className={styles.asker}>Closed</span>
        </div>

        <p className={styles.question}>{result.question}</p>
        <Bars tally={result.tally} dim={false} />

        <p className={styles.verdict} data-kind={result.verdict.kind}>
          {result.verdict.line}
        </p>
      </div>
    );
  }

  return null;
}
