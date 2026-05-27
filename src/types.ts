export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  courseId: string;
  topic: string;
  q: string;
  options: string[];
  correct: number;
  expl: string;
  difficulty?: Difficulty;
  tags?: string[];
  createdAt?: number;
}

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

export type QuizMode = 'standard' | 'quick' | 'marathon' | 'mistakes' | 'timed';

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
  createdAt: number;
}

export interface ImportPayload {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  questions: Array<{
    topic: string;
    q: string;
    options: string[];
    correct: number;
    expl: string;
    difficulty?: Difficulty;
    tags?: string[];
  }>;
}
