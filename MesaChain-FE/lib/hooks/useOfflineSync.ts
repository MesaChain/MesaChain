import { useState, useEffect } from 'react';
import { SyncStatus, syncManager } from '../Sync';

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.getStatus());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe(setStatus);
    return unsubscribe;
  }, []);

  const manualSync = async () => {
    return await syncManager.manualSync();
  };

  return {
    ...status,
    manualSync,
  };
}