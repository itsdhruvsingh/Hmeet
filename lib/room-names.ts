const ADJECTIVES = [
  'feral',
  'crispy',
  'unhinged',
  'nocturnal',
  'static',
  'molten',
  'turbo',
  'rogue',
  'cursed',
  'gilded',
  'radioactive',
  'sleepless',
  'lopsided',
  'caffeinated',
  'immortal',
  'suspicious',
  'midnight',
  'reckless',
  'wobbly',
  'haunted',
  'gleaming',
  'glossy',
  'gremlin',
  'opulent',
  'overqualified',
  'clandestine',
  'amber',
  'vengeful',
  'polite',
  'nuclear',
  'squeaky',
  'ancient',
  'lacquered',
  'marbled',
  'sentient',
  'brazen',
  'furious',
  'lukewarm',
  'invisible',
  'antique',
];

const CREATURES = [
  'pigeon',
  'raccoon',
  'axolotl',
  'walrus',
  'ferret',
  'opossum',
  'seagull',
  'crab',
  'otter',
  'badger',
  'heron',
  'newt',
  'yak',
  'lemur',
  'magpie',
  'moth',
  'gecko',
  'hamster',
  'puffin',
  'mongoose',
  'narwhal',
  'wombat',
  'stoat',
  'capybara',
  'toucan',
  'iguana',
  'marmot',
  'tapir',
  'kestrel',
  'lobster',
  'meerkat',
  'chinchilla',
  'pelican',
  'okapi',
  'sardine',
  'vulture',
  'donkey',
  'quokka',
  'bison',
  'eel',
];

const SUFFIX_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomSuffix(length = 4): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join('');
}

export function generateRoomSlug(): string {
  return `${pick(ADJECTIVES)}-${pick(CREATURES)}-${randomSuffix()}`;
}

export function prettifySlug(slug: string): string {
  const parts = slug.split('-').filter(Boolean);
  const last = parts[parts.length - 1] ?? '';
  const trimmed = parts.length > 2 && last.length <= 5 ? parts.slice(0, -1) : parts;
  return trimmed.join(' ') || slug;
}
