'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/landing.module.css';
import { Icon } from '@/components/ui/Icon';
import { useStoredIdentity } from '@/hooks/useStoredIdentity';
import { normalizeRoomInput } from '@/lib/client-utils';
import { generateRoomSlug } from '@/lib/room-names';

export function JoinCard() {
  const router = useRouter();
  const { name, setName, remember, hydrated } = useStoredIdentity();
  const [room, setRoom] = React.useState('');
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setRoom((current) => current || generateRoomSlug());
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const typed = room.trim();
    const slug = typed ? normalizeRoomInput(typed) : generateRoomSlug();

    if (!slug) {
      setError('That room name will not work. Use letters, numbers and dashes.');
      return;
    }

    setError('');
    setBusy(true);
    remember(name.trim());
    router.push(`/rooms/${slug}`);
  };

  return (
    <form className={`pane ${styles.card}`} onSubmit={submit}>
      <h1 className={styles.title}>Open a room</h1>

      <div className={styles.field}>
        <label className="label" htmlFor="display-name">
          Your name
        </label>
        <input
          id="display-name"
          className="field"
          value={name}
          maxLength={32}
          autoComplete="nickname"
          placeholder={hydrated ? 'Guest' : ''}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className="label" htmlFor="room-name">
          Room name
        </label>
        <input
          id="room-name"
          className={`field ${styles.roomInput}`}
          value={room}
          maxLength={80}
          spellCheck={false}
          autoCapitalize="off"
          placeholder="gilded-heron-4k2p"
          onChange={(event) => setRoom(event.target.value)}
        />
      </div>

      <button type="submit" className={`btn btn-gold ${styles.action}`} disabled={busy}>
        Enter room
        <Icon name="arrow" size={17} />
      </button>

      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
