import { cloudSessions } from './cloud-db';
import type { Course, Question, QuizSession } from '../types';

const PREFIX = 'guava.';

function normalizeQuestion(q: Question & { type?: string }): Question {
  if (q.type === 'ecg') return q as Question;
  if (q.type === 'case') return q as Question;
  if (q.type === 'flashcard') return q as Question;
  if (q.type === 'match') return q as Question;
  return { ...q, type: 'mc' } as Question;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

const sessionsKey = (uid: string) => `sessions.${uid}`;

export const SESSIONS_CHANGE_EVENT = 'guava:sessions-change';

function emitSessionsChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSIONS_CHANGE_EVENT));
  }
}

export function hydrateSessionsFromCloud(uid: string): Promise<void> {
  return cloudSessions
    .list(uid)
    .then((list) => {
      write(sessionsKey(uid), list);
      emitSessionsChange();
    })
    .catch(() => {
      // ignore — local cache continues working offline
    });
}

export const db = {
  courses: {
    list(): Course[] {
      return read<Course[]>('courses', []);
    },
    get(id: string): Course | undefined {
      return this.list().find((c) => c.id === id);
    },
    upsert(course: Course) {
      const list = this.list();
      const idx = list.findIndex((c) => c.id === course.id);
      if (idx >= 0) list[idx] = course;
      else list.push(course);
      write('courses', list);
    },
    remove(id: string) {
      write(
        'courses',
        this.list().filter((c) => c.id !== id),
      );
      const all = db.questions._raw();
      write(
        'questions',
        all.filter((q) => q.courseId !== id),
      );
    },
  },

  questions: {
    _raw(): Question[] {
      const stored = read<Array<Question & { type?: string }>>('questions', []);
      return stored.map(normalizeQuestion);
    },
    listByCourse(courseId: string): Question[] {
      return this._raw().filter((q) => q.courseId === courseId);
    },
    addMany(qs: Question[]) {
      const all = this._raw();
      write('questions', [...all, ...qs]);
    },
    replaceForCourse(courseId: string, qs: Question[]) {
      const all = this._raw().filter((q) => q.courseId !== courseId);
      write('questions', [...all, ...qs]);
    },
    removeByCourse(courseId: string) {
      const all = this._raw().filter((q) => q.courseId !== courseId);
      write('questions', all);
    },
  },

  sessions: {
    list(userId: string): QuizSession[] {
      const all = read<QuizSession[]>(sessionsKey(userId), []);
      return [...all].sort(
        (a, b) => (b.completedAt ?? b.startedAt) - (a.completedAt ?? a.startedAt),
      );
    },
    get(userId: string, id: string): QuizSession | undefined {
      return this.list(userId).find((s) => s.id === id);
    },
    save(session: QuizSession) {
      const uid = session.userId;
      const key = sessionsKey(uid);
      const all = read<QuizSession[]>(key, []);
      const idx = all.findIndex((s) => s.id === session.id);
      if (idx >= 0) all[idx] = session;
      else all.push(session);
      write(key, all);
      emitSessionsChange();
      void cloudSessions.save(session).catch(() => {
        // best-effort sync; local cache holds the truth offline
      });
    },
  },

  ids: {
    course: () => genId('course'),
    question: () => genId('q'),
    session: () => genId('session'),
    user: () => genId('user'),
  },

  reset() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};
