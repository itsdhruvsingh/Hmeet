'use client';

import * as React from 'react';

const NAME_KEY = 'haina.name';

function readStored(): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function useStoredIdentity() {
  const [name, setName] = React.useState('');
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setName(readStored());
    setHydrated(true);
  }, []);

  const remember = React.useCallback((value: string) => {
    setName(value);
    try {
      window.localStorage.setItem(NAME_KEY, value.trim());
    } catch {}
  }, []);

  return { name, setName, remember, hydrated };
}
