// Contrato de tipos da Agenda — usado pelo storage, engine do assistente,
// timeline, editor e sistema de notificações. Tudo que cruza módulos vive aqui.
//
// Decisões de design:
// - Subject/ClassEvent/ExamEvent permanecem em src/types.ts (backward compat).
// - TaskEvent é uma atividade one-shot livre (estágio, plantão, palestra, social).
// - AgendaOccurrence é o view-model unificado consumido pela UI e pelo assistente:
//   uma "ocorrência" concreta de qualquer evento num dia específico, com horário
//   absoluto resolvido.
// - O assistente é determinístico: emite insights com `code` + `params`. A
//   tradução para texto (e a variação por displayMode) acontece numa camada de
//   copy separada (data/assistant-copy.ts).

import type { DayOfWeek } from '../types';

// =============================================================================
// 1) Storage — TaskEvent
// =============================================================================

export type TaskCategory =
  | 'estagio'
  | 'plantao'
  | 'palestra'
  | 'reuniao'
  | 'social'
  | 'pessoal'
  | 'outro';

export const TASK_CATEGORY_LABEL: Record<TaskCategory, string> = {
  estagio: 'estágio',
  plantao: 'plantão',
  palestra: 'palestra / aula extra',
  reuniao: 'reunião',
  social: 'social',
  pessoal: 'pessoal',
  outro: 'outro',
};

/** Cor padrão por categoria, usada quando a atividade não está vinculada a
 *  uma disciplina (sem subjectId). Mantém-se na paleta editorial. */
export const TASK_CATEGORY_COLOR: Record<TaskCategory, string> = {
  estagio: '#7C2D3A', // wine
  plantao: '#C97064', // rose
  palestra: '#B8895F', // gold
  reuniao: '#5B6E59', // sage
  social: '#8B5A8C', // violet
  pessoal: '#5C7E97', // blue
  outro: '#6E5B7E',
};

export interface TaskEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  location?: string;
  description?: string;
  category: TaskCategory;
  /** opcional — pode estar relacionada a uma disciplina */
  subjectId?: string;
  /** opcional — sobrescreve a cor herdada de disciplina/categoria */
  color?: string;
  /** minutos antes do início para notificar; ausente = sem lembrete */
  reminderMinutes?: number;
  createdAt: number;
}

// =============================================================================
// 2) View-model — AgendaOccurrence
// =============================================================================

export type EventKind = 'class' | 'exam' | 'task';

export interface AgendaOccurrence {
  /** chave única dessa ocorrência (estável: sourceId + date) */
  occurrenceId: string;
  sourceId: string;
  kind: EventKind;
  title: string;
  subjectId?: string;
  subjectName?: string;
  /** cor do chip (herda subject → category → wine padrão) */
  color: string;
  /** data ISO da ocorrência (YYYY-MM-DD) */
  date: string;
  /** Date.getTime() ms — undefined se evento não tem horário definido */
  startMs?: number;
  endMs?: number;
  /** "HH:MM" para exibição */
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  category?: TaskCategory;
  reminderMinutes?: number;
  /** rótulo "P1", "Final" etc — só para provas */
  examLabel?: string;
  /** dia da semana 0..6 (preenchido em ClassEvent) */
  dayOfWeek?: DayOfWeek;
}

// =============================================================================
// 3) Education Assistant — Insight catalogue
// =============================================================================
//
// A engine de insights emite objetos tipados com `code` e `params`. A camada de
// copy traduz cada (code, displayMode) num texto. Mantém engine sem strings.

export type AssistantSeverity = 'urgent' | 'info' | 'positive' | 'tip';

export type InsightCode =
  /** próximo evento começa em ≤ 60 min */
  | 'starting-soon'
  /** prova em ≤ 48h sem revisão na agenda */
  | 'exam-imminent'
  /** N provas em ≤ 7 dias (N>=2) */
  | 'exam-week-heavy'
  /** prova em 3–14 dias */
  | 'exam-upcoming'
  /** conflito de horário entre 2 ocorrências */
  | 'conflict'
  /** hoje tem ≥ 5h de eventos cravados */
  | 'heavy-day'
  /** hoje está livre */
  | 'free-day'
  /** janela livre ≥ 2h hoje/amanhã */
  | 'free-block'
  /** dica geral: sem prova marcada para 30+ dias */
  | 'tip-no-exams'
  /** dica geral: 0 disciplinas cadastradas */
  | 'tip-empty-plan'
  /** dica geral: blocos muito longos sem pausa */
  | 'tip-long-block'
  /** dica geral: lembretes desabilitados */
  | 'tip-enable-reminders';

export interface AssistantInsight {
  id: string;
  code: InsightCode;
  severity: AssistantSeverity;
  /** parâmetros estruturados consumidos pela camada de copy */
  params: Record<string, string | number | undefined>;
  /** opcional: occurrenceId associada (pra ação de clique) */
  occurrenceId?: string;
}

export interface AssistantSummary {
  /** próxima ocorrência com horário definido (a partir de agora) */
  next?: AgendaOccurrence;
  /** ocorrências de hoje, ordenadas por hora (eventos sem horário no fim) */
  today: AgendaOccurrence[];
  /** ocorrências de amanhã */
  tomorrow: AgendaOccurrence[];
  /** próximas provas (≤ 30 dias), ordenadas por proximidade */
  upcomingExams: AgendaOccurrence[];
  /** insights priorizados (urgent → info → positive → tip) */
  insights: AssistantInsight[];
}

// =============================================================================
// 4) Notifications
// =============================================================================

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface ScheduledReminder {
  occurrenceId: string;
  fireAt: number; // ms epoch
  title: string;
  body: string;
}
