import { useEffect, useState } from 'react';
import { db, SESSIONS_CHANGE_EVENT } from './db';
import { useUser } from './useUser';
import type { QuizSession } from '../types';

export function useSessions(): { sessions: QuizSession[]; loading: boolean } {
  const { user, loading: userLoading } = useUser();
  const [sessions, setSessions] = useState<QuizSession[]>([]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      return;
    }
    function refresh() {
      if (user) setSessions(db.sessions.list(user.uid));
    }
    refresh();
    window.addEventListener(SESSIONS_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(SESSIONS_CHANGE_EVENT, refresh);
  }, [user]);

  return { sessions, loading: userLoading };
}
