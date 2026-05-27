import type { Course, Question, QuizSession, UserProfile } from '../types';

const PREFIX = 'guava.';

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

export const db = {
  user: {
    get(): UserProfile | null {
      return read<UserProfile | null>('user', null);
    },
    save(user: UserProfile) {
      write('user', user);
    },
    clear() {
      localStorage.removeItem(PREFIX + 'user');
    },
  },

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
      return read<Question[]>('questions', []);
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
    list(userId?: string): QuizSession[] {
      const all = read<QuizSession[]>('sessions', []);
      const sorted = [...all].sort((a, b) => (b.completedAt ?? b.startedAt) - (a.completedAt ?? a.startedAt));
      return userId ? sorted.filter((s) => s.userId === userId) : sorted;
    },
    get(id: string): QuizSession | undefined {
      return this.list().find((s) => s.id === id);
    },
    save(session: QuizSession) {
      const all = read<QuizSession[]>('sessions', []);
      const idx = all.findIndex((s) => s.id === session.id);
      if (idx >= 0) all[idx] = session;
      else all.push(session);
      write('sessions', all);
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
