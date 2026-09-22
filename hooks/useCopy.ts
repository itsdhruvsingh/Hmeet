'use client';

import * as React from 'react';

export function useCopy(resetAfter = 1800) {
  const [copied, setCopied] = React.useState('');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const copy = React.useCallback(
    async (text: string, key = 'it') => {
      clearTimeout(timer.current);
      try {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        timer.current = setTimeout(() => setCopied(''), resetAfter);
      } catch {
        setCopied('');
      }
    },
    [resetAfter],
  );

  return { copied, copy };
}
