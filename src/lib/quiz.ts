import { BookOpenCheck, Flame, Target, Timer, Zap, type LucideIcon } from 'lucide-react';
import type { Question, QuizMode } from '../types';
import { db } from './db';

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface SampleOptions {
  courseId: string;
  count: number;
  topics?: string[];
  mistakeIds?: string[];
}

export function sampleQuestions({ courseId, count, topics, mistakeIds }: SampleOptions): Question[] {
  let pool = db.questions.listByCourse(courseId);
  if (topics && topics.length > 0) {
    pool = pool.filter((q) => topics.includes(q.topic));
  }
  if (mistakeIds && mistakeIds.length > 0) {
    pool = pool.filter((q) => mistakeIds.includes(q.id));
  }
  if (pool.length === 0) return [];

  if (!topics || topics.length === 0) {
    const byTopic = new Map<string, Question[]>();
    pool.forEach((q) => {
      const list = byTopic.get(q.topic) ?? [];
      list.push(q);
      byTopic.set(q.topic, list);
    });
    const topicList = Array.from(byTopic.keys());
    const perTopic = Math.floor(count / topicList.length);
    let remaining = count - perTopic * topicList.length;
    let picked: Question[] = [];
    topicList.forEach((t) => {
      const shuf = shuffle(byTopic.get(t)!);
      const take = perTopic + (remaining > 0 ? 1 : 0);
      if (remaining > 0) remaining--;
      picked = picked.concat(shuf.slice(0, take));
    });
    return shuffle(picked).slice(0, count);
  }

  return shuffle(pool).slice(0, count);
}

export interface PreparedMCQuestion {
  type: 'mc';
  id: string;
  topic: string;
  q: string;
  expl: string;
  options: string[];
  correct: number;
}

export interface PreparedECGQuestion {
  type: 'ecg';
  id: string;
  topic: string;
  tracingId: import('../types').ECGTracingId;
  context?: string;
  points: import('../types').ECGPoint[];
  diagnosis: import('../types').ECGDiagnosis;
}

export interface PreparedCaseQuestion {
  type: 'case';
  id: string;
  topic: string;
  vignette: string;
  steps: import('../types').CaseStep[];
}

export type PreparedQuestion = PreparedMCQuestion | PreparedECGQuestion | PreparedCaseQuestion;

export function prepareQuestion(question: Question): PreparedQuestion {
  if (question.type === 'ecg') {
    return {
      type: 'ecg',
      id: question.id,
      topic: question.topic,
      tracingId: question.tracingId,
      context: question.context,
      points: question.points,
      diagnosis: question.diagnosis,
    };
  }
  if (question.type === 'case') {
    return {
      type: 'case',
      id: question.id,
      topic: question.topic,
      vignette: question.vignette,
      steps: question.steps,
    };
  }
  const tagged = question.options.map((opt, i) => ({ opt, isCorrect: i === question.correct }));
  const shuffled = shuffle(tagged);
  return {
    type: 'mc',
    id: question.id,
    topic: question.topic,
    q: question.q,
    expl: question.expl,
    options: shuffled.map((o) => o.opt),
    correct: shuffled.findIndex((o) => o.isCorrect),
  };
}

export interface ModeConfig {
  count: number;
  label: string;
  Icon: LucideIcon;
  timed: boolean;
  description: string;
}

export function modeConfig(mode: QuizMode): ModeConfig {
  switch (mode) {
    case 'quick':
      return {
        count: 5,
        label: 'Revisão rápida',
        Icon: Zap,
        timed: false,
        description: '5 questões em poucos minutos. Pra estudar nos intervalos.',
      };
    case 'marathon':
      return {
        count: 50,
        label: 'Maratona',
        Icon: Flame,
        timed: false,
        description: '50 questões. Pra um treino longo antes da prova.',
      };
    case 'mistakes':
      return {
        count: 20,
        label: 'Modo erro',
        Icon: Target,
        timed: false,
        description: 'Só as questões que você errou.',
      };
    case 'timed':
      return {
        count: 20,
        label: 'Simulado cronometrado',
        Icon: Timer,
        timed: true,
        description: '20 questões com tempo. Gabarito só ao fim.',
      };
    case 'standard':
    default:
      return {
        count: 20,
        label: 'Prova padrão',
        Icon: BookOpenCheck,
        timed: false,
        description: '20 questões aleatórias, balanceadas por tópico. Gabarito ao fim.',
      };
  }
}

export function getMistakeQuestionIds(userId: string, courseId: string): string[] {
  const sessions = db.sessions.list(userId).filter((s) => s.courseId === courseId && s.completedAt);
  const mistakes = new Map<string, number>();
  sessions.forEach((s) => {
    s.answers.forEach((a) => {
      if (!a.isRight) mistakes.set(a.questionId, (mistakes.get(a.questionId) ?? 0) + 1);
    });
  });
  return Array.from(mistakes.keys());
}
