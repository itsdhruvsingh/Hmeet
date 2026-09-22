'use client';

import * as React from 'react';
import Link from 'next/link';
import styles from '@/styles/leave.module.css';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/Wordmark';
import { useCopy } from '@/hooks/useCopy';
import { clock } from '@/lib/client-utils';
import { receiptsAsText, type Receipt } from '@/lib/haina';

export function LeaveScreen({
  roomName,
  receipts,
  onRejoin,
}: {
  roomName: string;
  receipts: Receipt[];
  onRejoin: () => void;
}) {
  const { copied, copy } = useCopy();

  return (
    <div className={styles.page}>
      <div className={`pane ${styles.card}`}>
        <Wordmark size={19} tone="quiet" />
        <h1 className={styles.title}>You have left the room.</h1>
        <p className={styles.sub}>
          {receipts.length > 0
            ? 'Here is what the room actually decided while you were in there.'
            : 'Nothing was put to the room, so nothing was decided. Just a calendar hole and some vibes.'}
        </p>

        {receipts.length > 0 ? (
          <div className={styles.summary}>
            <div className={styles.summaryHead}>
              <span className={styles.summaryTitle}>Receipts · {receipts.length}</span>
              <button
                type="button"
                className={`btn btn-quiet ${styles.copyBtn}`}
                onClick={() => copy(receiptsAsText(receipts, roomName), 'receipts')}
              >
                <Icon name={copied ? 'check' : 'copy'} size={13} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {receipts
              .slice()
              .reverse()
              .map((receipt) => (
                <div key={receipt.id} className={styles.line}>
                  <span className={styles.lineTime} suppressHydrationWarning>
                    {clock(new Date(receipt.at))}
                  </span>
                  <span>
                    <span className={styles.lineQuestion}>{receipt.question}</span>
                    <span className={styles.lineVerdict}>
                      Haina {receipt.tally.haina} · Na {receipt.tally.na} · Pata nahi{' '}
                      {receipt.tally.pata} · <b>{receipt.verdict.line}</b>
                    </span>
                  </span>
                </div>
              ))}
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className="btn btn-gold" onClick={onRejoin}>
            Walk back in
          </button>
          <Link href="/" className="btn btn-quiet">
            Back to the start
          </Link>
        </div>
      </div>
    </div>
  );
}
