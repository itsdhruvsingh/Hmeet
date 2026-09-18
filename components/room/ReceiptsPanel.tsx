'use client';

import * as React from 'react';
import panels from '@/styles/panels.module.css';
import roomStyles from '@/styles/room.module.css';
import { Panel } from '@/components/room/Panel';
import { Icon } from '@/components/ui/Icon';
import { clock } from '@/lib/client-utils';
import { CHOICE_META, receiptsAsText, type Receipt } from '@/lib/haina';

export function ReceiptsPanel({
  receipts,
  roomName,
  onClear,
  onClose,
}: {
  receipts: Receipt[];
  roomName: string;
  onClear: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(receiptsAsText(receipts, roomName));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel
      title="Receipts"
      onClose={onClose}
      footer={
        <div className={panels.footRow}>
          <button type="button" className="btn" onClick={copyAll} disabled={receipts.length === 0}>
            <Icon name={copied ? 'check' : 'copy'} size={15} />
            {copied ? 'Copied' : 'Copy all'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClear}
            disabled={receipts.length === 0}
          >
            Clear
          </button>
        </div>
      }
    >
      {receipts.length === 0 ? (
        <p className={roomStyles.empty}>
          Every question you ask lands here with its tally and timestamp. Decisions with a paper
          trail. Terrifying, honestly.
        </p>
      ) : (
        receipts.map((receipt) => (
          <div key={receipt.id} className={panels.receipt} data-kind={receipt.verdict.kind}>
            <div className={panels.receiptTop}>
              <span className={panels.receiptWhen} suppressHydrationWarning>
                {clock(new Date(receipt.at))}
              </span>
              <span className={panels.receiptWho}>Asked by {receipt.askedBy}</span>
            </div>
            <p className={panels.receiptQuestion}>{receipt.question}</p>
            <div className={panels.chips}>
              {(Object.keys(CHOICE_META) as Array<keyof typeof CHOICE_META>).map((choice) => (
                <span
                  key={choice}
                  className={panels.chip}
                  style={{ color: CHOICE_META[choice].tone }}
                >
                  {CHOICE_META[choice].label} {receipt.tally[choice]}
                </span>
              ))}
            </div>
            <p className={panels.receiptLine}>{receipt.verdict.line}</p>
          </div>
        ))
      )}
    </Panel>
  );
}
