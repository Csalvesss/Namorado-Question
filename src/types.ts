export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'mc' | 'ecg' | 'case' | 'flashcard' | 'match' | 'algorithm';

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
  imageUrl?: string;
  imageCaption?: string;
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
  imageUrl?: string;
  imageCaption?: string;
}

export interface AlgorithmOptionEdge {
  label: string;
  nextId: string;
  expl?: string;
  isPreferred?: boolean;
}

export interface AlgorithmNode {
  id: string;
  prompt?: string;
  question: string;
  options: AlgorithmOptionEdge[];
}

export interface AlgorithmOutcome {
  id: string;
  title: string;
  body: string;
  tone: 'good' | 'neutral' | 'bad';
}

export interface AlgorithmQuestion extends BaseQuestion {
  type: 'algorithm';
  title: string;
  subtitle?: string;
  specialty?: string;
  startNodeId: string;
  nodes: AlgorithmNode[];
  outcomes: AlgorithmOutcome[];
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
  | MatchQuestion
  | AlgorithmQuestion;

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: string[];
  color: string;
  icon: string;
  questionCount: number;
  /** Trilha de estudo. Default 'medicina' pra cursos antigos sem o campo. */
  track?: 'medicina' | 'odonto';
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

/** Uma alternativa exatamente como foi mostrada na prova, com marcação de
 *  qual era a correta e qual a usuária escolheu. */
export interface ReviewOption {
  text: string;
  correct: boolean;
  picked: boolean;
}

/** Um bloco pergunta → alternativas → explicação. Questões objetivas (mc),
 *  ECG e associação têm 1 bloco; casos clínicos têm um bloco por etapa. */
export interface ReviewBlock {
  question: string;
  options: ReviewOption[];
  expl: string;
  answered: boolean;
  right: boolean;
}

/** Retrato fiel de uma questão como foi apresentada, guardado junto da sessão
 *  para reconstruir o gabarito exatamente como a usuária viu — independente de
 *  edição ou remoção posterior da questão no banco. */
export interface SessionReviewItem {
  questionId: string;
  type: QuestionType;
  topic: string;
  isRight: boolean;
  answered: boolean;
  /** contexto clínico opcional (vinheta do caso, contexto do ECG) */
  context?: string;
  /** enunciado principal (pergunta da objetiva, prompt da associação) */
  prompt?: string;
  blocks: ReviewBlock[];
  imageUrl?: string;
  imageCaption?: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  mode: QuizMode;
  questionIds: string[];
  answers: QuizAnswer[];
  /** Retrato fiel das questões para revisão do gabarito. Opcional: sessões
   *  antigas (anteriores a esta feature) não têm e usam reconstrução do banco. */
  review?: SessionReviewItem[];
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
  displayMode: 'namorado' | 'doutora' | 'irmao';
  /** Trilha de estudo. Default `medicina` para usuários existentes sem o campo. */
  track?: 'medicina' | 'odonto';
  dailyGoal?: number;
  partnerName?: string;
  createdAt: number;
  // Ausência de status = usuária antiga (grandfathered, tratada como approved).
  // Novos cadastros nascem 'pending' até admin liberar com código.
  status?: 'pending' | 'approved' | 'blocked';
  // Papel. Default 'user'. 'admin' é fixado por e-mail (ver lib/admin.ts).
  role?: 'user' | 'admin';
  approvedAt?: number;
  approvedBy?: string;
}

export interface AccessGeo {
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  org?: string;
  timezone?: string;
}

export interface SignupRequest {
  id: string;
  uid: string;
  email: string;
  name: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  ip?: string;
  geo?: AccessGeo;
  userAgent?: string;
  approvalCode?: string;
  approvedAt?: number;
  approvedBy?: string;
  deniedAt?: number;
  deniedReason?: string;
}

export interface AccessLog {
  id: string;
  uid: string;
  email: string;
  when: number;
  ip?: string;
  geo?: AccessGeo;
  userAgent?: string;
  // 'pageview' = navegou até uma tela; os demais são eventos de sessão/conta.
  // 'cadastro' é SINTÉTICO: derivado de users.createdAt / signup_requests pra
  // mostrar o histórico de quem entrou antes de existir o log de acesso — nunca
  // é gravado em /access_logs.
  // 'atividade' também é SINTÉTICO: derivado das sessões de estudo da usuária
  // (users/{uid}/sessions*), pra mostrar as datas em que ela usou o app.
  kind: 'signin' | 'signup' | 'session' | 'impersonate' | 'pageview' | 'cadastro' | 'atividade';
  // Rota acessada (ex: '/cursos') — preenchido em kind='pageview'.
  path?: string;
  // Nome amigável da tela (ex: 'Cursos') — preenchido em kind='pageview'.
  screen?: string;
  // Se um admin estava impersonando, uid dele.
  impersonatedBy?: string;
}

export interface Material {
  id: string;
  ownerUid: string;
  name: string;
  storagePath: string;
  size: number;
  contentType: string;
  uploadedAt: number;
  uploadedBy: string;
  notes?: string;
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
  imageUrl?: string;
  imageCaption?: string;
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
  imageUrl?: string;
  imageCaption?: string;
  difficulty?: Difficulty;
  tags?: string[];
}

export interface ImportAlgorithmQuestion {
  type: 'algorithm';
  topic: string;
  title: string;
  subtitle?: string;
  specialty?: string;
  startNodeId: string;
  nodes: AlgorithmNode[];
  outcomes: AlgorithmOutcome[];
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
  | ImportMatchQuestion
  | ImportAlgorithmQuestion;

export interface ImportPayload {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  /** Trilha do curso. Default 'medicina' se omitido. */
  track?: 'medicina' | 'odonto';
  questions: ImportQuestion[];
}

// ============================================================================
// Prova Integrada — avaliação no formato UNINOVE Medicina.
// Banco estático em /src/data/prova-integrada/exam-vN.json.
// Cada questão começa em status='draft' e precisa ser marcada 'validated' pelo
// prof sênior antes de aparecer pras alunas. A validação fica em Firestore
// (/exam_validations/{questionId}) pra ser persistente entre devices.
// ============================================================================

export interface ExamReference {
  /** Ex: "Diretrizes SBD 2024" ou "Goldman-Cecil Medicina" */
  work: string;
  authors?: string;
  edition?: string;
  publisher?: string;
  year?: number;
  chapter?: string;
  /** Origem no material do prof (nome do PDF/aula). */
  sourcePdf?: string;
  professor?: string;
}

export interface ExamRubricItem {
  /** Critério avaliado (1 linha objetiva). */
  criterion: string;
  /** Pontos atribuídos se acertar esse item. */
  points: number;
}

interface ExamBaseQuestion {
  id: string;
  /** Disciplinas integradas nesta questão (ex: ['endocrinologia', 'infectologia']). */
  disciplines: string[];
  /** Origem do conteúdo: sem1 (Drive), sem2 (app), ou mixed (integra os dois). */
  semester: 'sem1' | 'sem2' | 'mixed';
  /** Status de validação pelo prof sênior. */
  status: 'draft' | 'validated' | 'rejected';
  feedback: string;
  justification: string;
  references: ExamReference[];
  /** Marca pendente de revisão. UI pinta em amarelo. */
  needsReview: boolean;
  /** Parecer do agente revisor (prof médico sênior UNINOVE). */
  reviewedBy?: string;
  reviewedAt?: number;
  reviewerVerdict?: 'approved' | 'approved_with_edits' | 'rejected';
  reviewerNotes?: string;
}

export interface ExamMCQuestion extends ExamBaseQuestion {
  kind: 'mc';
  prompt: string;
  options: string[];
  correctIndex: number;
  points: 20;
}

export interface ExamDiscursiveQuestion extends ExamBaseQuestion {
  kind: 'discursive';
  prompt: string;
  /** Resposta-modelo completa, mostrada na correção. */
  expectedAnswer: string;
  /** Itens de rubrica. Soma = points (25). */
  rubric: ExamRubricItem[];
  points: 25;
}

export type ExamQuestion = ExamMCQuestion | ExamDiscursiveQuestion;

export interface ExamLabResult {
  name: string;
  value: string;
  refRange?: string;
  /** true se for valor alterado — pra UI destacar. */
  abnormal?: boolean;
}

export interface ExamCase {
  id: string;
  title: string;
  /** Disciplinas integradas no caso inteiro. */
  disciplines: string[];
  patient: {
    age: number;
    sex: 'F' | 'M';
    context: string;
    complaint: string;
  };
  history: string;
  evolution?: string;
  physicalExam: {
    vitals: string;
    findings: string;
  };
  labs?: ExamLabResult[];
  imaging?: string;
  questions: ExamQuestion[];
  needsReview: boolean;
}

export interface IntegratedExam {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  totalPoints: 1000;
  estimatedMinutes: number;
  cases: ExamCase[];
  /** Texto institucional/legal mostrado na abertura. */
  instructions: string[];
}

export interface ExamAttemptAnswer {
  /** MC: índice escolhido. Discursiva: texto livre. */
  mcSelected?: number;
  discursiveText?: string;
  /** Pra discursiva, itens da rubrica que a aluna se auto-avaliou como tendo acertado. */
  selfAssessedRubric?: number[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examVersion: string;
  startedAt: number;
  completedAt?: number;
  studentName?: string;
  studentRA?: string;
  /** Mapa questionId → resposta. */
  answers: Record<string, ExamAttemptAnswer>;
  /** Pontuação final calculada na correção (0–1000). */
  score?: number;
  /** Tempo total gasto em ms. */
  durationMs?: number;
}

export interface ExamValidation {
  questionId: string;
  examId: string;
  status: 'draft' | 'validated' | 'rejected';
  reviewedBy: string;
  reviewedByName?: string;
  reviewedAt: number;
  notes?: string;
}