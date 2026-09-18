'use client';

import * as React from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import styles from '@/styles/room.module.css';
import { Icon, type IconName } from '@/components/ui/Icon';
import { AskComposer } from '@/components/room/AskComposer';
import { STAMPS } from '@/lib/haina';
import type { PanelKey } from '@/components/room/panels';

function DockButton({
  icon,
  label,
  badge,
  on,
  active,
  tone,
  onClick,
}: {
  icon: IconName;
  label: string;
  badge?: number;
  on?: boolean;
  active?: boolean;
  tone?: 'danger';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.dockBtn}
      data-on={on === undefined ? undefined : String(on)}
      data-active={active ? 'true' : undefined}
      data-tone={tone}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active ?? on}
    >
      <Icon name={icon} size={20} />
      {badge ? <span className={styles.badge}>{badge > 99 ? '99' : badge}</span> : null}
    </button>
  );
}

export function ControlDock({
  panel,
  onPanel,
  onAsk,
  onStamp,
  askDisabled,
  unread,
  receiptCount,
  askOpen,
  setAskOpen,
}: {
  panel: PanelKey;
  onPanel: (next: PanelKey) => void;
  onAsk: (question: string, ms: number) => void;
  onStamp: (glyph: string) => void;
  askDisabled: boolean;
  unread: number;
  receiptCount: number;
  askOpen: boolean;
  setAskOpen: (open: boolean) => void;
}) {
  const room = useRoomContext();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled } =
    useLocalParticipant();
  const [trayOpen, setTrayOpen] = React.useState(false);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(
      typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getDisplayMedia),
    );
  }, []);

  const toggle = (panelKey: PanelKey) => onPanel(panel === panelKey ? null : panelKey);

  return (
    <div className={styles.dockRow}>
      <div className={styles.dockShell}>
        {askOpen ? <AskComposer onAsk={onAsk} onDismiss={() => setAskOpen(false)} /> : null}

        {trayOpen ? (
          <div className={`pane pane-float ${styles.stampTray}`}>
            {STAMPS.map((glyph) => (
              <button
                key={glyph}
                type="button"
                className={styles.stampKey}
                onClick={() => {
                  onStamp(glyph);
                  setTrayOpen(false);
                }}
                aria-label={`Send ${glyph}`}
              >
                {glyph}
              </button>
            ))}
          </div>
        ) : null}

        <div className={styles.dock}>
          <DockButton
            icon={isMicrophoneEnabled ? 'mic' : 'micOff'}
            label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
            on={isMicrophoneEnabled}
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
          />
          <DockButton
            icon={isCameraEnabled ? 'cam' : 'camOff'}
            label={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
            on={isCameraEnabled}
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
          />
          {canShare ? (
            <DockButton
              icon="screen"
              label={isScreenShareEnabled ? 'Stop sharing' : 'Share screen'}
              active={isScreenShareEnabled}
              onClick={() =>
                localParticipant
                  .setScreenShareEnabled(!isScreenShareEnabled, { audio: true })
                  .catch(() => undefined)
              }
            />
          ) : null}

          <span className={styles.divider} />

          <button
            type="button"
            className={styles.askBtn}
            disabled={askDisabled}
            onClick={() => {
              setTrayOpen(false);
              setAskOpen(!askOpen);
            }}
            title="Ask the room (Ctrl+Shift+H)"
          >
            haina?
          </button>

          <DockButton
            icon="spark"
            label="Reactions"
            active={trayOpen}
            onClick={() => {
              setAskOpen(false);
              setTrayOpen((open) => !open);
            }}
          />

          <span className={styles.divider} />

          <DockButton
            icon="chat"
            label="Chat"
            active={panel === 'chat'}
            badge={panel === 'chat' ? 0 : unread}
            onClick={() => toggle('chat')}
          />
          <DockButton
            icon="receipt"
            label="Receipts"
            active={panel === 'receipts'}
            badge={panel === 'receipts' ? 0 : receiptCount}
            onClick={() => toggle('receipts')}
          />
          <DockButton
            icon="gear"
            label="Settings"
            active={panel === 'settings'}
            onClick={() => toggle('settings')}
          />

          <span className={styles.divider} />

          <DockButton icon="leave" label="Leave" tone="danger" onClick={() => room.disconnect()} />
        </div>
      </div>
    </div>
  );
}
