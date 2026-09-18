'use client';

import * as React from 'react';
import { useLocalParticipant } from '@livekit/components-react';

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

export function Shortcuts({ onAsk }: { onAsk: () => void }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } = useLocalParticipant();

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!event.shiftKey || !(event.ctrlKey || event.metaKey)) return;
      if (isTyping(event.target)) return;
      const key = event.key.toLowerCase();

      if (key === 'a') {
        event.preventDefault();
        localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      } else if (key === 'v') {
        event.preventDefault();
        localParticipant.setCameraEnabled(!isCameraEnabled);
      } else if (key === 'h') {
        event.preventDefault();
        onAsk();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [localParticipant, isCameraEnabled, isMicrophoneEnabled, onAsk]);

  return null;
}
