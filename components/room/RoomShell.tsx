'use client';

import * as React from 'react';
import { ConnectionQuality, ConnectionState } from 'livekit-client';
import {
  RoomAudioRenderer,
  useChat,
  useConnectionState,
  useIsRecording,
  useParticipants,
  useRoomContext,
} from '@livekit/components-react';
import styles from '@/styles/room.module.css';
import { Icon } from '@/components/ui/Icon';
import { ChatPanel } from '@/components/room/ChatPanel';
import { ControlDock } from '@/components/room/ControlDock';
import { Diagnostics } from '@/components/room/Diagnostics';
import { HainaOverlay } from '@/components/room/HainaOverlay';
import { PeoplePanel } from '@/components/room/PeoplePanel';
import { ReceiptsPanel } from '@/components/room/ReceiptsPanel';
import { SettingsPanel } from '@/components/room/SettingsPanel';
import { Shortcuts } from '@/components/room/Shortcuts';
import { Stage } from '@/components/room/Stage';
import { Wordmark } from '@/components/ui/Wordmark';
import { StampLayer } from '@/components/room/StampLayer';
import type { PanelKey } from '@/components/room/panels';
import { useHaina } from '@/hooks/useHaina';
import { useLinkQuality } from '@/hooks/useLinkQuality';
import { useCopy } from '@/hooks/useCopy';
import type { Receipt } from '@/lib/haina';

const STATE_LABEL: Record<string, string> = {
  connected: 'Live',
  weak: 'Weak network',
  connecting: 'Connecting',
  reconnecting: 'Reconnecting',
  disconnected: 'Dropped',
};

function stateKey(state: ConnectionState, quality: ConnectionQuality): string {
  if (state === ConnectionState.Connected) {
    return quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost
      ? 'weak'
      : 'connected';
  }
  if (state === ConnectionState.Reconnecting) return 'reconnecting';
  if (state === ConnectionState.Connecting) return 'connecting';
  return 'disconnected';
}

export function RoomShell({
  roomName,
  onReceipts,
}: {
  roomName: string;
  onReceipts?: (receipts: Receipt[]) => void;
}) {
  const room = useRoomContext();
  const connection = useConnectionState();
  const participants = useParticipants();
  const recording = useIsRecording();
  const chat = useChat();
  const haina = useHaina();
  const quality = useLinkQuality();

  const [panel, setPanel] = React.useState<PanelKey>(null);
  const [askOpen, setAskOpen] = React.useState(false);
  const [seen, setSeen] = React.useState(0);
  const { copied, copy } = useCopy();

  React.useEffect(() => {
    if (panel === 'chat') setSeen(chat.chatMessages.length);
  }, [panel, chat.chatMessages.length]);

  React.useEffect(() => {
    if (haina.poll) setAskOpen(false);
  }, [haina.poll]);

  React.useEffect(() => {
    onReceipts?.(haina.receipts);
  }, [haina.receipts, onReceipts]);

  const key = stateKey(connection, quality);

  return (
    <div className={styles.room}>
      <Shortcuts onAsk={() => setAskOpen((open) => !open)} />
      <RoomAudioRenderer />

      <header className={styles.top}>
        <div className={styles.topLeft}>
          <Wordmark size={17} />
        </div>

        <div className={styles.topRight}>
          <button
            type="button"
            className={styles.chip}
            onClick={() => copy(window.location.href, 'invite')}
            title="Copy invite link"
          >
            <Icon name={copied ? 'check' : 'link'} size={13} />
            <span className={styles.chipLabel}>{copied ? 'Invite copied' : 'Copy invite'}</span>
          </button>
          {recording ? (
            <span className={`pill ${styles.status}`} data-state="disconnected">
              <span className={styles.dot} />
              <span className={styles.statusLabel}>Recording</span>
            </span>
          ) : null}
          {room.isE2EEEnabled ? (
            <span className="pill">
              <Icon name="lock" size={12} /> Encrypted
            </span>
          ) : null}
          <button
            type="button"
            className={styles.chip}
            onClick={() => setPanel(panel === 'people' ? null : 'people')}
          >
            <Icon name="users" size={13} />
            {participants.length}
          </button>
          <span className={`pill ${styles.status}`} data-state={key}>
            <span className={styles.dot} />
            <span className={styles.statusLabel}>{STATE_LABEL[key]}</span>
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.stageWrap}>
          <Stage />
          <Diagnostics />
          <StampLayer stamps={haina.stamps} />
          <HainaOverlay
            poll={haina.poll}
            result={haina.result}
            myChoice={haina.myChoice}
            onVote={haina.vote}
          />
        </div>

        {panel === 'chat' ? (
          <ChatPanel
            messages={chat.chatMessages}
            localIdentity={room.localParticipant.identity}
            sending={chat.isSending}
            onSend={(text) => chat.send(text)}
            onClose={() => setPanel(null)}
          />
        ) : null}

        {panel === 'receipts' ? (
          <ReceiptsPanel
            receipts={haina.receipts}
            roomName={roomName}
            onClear={haina.clearReceipts}
            onClose={() => setPanel(null)}
          />
        ) : null}

        {panel === 'people' ? <PeoplePanel onClose={() => setPanel(null)} /> : null}
        {panel === 'settings' ? <SettingsPanel onClose={() => setPanel(null)} /> : null}
      </div>

      <ControlDock
        panel={panel}
        onPanel={setPanel}
        onAsk={haina.ask}
        onStamp={haina.stamp}
        askDisabled={Boolean(haina.poll)}
        unread={Math.max(0, chat.chatMessages.length - seen)}
        receiptCount={haina.receipts.length}
        askOpen={askOpen}
        setAskOpen={setAskOpen}
      />
    </div>
  );
}
