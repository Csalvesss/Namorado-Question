import type { Course, ImportPayload, ImportQuestion, Question } from '../types';
import { db } from './db';
import hivAids from '../data/seeds/hiv-aids.json';
import insuficienciaCardiaca from '../data/seeds/insuficiencia-cardiaca.json';
import meningites from '../data/seeds/meningites.json';
import hipertensaoArterial from '../data/seeds/hipertensao-arterial.json';
import febreAmarela from '../data/seeds/febre-amarela.json';
import dengue from '../data/seeds/dengue.json';
import chikungunya from '../data/seeds/chikungunya.json';
import zika from '../data/seeds/zika.json';
import oropouche from '../data/seeds/oropouche.json';

const SEEDS: ImportPayload[] = [
  hivAids as ImportPayload,
  insuficienciaCardiaca as ImportPayload,
  meningites as ImportPayload,
  hipertensaoArterial as ImportPayload,
  febreAmarela as ImportPayload,
  dengue as ImportPayload,
  chikungunya as ImportPayload,
  zika as ImportPayload,
  oropouche as ImportPayload,
];

function buildQuestion(q: ImportQuestion, courseId: string, now: number): Question {
  if (q.type === 'ecg') {
    return {
      id: db.ids.question(),
      courseId,
      topic: q.topic,
      type: 'ecg',
      tracingId: q.tracingId,
      context: q.context,
      points: q.points,
      diagnosis: q.diagnosis,
      difficulty: q.difficulty,
      tags: q.tags,
      createdAt: now,
    };
  }
  return {
    id: db.ids.question(),
    courseId,
    topic: q.topic,
    type: 'mc',
    q: q.q,
    options: q.options,
    correct: q.correct,
    expl: q.expl,
    difficulty: q.difficulty,
    tags: q.tags,
    createdAt: now,
  };
}

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

  const questions: Question[] = payload.questions.map((q) => buildQuestion(q, courseId, now));

  db.courses.upsert(course);
  db.questions.addMany(questions);

  return course;
}

export function ensureSeed() {
  const existing = new Set(db.courses.list().map((c) => c.title));
  SEEDS.forEach((seed) => {
    if (!existing.has(seed.title)) {
      importCourse(seed);
    }
  });
}
