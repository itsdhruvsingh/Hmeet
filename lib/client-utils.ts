export const ROOM_SLUG_PATTERN = /^[a-z0-9]{1,24}(?:-[a-z0-9]{1,24}){0,5}$/;

export function decodePassphrase(encoded: string) {
  return decodeURIComponent(encoded);
}

export function randomString(length: number): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function normalizeRoomInput(raw: string): string | null {
  let value = raw.trim();
  if (!value) return null;

  if (value.includes('/')) {
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const segments = new URL(withProtocol).pathname.split('/').filter(Boolean);
      value = segments[segments.length - 1] ?? '';
    } catch {
      value = value.split('/').filter(Boolean).pop() ?? '';
    }
  }

  value = value
    .split('?')[0]
    .split('#')[0]
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');

  return ROOM_SLUG_PATTERN.test(value) ? value : null;
}

export function isLowPowerDevice() {
  return typeof navigator !== 'undefined' && navigator.hardwareConcurrency < 6;
}

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function stringSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function clock(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
