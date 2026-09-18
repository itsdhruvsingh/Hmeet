import * as React from 'react';

const PATHS = {
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3',
  micOff:
    'M15 6a3 3 0 0 0-6-.5M9 9.5V12a3 3 0 0 0 4.6 2.5M19 11a7 7 0 0 1-1.2 3.9M5 11a7 7 0 0 0 10.3 6.2M12 18v3M3 3l18 18',
  cam: 'M3 8.5A2.5 2.5 0 0 1 5.5 6h7A2.5 2.5 0 0 1 15 8.5v7A2.5 2.5 0 0 1 12.5 18h-7A2.5 2.5 0 0 1 3 15.5v-7ZM15 10.5 21 7v10l-6-3.5',
  camOff:
    'M3 3l18 18M10.5 6h2A2.5 2.5 0 0 1 15 8.5v2M15 13.6 21 17V7l-3.2 1.9M3 8.8v6.7A2.5 2.5 0 0 0 5.5 18h7c.5 0 1-.15 1.4-.4',
  screen: 'M3 5.5h18v11H3zM8.5 20.5h7M12 16.5v4M9.5 11.5 12 9l2.5 2.5',
  chat: 'M4 5.5h16v10H9l-5 4v-14Z',
  receipt: 'M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4v-17ZM9.5 8h5M9.5 12h5',
  spark: 'M12 3.5 13.6 9l5.4 1.6-5.4 1.7L12 20.5l-1.6-8.2L5 10.6 10.4 9 12 3.5Z',
  gear: 'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z M19.4 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1v.3a1.8 1.8 0 1 1-3.6 0v-.2a1.5 1.5 0 0 0-2.6-1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1-2.6h-.3a1.8 1.8 0 1 1 0-3.6h.2a1.5 1.5 0 0 0 1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 2.6-1v-.3a1.8 1.8 0 1 1 3.6 0v.2a1.5 1.5 0 0 0 2.6 1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1 2.6h.3a1.8 1.8 0 1 1 0 3.6h-.2a1.5 1.5 0 0 0-1.4.9Z',
  leave: 'M15.5 8.5 20 12l-4.5 3.5M20 12H9M13 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H13',
  copy: 'M9 9.5A2.5 2.5 0 0 1 11.5 7h6A2.5 2.5 0 0 1 20 9.5v6a2.5 2.5 0 0 1-2.5 2.5h-6A2.5 2.5 0 0 1 9 15.5v-6ZM15 7V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H7',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  close: 'M6 6l12 12M18 6 6 18',
  send: 'M4 12 20 4l-6 16-2.5-6.5L4 12Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  link: 'M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 1 0-5-5l-1.2 1.2M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 1 0 5 5l1.2-1.2',
  users:
    'M8.5 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM2.5 19.5c0-3 2.7-5 6-5s6 2 6 5M16 5.2a3.25 3.25 0 0 1 0 6.3M17.5 14.9c2.2.6 4 2.3 4 4.6',
  lock: 'M6.5 10.5h11v9h-11zM9 10.5V7.5a3 3 0 0 1 6 0v3',
  shield: 'M12 3.5 19 6v5.5c0 4-3 7.4-7 9-4-1.6-7-5-7-9V6l7-2.5Z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
