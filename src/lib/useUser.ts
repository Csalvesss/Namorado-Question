import { useEffect, useState, useCallback } from 'react';
import type { UserProfile } from '../types';
import { getCurrentUser, USER_CHANGE_EVENT, updateUser as updateUserStore } from './auth';

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());

  useEffect(() => {
    function handleChange() {
      setUser(getCurrentUser());
    }
    function handleStorage(e: StorageEvent) {
      if (e.key === 'guava.user') setUser(getCurrentUser());
    }
    window.addEventListener(USER_CHANGE_EVENT, handleChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(USER_CHANGE_EVENT, handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const refresh = useCallback(() => setUser(getCurrentUser()), []);

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) => {
      updateUserStore(patch);
    },
    [],
  );

  return { user, refresh, updateUser };
}
