'use client';

import * as React from 'react';
import { ExternalE2EEKeyProvider } from 'livekit-client';
import { decodePassphrase } from '@/lib/client-utils';

export function useE2EE() {
  const [passphrase, setPassphrase] = React.useState<string | undefined>(undefined);
  const [worker, setWorker] = React.useState<Worker | undefined>(undefined);
  const keyProvider = React.useMemo(() => new ExternalE2EEKeyProvider(), []);

  React.useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    setPassphrase(decodePassphrase(hash));
    const instance = new Worker(new URL('livekit-client/e2ee-worker', import.meta.url));
    setWorker(instance);

    return () => {
      instance.terminate();
      setWorker(undefined);
    };
  }, []);

  return {
    passphrase,
    worker,
    keyProvider,
    enabled: Boolean(passphrase && worker),
  };
}
