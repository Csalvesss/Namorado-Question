import { cloudCourses, cloudSessions } from './cloud-db';
import type { Course, Question, QuizSession } from '../types';

const PREFIX = 'guava.';

function normalizeQuestion(q: Question & { type?: string }): Question {
  if (q.type === 'ecg') return q as Question;
  if (q.type === 'case') return q as Question;
  if (q.type === 'flashcard') return q as Question;
  if (q.type === 'match') return q as Question;
  if (q.type === 'algorithm') return q as Question;
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

const sessionsKey = (uid: string, track: 'medicina' | 'odonto') =>
  `sessions.${uid}::${track}`;
const sessionsLegacyKey = (uid: string) => `sessions.${uid}`;

export const SESSIONS_CHANGE_EVENT = 'guava:sessions-change';

function emitSessionsChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SESSIONS_CHANGE_EVENT));
  }
}

export function hydrateSessionsFromCloud(
  uid: string,
  track: 'medicina' | 'odonto' = 'medicina',
): Promise<void> {
  return cloudSessions
    .list(uid, track)
    .then((list) => {
      write(sessionsKey(uid, track), list);
      emitSessionsChange();
    })
    .catch(() => {
      // ignore — local cache continues working offline
    });
}

export const COURSES_CHANGE_EVENT = 'guava:courses-change';

function emitCoursesChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COURSES_CHANGE_EVENT));
  }
}

export function clearUserCustomData(uid: string) {
  const all = read<Course[]>('courses', []);
  const remaining = all.filter((c) => c.createdBy !== uid);
  const removedIds = all.filter((c) => c.createdBy === uid).map((c) => c.id);
  write('courses', remaining);
  if (removedIds.length > 0) {
    const allQs = read<Question[]>('questions', []);
    write('questions', allQs.filter((q) => !removedIds.includes(q.courseId)));
  }
  emitCoursesChange();
}

export async function hydrateCoursesFromCloud(uid: string): Promise<void> {
  try {
    const cloudList = await cloudCourses.list(uid);
    clearUserCustomData(uid);
    const courses = read<Course[]>('courses', []);
    const questions = read<Question[]>('questions', []);
    for (const item of cloudList) {
      const { questions: qs, ...course } = item;
      const idx = courses.findIndex((c) => c.id === course.id);
      if (idx >= 0) courses[idx] = course;
      else courses.push(course);
      for (const q of qs) questions.push(q);
    }
    write('courses', courses);
    write('questions', questions);
    emitCoursesChange();
  } catch {
    // ignore — local cache continues working offline
  }
}

export const db = {
  courses: {
    list(): Course[] {
      return read<Course[]>('courses', []);
    },
    /**
     * Lista cursos de UMA trilha apenas. Cursos antigos sem `track`
     * contam como 'medicina'. Use isto em toda tela que varre vários
     * cursos (intercalado, algoritmos, casos, passa-fácil, erros,
     * revisar) para não vazar matéria entre medicina e odonto.
     */
    listByTrack(track: 'medicina' | 'odonto'): Course[] {
      return this.list().filter((c) => (c.track ?? 'medicina') === track);
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
      emitCoursesChange();
    },
    remove(id: string) {
      const course = this.get(id);
      write(
        'courses',
        this.list().filter((c) => c.id !== id),
      );
      const all = db.questions._raw();
      write(
        'questions',
        all.filter((q) => q.courseId !== id),
      );
      emitCoursesChange();
      if (course && course.createdBy && course.createdBy !== 'system') {
        void cloudCourses.remove(course.createdBy, id).catch(() => {
          // best-effort
        });
      }
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
    /**
     * Lê sessões da trilha. Migração transparente: pra medicina, se a key
     * track-namespaced está vazia mas existe a key antiga (sem track),
     * usa os dados antigos como medicina E persiste na key nova.
     */
    list(userId: string, track: 'medicina' | 'odonto' = 'medicina'): QuizSession[] {
      const newKey = sessionsKey(userId, track);
      let all = read<QuizSession[]>(newKey, []);
      if (all.length === 0 && track === 'medicina') {
        const legacy = read<QuizSession[]>(sessionsLegacyKey(userId), []);
        if (legacy.length > 0) {
          write(newKey, legacy);
          all = legacy;
        }
      }
      return [...all].sort(
        (a, b) => (b.completedAt ?? b.startedAt) - (a.completedAt ?? a.startedAt),
      );
    },
    get(userId: string, id: string, track: 'medicina' | 'odonto' = 'medicina'): QuizSession | undefined {
      return this.list(userId, track).find((s) => s.id === id);
    },
    save(session: QuizSession, track: 'medicina' | 'odonto' = 'medicina') {
      const uid = session.userId;
      const key = sessionsKey(uid, track);
      const all = read<QuizSession[]>(key, []);
      const idx = all.findIndex((s) => s.id === session.id);
      if (idx >= 0) all[idx] = session;
      else all.push(session);
      write(key, all);
      emitSessionsChange();
      void cloudSessions.save(session, track).catch(() => {
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
