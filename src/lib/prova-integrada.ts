/**
 * Engine da Prova Integrada — carrega o exam JSON, calcula score sobre 1000,
 * persiste tentativa local (com hidratação opcional no Firestore num próximo passo).
 *
 * Validação por questão fica em Firestore (/exam_validations/{examId_questionId}).
 * O painel admin lê/escreve essas validações via Firestore rules (admin only).
 */

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import examV1 from '../data/prova-integrada/exam-v1.json';
import examV2 from '../data/prova-integrada/exam-v2.json';
import type {
  ExamAttempt,
  ExamAttemptAnswer,
  ExamCase,
  ExamMCQuestion,
  ExamDiscursiveQuestion,
  ExamQuestion,
  ExamValidation,
  IntegratedExam,
} from '../types';

export const CURRENT_EXAM = examV1 as IntegratedExam;

/**
 * Lista de TODAS as provas disponíveis no app. Ordem importa — primeira é o
 * default da tela. Pra adicionar uma nova: importe o JSON acima e empurre aqui.
 */
export const AVAILABLE_EXAMS: IntegratedExam[] = [
  examV1 as IntegratedExam,
  examV2 as IntegratedExam,
];

export function findExamById(id: string): IntegratedExam | undefined {
  return AVAILABLE_EXAMS.find((e) => e.id === id);
}

export function listExamCases(exam: IntegratedExam = CURRENT_EXAM): ExamCase[] {
  return exam.cases;
}

export function countQuestions(exam: IntegratedExam = CURRENT_EXAM): {
  total: number;
  mc: number;
  discursive: number;
  totalPoints: number;
} {
  let mc = 0;
  let discursive = 0;
  let pts = 0;
  for (const c of exam.cases) {
    for (const q of c.questions) {
      if (q.kind === 'mc') mc += 1;
      else discursive += 1;
      pts += q.points;
    }
  }
  return { total: mc + discursive, mc, discursive, totalPoints: pts };
}

/** Conta apenas casos preenchidos (com ≥1 questão) — usado pra cronômetro/relatório. */
export function countReadyCases(exam: IntegratedExam = CURRENT_EXAM): number {
  return exam.cases.filter((c) => c.questions.length > 0).length;
}

// ============================================================================
// Cálculo de score
// ============================================================================

export interface ScoredQuestion {
  question: ExamQuestion;
  earned: number;
  max: number;
  correct: boolean;
}

export function scoreMC(
  question: ExamMCQuestion,
  answer: ExamAttemptAnswer | undefined,
): ScoredQuestion {
  const picked = answer?.mcSelected;
  const correct = picked === question.correctIndex;
  return {
    question,
    earned: correct ? question.points : 0,
    max: question.points,
    correct,
  };
}

/**
 * Discursiva é auto-avaliada via rubrica (selfAssessedRubric = array de índices
 * dos itens que a aluna marcou como acertados). A soma dos points dos itens
 * marcados vira a pontuação. Se não houve auto-avaliação ainda, retorna 0.
 */
export function scoreDiscursive(
  question: ExamDiscursiveQuestion,
  answer: ExamAttemptAnswer | undefined,
): ScoredQuestion {
  const checked = answer?.selfAssessedRubric ?? [];
  let earned = 0;
  for (const idx of checked) {
    const item = question.rubric[idx];
    if (item) earned += item.points;
  }
  // Limite de segurança: não pode passar do total da questão.
  earned = Math.min(earned, question.points);
  return {
    question,
    earned,
    max: question.points,
    correct: earned === question.points,
  };
}

export function scoreQuestion(
  question: ExamQuestion,
  answer: ExamAttemptAnswer | undefined,
): ScoredQuestion {
  return question.kind === 'mc'
    ? scoreMC(question, answer)
    : scoreDiscursive(question, answer);
}

