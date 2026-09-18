'use client';

import * as React from 'react';
import { RoomEvent, type Participant } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';
import {
  HAINA_TOPIC,
  VOTE_GRACE_MS,
  decodeSignal,
  encodeSignal,
  newPollId,
  tallyOf,
  verdictOf,
  type Choice,
  type LivePoll,
  type Receipt,
  type Signal,
  type Tally,
  type Verdict,
} from '@/lib/haina';

export type FlyingStamp = {
  key: number;
  glyph: string;
  from: string;
  lane: number;
  drift: number;
  spin: number;
  scale: number;
};

export type FrozenResult = {
  id: string;
  question: string;
  askedBy: string;
  tally: Tally;
  verdict: Verdict;
};

const RESULT_HOLD_MS = 5200;
const STAMP_LIFE_MS = 2800;

export function useHaina() {
  const room = useRoomContext();
  const [poll, setPoll] = React.useState<LivePoll | null>(null);
  const [result, setResult] = React.useState<FrozenResult | null>(null);
  const [receipts, setReceipts] = React.useState<Receipt[]>([]);
  const [stamps, setStamps] = React.useState<FlyingStamp[]>([]);
  const [myChoice, setMyChoice] = React.useState<Choice | null>(null);

  const pollRef = React.useRef<LivePoll | null>(null);
  const stampCounter = React.useRef(0);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.length = 0;
    };
  }, []);

  const schedule = React.useCallback((fn: () => void, delay: number) => {
    const handle = setTimeout(() => {
      timers.current = timers.current.filter((t) => t !== handle);
      fn();
    }, delay);
    timers.current.push(handle);
    return handle;
  }, []);

  const spawnStamp = React.useCallback(
    (glyph: string, from: string) => {
      const key = ++stampCounter.current;
      const stamp: FlyingStamp = {
        key,
        glyph,
        from,
        lane: 6 + Math.random() * 84,
        drift: Math.random() * 90 - 45,
        spin: Math.random() * 44 - 22,
        scale: 0.85 + Math.random() * 0.5,
      };
      setStamps((current) => [...current.slice(-24), stamp]);
      schedule(() => setStamps((current) => current.filter((s) => s.key !== key)), STAMP_LIFE_MS);
    },
    [schedule],
  );

  const openPoll = React.useCallback((signal: Extract<Signal, { k: 'ask' }>) => {
    const now = Date.now();
    setResult(null);
    setMyChoice(null);
    setPoll({
      id: signal.id,
      askedBy: signal.by,
      question: signal.q || 'haina?',
      openedAt: now,
      closesAt: now + signal.ms,
      votes: {},
    });
  }, []);

  const registerVote = React.useCallback((pollId: string, identity: string, choice: Choice) => {
    setPoll((current) => {
      if (!current || current.id !== pollId) return current;
      if (Date.now() > current.closesAt + VOTE_GRACE_MS) return current;
      if (current.votes[identity] === choice) return current;
      return { ...current, votes: { ...current.votes, [identity]: choice } };
    });
  }, []);

  React.useEffect(() => {
    const onData = (
      payload: Uint8Array,
      participant?: Participant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== HAINA_TOPIC) return;
      const signal = decodeSignal(payload);
      if (!signal) return;
      const identity = participant?.identity ?? 'unknown';

      if (signal.k === 'ask') {
        openPoll(signal);
      } else if (signal.k === 'vote') {
        registerVote(signal.id, identity, signal.c);
      } else if (signal.k === 'stamp') {
        spawnStamp(signal.s, participant?.name || identity);
      }
    };

    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, openPoll, registerVote, spawnStamp]);

  const pollId = poll?.id;
  const closesAt = poll?.closesAt;

  React.useEffect(() => {
    if (!pollId || !closesAt) return;
    const delay = Math.max(0, closesAt + VOTE_GRACE_MS - Date.now());
    const handle = setTimeout(() => {
      const closing = pollRef.current;
      if (!closing || closing.id !== pollId) return;
      const tally = tallyOf(closing);
      const verdict = verdictOf(tally, closing.id);
      const receipt: Receipt = {
        id: closing.id,
        askedBy: closing.askedBy,
        question: closing.question,
        at: closing.openedAt,
        tally,
        verdict,
      };
      setReceipts((current) => [receipt, ...current].slice(0, 60));
      setResult({
        id: closing.id,
        question: closing.question,
        askedBy: closing.askedBy,
        tally,
        verdict,
      });
      setPoll(null);
      schedule(
        () => setResult((current) => (current?.id === pollId ? null : current)),
        RESULT_HOLD_MS,
      );
    }, delay);
    return () => clearTimeout(handle);
  }, [pollId, closesAt, schedule]);

  const broadcast = React.useCallback(
    (signal: Signal) => {
      try {
        room.localParticipant
          .publishData(encodeSignal(signal), { reliable: true, topic: HAINA_TOPIC })
          .catch(() => undefined);
      } catch {}
    },
    [room],
  );

  const ask = React.useCallback(
    (question: string, ms: number) => {
      const signal: Signal = {
        k: 'ask',
        id: newPollId(),
        by: room.localParticipant.name || room.localParticipant.identity || 'someone',
        q: question.trim().slice(0, 140),
        ms,
      };
      broadcast(signal);
      openPoll(signal);
    },
    [broadcast, openPoll, room],
  );

  const vote = React.useCallback(
    (choice: Choice) => {
      const current = pollRef.current;
      if (!current) return;
      setMyChoice(choice);
      broadcast({ k: 'vote', id: current.id, c: choice });
      registerVote(current.id, room.localParticipant.identity, choice);
    },
    [broadcast, registerVote, room],
  );

  const stamp = React.useCallback(
    (glyph: string) => {
      broadcast({ k: 'stamp', s: glyph });
      spawnStamp(glyph, 'you');
    },
    [broadcast, spawnStamp],
  );

  const clearReceipts = React.useCallback(() => setReceipts([]), []);

  return { poll, result, receipts, stamps, myChoice, ask, vote, stamp, clearReceipts };
}
