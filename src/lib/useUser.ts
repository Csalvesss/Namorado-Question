import { useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '../types';
import { getCurrentUser, updateUser as updateUserStore } from './auth';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'guava.user') setUser(getCurrentUser());
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refresh = useCallback(() => setUser(getCurrentUser()), []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      updateUserStore(patch);
      refresh();
    },
    [refresh],
  );

  return { user, refresh, updateUser };
}