export function scoreAttempt(
  attempt: Pick<ExamAttempt, 'answers'>,
  exam: IntegratedExam = CURRENT_EXAM,
): { totalEarned: number; totalMax: number; perQuestion: ScoredQuestion[] } {
  const perQuestion: ScoredQuestion[] = [];
  let totalEarned = 0;
  let totalMax = 0;
  for (const c of exam.cases) {
    for (const q of c.questions) {
      const sq = scoreQuestion(q, attempt.answers[q.id]);
      perQuestion.push(sq);
      totalEarned += sq.earned;
      totalMax += sq.max;
    }
  }
  return { totalEarned, totalMax, perQuestion };
}

// ============================================================================
// Persistência local da tentativa (rascunho enquanto faz a prova)
// ============================================================================

const ATTEMPT_KEY = 'guava:prova-integrada:attempt';

export function loadAttempt(): ExamAttempt | null {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ExamAttempt;
  } catch {
    return null;
  }
}

export function saveAttempt(attempt: ExamAttempt): void {
  try {
    localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
  } catch {
    // localStorage cheio ou bloqueado — ignorar; o estado em memória ainda vale.
  }
}

export function clearAttempt(): void {
  try {
    localStorage.removeItem(ATTEMPT_KEY);
  } catch {
    /* ignore */
  }
}

export function newAttempt(examId: string, examVersion: string): ExamAttempt {
  return {
    id: `attempt-${Date.now()}`,
    examId,
    examVersion,
    startedAt: Date.now(),
    answers: {},
  };
}

// ============================================================================
// Validação (admin / prof sênior)
// ============================================================================

/** Doc ID consistente: examId__questionId — facilita query e idempotência. */
function validationDocId(examId: string, questionId: string): string {
  return `${examId}__${questionId}`;
}

export async function loadValidations(examId: string): Promise<Map<string, ExamValidation>> {
  const snap = await getDocs(collection(firestore, 'exam_validations'));
  const map = new Map<string, ExamValidation>();
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    if (data.examId !== examId) return;
    map.set(data.questionId as string, {
      questionId: data.questionId as string,
      examId: data.examId as string,
      status: (data.status as ExamValidation['status']) ?? 'draft',
      reviewedBy: (data.reviewedBy as string) ?? '',
      reviewedByName: data.reviewedByName as string | undefined,
      reviewedAt: typeof data.reviewedAt === 'number' ? data.reviewedAt : 0,
      notes: data.notes as string | undefined,
    });
  });
  return map;
}

export async function saveValidation(input: {
  examId: string;
  questionId: string;
  status: 'validated' | 'rejected';
  reviewedBy: string;
  reviewedByName?: string;
  notes?: string;
}): Promise<void> {
  await setDoc(
    doc(firestore, 'exam_validations', validationDocId(input.examId, input.questionId)),
    {
      examId: input.examId,
      questionId: input.questionId,
      status: input.status,
      reviewedBy: input.reviewedBy,
      reviewedByName: input.reviewedByName ?? null,
      notes: input.notes ?? null,
      reviewedAt: Date.now(),
      reviewedAtServer: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Determina o status EFETIVO de uma questão: se houve validação salva, ela
 * sobrescreve o status do JSON. Senão, usa o status do JSON ('draft' por padrão).
 */
export function effectiveQuestionStatus(
  question: ExamQuestion,
  validations: Map<string, ExamValidation>,
): 'draft' | 'validated' | 'rejected' {
  const v = validations.get(question.id);
  return v?.status ?? question.status;
}

/** Conta quantas questões já foram validadas pelo prof. */
export function countValidated(
  exam: IntegratedExam,
  validations: Map<string, ExamValidation>,
): { validated: number; rejected: number; pending: number; total: number } {
  let validated = 0;
  let rejected = 0;
  let pending = 0;
  let total = 0;
  for (const c of exam.cases) {
    for (const q of c.questions) {
      total += 1;
      const s = effectiveQuestionStatus(q, validations);
      if (s === 'validated') validated += 1;
      else if (s === 'rejected') rejected += 1;
      else pending += 1;
    }
  }
  return { validated, rejected, pending, total };
}

/** True se TODAS as questões existentes estão validadas. */
export function isExamFullyValidated(
  exam: IntegratedExam,
  validations: Map<string, ExamValidation>,
): boolean {
  const c = countValidated(exam, validations);
  return c.total > 0 && c.validated === c.total;
}