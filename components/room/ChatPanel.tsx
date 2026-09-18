'use client';

import * as React from 'react';
import type { ReceivedChatMessage } from '@livekit/components-react';
import panels from '@/styles/panels.module.css';
import roomStyles from '@/styles/room.module.css';
import { Panel } from '@/components/room/Panel';
import { Icon } from '@/components/ui/Icon';
import { linkify } from '@/lib/linkify';
import { clock } from '@/lib/client-utils';

export function ChatPanel({
  messages,
  localIdentity,
  sending,
  onSend,
  onClose,
}: {
  messages: ReceivedChatMessage[];
  localIdentity: string;
  sending: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = React.useState('');
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <Panel
      title="Chat"
      onClose={onClose}
      footer={
        <form className={panels.composer} onSubmit={submit}>
          <input
            className="field"
            value={draft}
            maxLength={800}
            placeholder="Say something"
            onChange={(event) => setDraft(event.target.value)}
          />
          <button
            type="submit"
            className={`btn btn-gold ${panels.sendBtn}`}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
          >
            <Icon name="send" size={17} />
          </button>
        </form>
      }
    >
      {messages.length === 0 ? (
        <p className={roomStyles.empty}>
          Nothing here yet. Drop a link, a take, or the notes nobody is going to read.
        </p>
      ) : (
        <div className={panels.messages}>
          {messages.map((message) => (
            <div
              key={message.id ?? `${message.timestamp}-${message.from?.identity}`}
              className={panels.message}
              data-mine={message.from?.identity === localIdentity}
            >
              <div className={panels.messageHead}>
                <span className={panels.messageWho}>
                  {message.from?.identity === localIdentity ? 'You' : message.from?.name || 'Guest'}
                </span>
                <span className={panels.messageWhen} suppressHydrationWarning>
                  {clock(new Date(message.timestamp))}
                </span>
              </div>
              <div className={panels.messageBody}>{linkify(message.message)}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </Panel>
  );
}
