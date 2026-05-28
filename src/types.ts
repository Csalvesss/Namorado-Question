export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'mc' | 'ecg' | 'case' | 'flashcard' | 'match';

interface BaseQuestion {
  id: string;
  courseId: string;
  topic: string;
  difficulty?: Difficulty;
  tags?: string[];
  createdAt?: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'mc';
  q: string;
  options: string[];
  correct: number;
  expl: string;
}

export interface ECGPoint {
  id: string;
  label: string;
  hint?: string;
  region?: { x: number; y: number; w: number; h: number };
  question: string;
  options: string[];
  correct: number;
  expl: string;
}

export interface ECGDiagnosis {
  question: string;
  options: string[];
  correct: number;
  expl: string;
}

export type ECGTracingId =
  | 'normal-sinus'
  | 'sinus-brady'
  | 'sinus-tachy'
  | 'af'
  | 'flutter'
  | 'stemi-inferior'
  | 'stemi-anterior'
  | 'lbbb'
  | 'rbbb';

export interface ECGQuestion extends BaseQuestion {
  type: 'ecg';
  tracingId: ECGTracingId;
  context?: string;
  points: ECGPoint[];
  diagnosis: ECGDiagnosis;
}

export interface CaseStep {
  id: string;
  prompt?: string;
  question: string;
  options: string[];
  correct: number;
  expl: string;
}

export interface CaseQuestion extends BaseQuestion {
  type: 'case';
  vignette: string;
  steps: CaseStep[];
  subtitle?: string;
  specialty?: string;
  timeStamp?: string;
  location?: string;
  outcome?: string;
}

export interface FlashcardQuestion extends BaseQuestion {
  type: 'flashcard';
  front: string;
  back: string;
  hint?: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchQuestion extends BaseQuestion {
  type: 'match';
  prompt: string;
  leftLabel?: string;
  rightLabel?: string;
  pairs: MatchPair[];
  expl?: string;
}

export type Question =
  | MultipleChoiceQuestion
  | ECGQuestion
  | CaseQuestion
  | FlashcardQuestion
  | MatchQuestion;

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: string[];
  color: string;
  icon: string;
  questionCount: number;
  createdBy: string;
  sharedWith: string[];
  createdAt: number;
}

export type QuizMode =
  | 'standard'
  | 'quick'
  | 'marathon'
  | 'mistakes'
  | 'timed'
  | 'clinical'
  | 'bilhete'
  | 'interleaved';

export interface QuizAnswer {
  questionId: string;
  selected: number;
  correct: number;
  isRight: boolean;
}

export interface QuizSession {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  mode: QuizMode;
  questionIds: string[];
  answers: QuizAnswer[];
  score: number;
  total: number;
  startedAt: number;
  completedAt: number | null;
  durationMs?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  displayMode: 'namorado' | 'doutora';
  dailyGoal?: number;
  partnerName?: string;
  createdAt: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  professor?: string;
  semester?: string;
  createdAt: number;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClassEvent {
  id: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  location?: string;
  createdAt: number;
}

export interface ExamEvent {
  id: string;
  subjectId: string;
  date: string;
  time?: string;
  label?: string;
  location?: string;
  createdAt: number;
}

export interface ImportMCQuestion {
  type?: 'mc';
  topic: string;
  q: string;
  options: string[];
  correct: number;
  expl: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ImportECGQuestion {
  type: 'ecg';
  topic: string;
  tracingId: ECGTracingId;
  context?: string;
  points: ECGPoint[];
  diagnosis: ECGDiagnosis;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ImportCaseQuestion {
  type: 'case';
  topic: string;
  vignette: string;
  steps: CaseStep[];
  subtitle?: string;
  specialty?: string;
  timeStamp?: string;
  location?: string;
  outcome?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ImportFlashcardQuestion {
  type: 'flashcard';
  topic: string;
  front: string;
  back: string;
  hint?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ImportMatchQuestion {
  type: 'match';
  topic: string;
  prompt: string;
  leftLabel?: string;
  rightLabel?: string;
  pairs: MatchPair[];
  expl?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export type ImportQuestion =
  | ImportMCQuestion
  | ImportECGQuestion
  | ImportCaseQuestion
  | ImportFlashcardQuestion
  | ImportMatchQuestion;

export interface ImportPayload {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  questions: ImportQuestion[];
}
