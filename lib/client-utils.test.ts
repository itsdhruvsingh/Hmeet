import { describe, expect, it } from 'vitest';
import { initialsOf, normalizeRoomInput, stringSeed } from './client-utils';
import { generateRoomSlug, prettifySlug } from './room-names';

describe('normalizeRoomInput', () => {
  it('accepts a bare slug', () => {
    expect(normalizeRoomInput('feral-pigeon-9k2x')).toBe('feral-pigeon-9k2x');
  });

  it('pulls the slug out of a full invite link', () => {
    expect(normalizeRoomInput('https://haina.app/rooms/feral-pigeon-9k2x')).toBe(
      'feral-pigeon-9k2x',
    );
  });

  it('ignores query strings and passphrase fragments', () => {
    expect(normalizeRoomInput('https://haina.app/rooms/feral-pigeon-9k2x?hq=true#secret')).toBe(
      'feral-pigeon-9k2x',
    );
  });

  it('handles a link pasted without a protocol', () => {
    expect(normalizeRoomInput('haina.app/rooms/damp-otter-77aa')).toBe('damp-otter-77aa');
  });

  it('normalises spaces, underscores and case', () => {
    expect(normalizeRoomInput('  Feral Pigeon_9K2X ')).toBe('feral-pigeon-9k2x');
  });

  it('strips characters that cannot be in a room name', () => {
    expect(normalizeRoomInput('feral/../pigeon')).toBe('pigeon');
    expect(normalizeRoomInput('<script>')).toBe('script');
  });

  it('rejects empty input', () => {
    expect(normalizeRoomInput('')).toBeNull();
    expect(normalizeRoomInput('   ')).toBeNull();
  });

  it('rejects a slug with too many segments', () => {
    expect(normalizeRoomInput('a-b-c-d-e-f-g-h')).toBeNull();
  });
});

describe('room slugs', () => {
  it('generates a three part lowercase slug', () => {
    const slug = generateRoomSlug();
    expect(slug).toMatch(/^[a-z]+-[a-z]+-[a-z0-9]{4}$/);
  });

  it('survives its own normaliser', () => {
    expect(normalizeRoomInput(generateRoomSlug())).not.toBeNull();
  });

  it('drops the random suffix when displaying a name', () => {
    expect(prettifySlug('feral-pigeon-9k2x')).toBe('feral pigeon');
  });

  it('leaves short custom names alone', () => {
    expect(prettifySlug('standup')).toBe('standup');
    expect(prettifySlug('daily-standup')).toBe('daily standup');
  });
});

describe('initialsOf', () => {
  it('uses the first two letters of a single name', () => {
    expect(initialsOf('dhruv')).toBe('DH');
  });

  it('uses first and last initials otherwise', () => {
    expect(initialsOf('dhruv kumar singh')).toBe('DS');
  });

  it('falls back when there is nothing to work with', () => {
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('stringSeed', () => {
  it('is stable for the same input', () => {
    expect(stringSeed('poll-1')).toBe(stringSeed('poll-1'));
  });

  it('differs across inputs', () => {
    expect(stringSeed('poll-1')).not.toBe(stringSeed('poll-2'));
  });
});
