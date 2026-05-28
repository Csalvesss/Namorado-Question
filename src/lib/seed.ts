import type { Course, ImportPayload, ImportQuestion, Question } from '../types';
import { cloudCourses } from './cloud-db';
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
import eletroBasico from '../data/seeds/eletro-basico.json';
import casosClinicos from '../data/seeds/casos-clinicos.json';
import casosImersivos from '../data/seeds/casos-imersivos.json';
import farmacoMatch from '../data/seeds/farmaco-match.json';
import algoritmosClinicos from '../data/seeds/algoritmos-clinicos.json';
import farmacoP2Antidiabeticos from '../data/seeds/farmaco-p2-antidiabeticos.json';
import farmacoP2CardioHas from '../data/seeds/farmaco-p2-cardio-has.json';
import flashcardsAntibioticos from '../data/seeds/flashcards-antibioticos.json';
import flashcardsHivAids from '../data/seeds/flashcards-hiv-aids.json';
import flashcardsIc from '../data/seeds/flashcards-insuficiencia-cardiaca.json';
import flashcardsMeningites from '../data/seeds/flashcards-meningites.json';

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
  eletroBasico as ImportPayload,
  casosClinicos as ImportPayload,
  casosImersivos as ImportPayload,
  farmacoMatch as ImportPayload,
  algoritmosClinicos as ImportPayload,
  farmacoP2Antidiabeticos as ImportPayload,
  farmacoP2CardioHas as ImportPayload,
  flashcardsAntibioticos as ImportPayload,
  flashcardsHivAids as ImportPayload,
  flashcardsIc as ImportPayload,
  flashcardsMeningites as ImportPayload,
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
  if (q.type === 'case') {
    return {
      id: db.ids.question(),
      courseId,
      topic: q.topic,
      type: 'case',
      vignette: q.vignette,
      steps: q.steps,
      subtitle: q.subtitle,
      specialty: q.specialty,
      timeStamp: q.timeStamp,
      location: q.location,
      outcome: q.outcome,
      imageUrl: q.imageUrl,
      imageCaption: q.imageCaption,
      difficulty: q.difficulty,
      tags: q.tags,
      createdAt: now,
    };
  }
  if (q.type === 'algorithm') {
    return {
      id: db.ids.question(),
      courseId,
      topic: q.topic,
      type: 'algorithm',
      title: q.title,
      subtitle: q.subtitle,
      specialty: q.specialty,
      startNodeId: q.startNodeId,
      nodes: q.nodes,
      outcomes: q.outcomes,
      difficulty: q.difficulty,
      tags: q.tags,
      createdAt: now,
    };
  }
  if (q.type === 'flashcard') {
    return {
      id: db.ids.question(),
      courseId,
      topic: q.topic,
      type: 'flashcard',
      front: q.front,
      back: q.back,
      hint: q.hint,
      difficulty: q.difficulty,
      tags: q.tags,
      createdAt: now,
    };
  }
  if (q.type === 'match') {
    return {
      id: db.ids.question(),
      courseId,
      topic: q.topic,
      type: 'match',
      prompt: q.prompt,
      leftLabel: q.leftLabel,
      rightLabel: q.rightLabel,
      pairs: q.pairs,
      expl: q.expl,
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
    imageUrl: q.imageUrl,
    imageCaption: q.imageCaption,
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
    icon: payload.icon ?? '',
    questionCount: payload.questions.length,
    createdBy: opts.createdBy ?? 'system',
    sharedWith: [],
    createdAt: now,
  };

  const questions: Question[] = payload.questions.map((q) => buildQuestion(q, courseId, now));

  db.courses.upsert(course);
  db.questions.addMany(questions);

  if (course.createdBy && course.createdBy !== 'system') {
    void cloudCourses.save(course.createdBy, course, questions).catch(() => {
      // best-effort sync; local cache holds the truth
    });
  }

  return course;
}

const SEED_VERSION_KEY = 'guava.seedVersion';
const SEED_VERSION = 6;

export function ensureSeed() {
  const storedVersion = Number(localStorage.getItem(SEED_VERSION_KEY) ?? '0');
  const needsRefresh = storedVersion < SEED_VERSION;

  if (needsRefresh) {
    const systemCourses = db.courses.list().filter((c) => c.createdBy === 'system');
    systemCourses.forEach((c) => db.courses.remove(c.id));
    SEEDS.forEach((seed) => importCourse(seed));
    localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
    return;
  }

  const existing = new Set(db.courses.list().map((c) => c.title));
  SEEDS.forEach((seed) => {
    if (!existing.has(seed.title)) {
      importCourse(seed);
    }
  });
}
