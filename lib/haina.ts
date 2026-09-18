import { clock, stringSeed } from './client-utils';

export const HAINA_TOPIC = 'haina';

export const CHOICES = ['haina', 'na', 'pata'] as const;
export type Choice = (typeof CHOICES)[number];

export const CHOICE_META: Record<Choice, { label: string; gloss: string; tone: string }> = {
  haina: { label: 'Haina', gloss: 'Yes, agreed', tone: 'var(--gold)' },
  na: { label: 'Na', gloss: 'No, I disagree', tone: 'var(--rose)' },
  pata: { label: 'Pata nahi', gloss: 'No opinion', tone: 'var(--jade)' },
};

export const STAMPS = ['🔥', '💀', '👀', '🫠', '🧢', '🤝'] as const;
export type Stamp = (typeof STAMPS)[number];

export const ASK_DURATIONS = [10000, 20000, 45000] as const;
export const VOTE_GRACE_MS = 1500;

export type Signal =
  | { k: 'ask'; id: string; by: string; q: string; ms: number }
  | { k: 'vote'; id: string; c: Choice }
  | { k: 'stamp'; s: string };

export type LivePoll = {
  id: string;
  askedBy: string;
  question: string;
  openedAt: number;
  closesAt: number;
  votes: Record<string, Choice>;
};

export type Tally = Record<Choice, number>;

export type Receipt = {
  id: string;
  askedBy: string;
  question: string;
  at: number;
  tally: Tally;
  verdict: Verdict;
};

export type VerdictKind = 'yes' | 'no' | 'split' | 'silence';

export type Verdict = {
  kind: VerdictKind;
  line: string;
};

const VERDICT_LINES: Record<VerdictKind, string[]> = {
  yes: [
    'Haina. The room agrees.',
    'Carried. Nobody objected hard enough.',
    'That is a yes with extra steps.',
    'Settled. Write it down.',
  ],
  no: [
    'Na. Shot down in public.',
    'The room said no, and it said it loudly.',
    'A collective hard pass.',
    'That idea did not survive contact.',
  ],
  split: [
    'Split. Nobody is budging.',
    'Deadlock. Shocking. Truly.',
    'Half yes, half no, zero progress.',
    'The room has become a debate club.',
  ],
  silence: [
    'Nobody voted. Brutal.',
    'Zero responses. Read the room.',
    'Silence is also an answer.',
    'The void has spoken.',
  ],
};

export function emptyTally(): Tally {
  return { haina: 0, na: 0, pata: 0 };
}

export function tallyOf(poll: LivePoll): Tally {
  const tally = emptyTally();
  for (const choice of Object.values(poll.votes)) {
    tally[choice] += 1;
  }
  return tally;
}

export function totalVotes(tally: Tally): number {
  return tally.haina + tally.na + tally.pata;
}

export function verdictOf(tally: Tally, seedSource: string): Verdict {
  const total = totalVotes(tally);
  const kind: VerdictKind =
    total === 0
      ? 'silence'
      : tally.haina > tally.na
        ? 'yes'
        : tally.na > tally.haina
          ? 'no'
          : 'split';
  const lines = VERDICT_LINES[kind];
  return { kind, line: lines[stringSeed(seedSource) % lines.length] };
}

export function newPollId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeSignal(signal: Signal): Uint8Array {
  return encoder.encode(JSON.stringify(signal));
}

export function decodeSignal(payload: Uint8Array): Signal | null {
  try {
    const parsed = JSON.parse(decoder.decode(payload));
    if (!parsed || typeof parsed.k !== 'string') return null;
    if (parsed.k === 'ask') {
      if (typeof parsed.id !== 'string' || typeof parsed.ms !== 'number') return null;
      return {
        k: 'ask',
        id: parsed.id,
        by: String(parsed.by ?? 'someone'),
        q: String(parsed.q ?? '').slice(0, 140),
        ms: Math.min(Math.max(parsed.ms, 5000), 120000),
      };
    }
    if (parsed.k === 'vote') {
      if (typeof parsed.id !== 'string' || !CHOICES.includes(parsed.c)) return null;
      return { k: 'vote', id: parsed.id, c: parsed.c };
    }
    if (parsed.k === 'stamp') {
      if (typeof parsed.s !== 'string') return null;
      return { k: 'stamp', s: parsed.s.slice(0, 8) };
    }
    return null;
  } catch {
    return null;
  }
}

export function receiptsAsText(receipts: Receipt[], roomName: string): string {
  if (receipts.length === 0) return `No receipts from ${roomName}. Nothing was decided.`;
  const lines = receipts.map((receipt) => {
    const time = clock(new Date(receipt.at));
    const counts = `Haina ${receipt.tally.haina}  Na ${receipt.tally.na}  Pata nahi ${receipt.tally.pata}`;
    return `${time}  ${receipt.question}\n         ${counts}\n         ${receipt.verdict.line} (asked by ${receipt.askedBy})`;
  });
  return [`Receipts from ${roomName}`, '', ...lines].join('\n');
}
