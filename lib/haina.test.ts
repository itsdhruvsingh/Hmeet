import { describe, expect, it } from 'vitest';
import {
  decodeSignal,
  emptyTally,
  encodeSignal,
  receiptsAsText,
  tallyOf,
  totalVotes,
  verdictOf,
  type LivePoll,
  type Receipt,
} from './haina';

function poll(votes: LivePoll['votes']): LivePoll {
  return {
    id: 'p1',
    askedBy: 'dhruv',
    question: 'ship it?',
    openedAt: 1000,
    closesAt: 11000,
    votes,
  };
}

describe('tallyOf', () => {
  it('counts one vote per identity', () => {
    const tally = tallyOf(poll({ a: 'haina', b: 'haina', c: 'na' }));
    expect(tally).toEqual({ haina: 2, na: 1, pata: 0 });
    expect(totalVotes(tally)).toBe(3);
  });

  it('returns an empty tally when nobody answered', () => {
    expect(tallyOf(poll({}))).toEqual(emptyTally());
  });
});

describe('verdictOf', () => {
  it('calls it yes when haina leads', () => {
    expect(verdictOf({ haina: 3, na: 1, pata: 0 }, 'p1').kind).toBe('yes');
  });

  it('calls it no when na leads', () => {
    expect(verdictOf({ haina: 1, na: 4, pata: 0 }, 'p1').kind).toBe('no');
  });

  it('calls it split on a tie with votes cast', () => {
    expect(verdictOf({ haina: 2, na: 2, pata: 1 }, 'p1').kind).toBe('split');
  });

  it('calls it silence when nothing was cast', () => {
    expect(verdictOf(emptyTally(), 'p1').kind).toBe('silence');
  });

  it('picks the same line on every client for the same poll', () => {
    const tally = { haina: 3, na: 1, pata: 0 };
    expect(verdictOf(tally, 'poll-abc').line).toBe(verdictOf(tally, 'poll-abc').line);
  });

  it('does not always pick the same line across polls', () => {
    const tally = { haina: 3, na: 1, pata: 0 };
    const lines = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => verdictOf(tally, id).line);
    expect(new Set(lines).size).toBeGreaterThan(1);
  });
});

describe('signal codec', () => {
  it('round trips an ask', () => {
    const signal = { k: 'ask', id: 'x1', by: 'dhruv', q: 'ship it?', ms: 10000 } as const;
    expect(decodeSignal(encodeSignal(signal))).toEqual(signal);
  });

  it('round trips a vote', () => {
    const signal = { k: 'vote', id: 'x1', c: 'haina' } as const;
    expect(decodeSignal(encodeSignal(signal))).toEqual(signal);
  });

  it('rejects an unknown choice', () => {
    expect(decodeSignal(new TextEncoder().encode('{"k":"vote","id":"x1","c":"maybe"}'))).toBeNull();
  });

  it('rejects malformed payloads', () => {
    expect(decodeSignal(new TextEncoder().encode('not json'))).toBeNull();
    expect(decodeSignal(new TextEncoder().encode('{"k":"nope"}'))).toBeNull();
  });

  it('clamps an absurd poll window', () => {
    const wire = '{"k":"ask","id":"x1","by":"a","q":"q","ms":999999999}';
    const decoded = decodeSignal(new TextEncoder().encode(wire));
    expect(decoded).toMatchObject({ ms: 120000 });
  });

  it('truncates an oversized question', () => {
    const wire = JSON.stringify({ k: 'ask', id: 'x1', by: 'a', q: 'z'.repeat(400), ms: 10000 });
    const decoded = decodeSignal(new TextEncoder().encode(wire));
    expect(decoded && 'q' in decoded && decoded.q.length).toBe(140);
  });
});

describe('receiptsAsText', () => {
  const receipt: Receipt = {
    id: 'p1',
    askedBy: 'dhruv',
    question: 'ship it?',
    at: Date.UTC(2025, 0, 1, 9, 30),
    tally: { haina: 3, na: 1, pata: 0 },
    verdict: { kind: 'yes', line: 'haina. the room agrees.' },
  };

  it('says so when there is nothing to show', () => {
    expect(receiptsAsText([], 'feral-pigeon-9k2x')).toContain('Nothing was decided');
  });

  it('includes the question, the counts and the verdict', () => {
    const text = receiptsAsText([receipt], 'feral-pigeon-9k2x');
    expect(text).toContain('ship it?');
    expect(text).toContain('Haina 3');
    expect(text).toContain('haina. the room agrees.');
  });
});
