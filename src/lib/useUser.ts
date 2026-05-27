import { useCallback, useEffect, useState } from 'react';
import type { UserProfile } from '../types';
import { onAuthChange, patchProfile } from './auth';

export interface UseUserState {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => void;
  updateUser: (patch: Partial<UserProfile>) => Promise<void>;
}

export function useUser(): UseUserState {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((profile) => {
      setUser(profile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const refresh = useCallback(() => {
    // onAuthStateChanged + custom event chain handle most cases.
    // Force-reload by toggling state is unnecessary; this is a no-op kept for API compat.
  }, []);

  const updateUser = useCallback(async (patch: Partial<UserProfile>) => {
    await patchProfile(patch);
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return { user, loading, refresh, updateUser };
}
