import type { Course, ImportPayload, Question } from '../types';
import { db } from './db';
import hivAids from '../data/seeds/hiv-aids.json';
import insuficienciaCardiaca from '../data/seeds/insuficiencia-cardiaca.json';
import meningites from '../data/seeds/meningites.json';
import hipertensaoArterial from '../data/seeds/hipertensao-arterial.json';

const SEEDS: ImportPayload[] = [
  hivAids as ImportPayload,
  insuficienciaCardiaca as ImportPayload,
  meningites as ImportPayload,
  hipertensaoArterial as ImportPayload,
];

const SEED_KEY = 'guava.seedVersion';
const CURRENT_SEED_VERSION = 1;

export function importCourse(payload: ImportPayload, opts: { createdBy?: string } = {}): Course {
  const courseId = db.ids.course();
  const topics = Array.from(new Set(payload.questions.map((q) => q.topic)));
  const now = Date.now();

  const course: Course = {
    id: courseId,
    title: payload.title,
    description: payload.description ?? '',
    topics,
    color: payload.color ?? 'wine',
    icon: payload.icon ?? '📘',
    questionCount: payload.questions.length,
    createdBy: opts.createdBy ?? 'system',
    sharedWith: [],
    createdAt: now,
  };

  const questions: Question[] = payload.questions.map((q) => ({
    id: db.ids.question(),
    courseId,
    topic: q.topic,
    q: q.q,
    options: q.options,
    correct: q.correct,
    expl: q.expl,
    difficulty: q.difficulty,
    tags: q.tags,
    createdAt: now,
  }));

  db.courses.upsert(course);
  db.questions.addMany(questions);

  return course;
}

export function ensureSeed() {
  const current = localStorage.getItem(SEED_KEY);
  if (current && Number(current) >= CURRENT_SEED_VERSION) return;

  if (db.courses.list().length === 0) {
    SEEDS.forEach((seed) => importCourse(seed));
  }

  localStorage.setItem(SEED_KEY, String(CURRENT_SEED_VERSION));
}
