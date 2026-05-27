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
    try {
      await patchProfile(patch);
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'code' in e
          ? `Firestore: ${(e as { code: string }).code}`
          : e instanceof Error
            ? e.message
            : 'Falha ao salvar no Firestore.';
      console.error('patchProfile falhou:', e);
      throw new Error(message);
    }
  }, []);

  return { user, loading, refresh, updateUser };
}
