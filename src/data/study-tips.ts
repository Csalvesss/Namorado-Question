// Dicas do professor sênior — base de conhecimento para a tela de "Histórico
// de Provas". Cada dica é escrita no tom de um professor experiente que orienta
// COMO estudar/dominar a área e qual a pegadinha mais comum. As dicas de tópico
// (com `topic`) são acionadas quando a aluna erra aquele tópico; as de curso
// (sem `topic`) servem de orientação geral da prova.
//
// Conteúdo autorado por agentes "professor sênior" de medicina e odontologia.

export interface StudyTip {
  track: 'medicina' | 'odonto';
  /** Título exato do curso. Para dica de tópico, o curso a que mais pertence. */
  courseTitle: string;
  /** Tópico exato. Ausente = dica de nível de curso. */
  topic?: string;
  /** Como estudar/dominar + a pegadinha mais comum (1–3 frases). */
  tip: string;
  /** Pérola de alto rendimento, uma linha. */
  pearl?: string;
}

// Preenchido pelos professores sênior (ver MED_STUDY_TIPS / ODONTO_STUDY_TIPS).
import { MED_STUDY_TIPS } from './study-tips-medicina';
import { ODONTO_STUDY_TIPS } from './study-tips-odonto';

export const STUDY_TIPS: StudyTip[] = [...MED_STUDY_TIPS, ...ODONTO_STUDY_TIPS];

export interface SessionTipBundle {
  /** Dicas dos tópicos onde ela errou — mais específicas, prioridade. */
  topicTips: StudyTip[];
  /** Dica geral do curso/prova (quando existe). */
  courseTip: StudyTip | null;
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Resolve as dicas relevantes para uma prova: prioriza tópicos errados, com
 * fallback para a dica de curso. Funciona em qualquer modo (inclusive
 * intercalado, onde só os tópicos batem).
 */
export function tipsForSession(opts: {
  track: 'medicina' | 'odonto';
  courseTitle: string;
  missedTopics: string[];
  max?: number;
}): SessionTipBundle {
  const { track, courseTitle, missedTopics, max = 5 } = opts;
  const pool = STUDY_TIPS.filter((t) => t.track === track);

  const missed = new Set(missedTopics.map(norm));
  const seen = new Set<string>();
  const topicTips: StudyTip[] = [];
  for (const t of pool) {
    if (!t.topic) continue;
    if (!missed.has(norm(t.topic))) continue;
    const key = norm(t.topic);
    if (seen.has(key)) continue;
    seen.add(key);
    topicTips.push(t);
    if (topicTips.length >= max) break;
  }

  const courseTip =
    pool.find((t) => !t.topic && norm(t.courseTitle) === norm(courseTitle)) ?? null;

  return { topicTips, courseTip };
}

/** Dica de um tópico específico (para a "dica do professor" embaixo da questão). */
export function tipForTopic(
  track: 'medicina' | 'odonto',
  topic: string,
): StudyTip | undefined {
  const target = norm(topic);
  return STUDY_TIPS.find((t) => t.track === track && t.topic && norm(t.topic) === target);
}
