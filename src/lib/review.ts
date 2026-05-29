import type {
  Question,
  QuizAnswer,
  ReviewBlock,
  ReviewOption,
  SessionReviewItem,
} from '../types';
import type { PreparedQuestion } from './quiz';

/**
 * Estado de uma questão no fim da prova: a versão preparada (com as
 * alternativas JÁ embaralhadas, na ordem em que foram mostradas) somada às
 * escolhas da usuária. É daqui que sai o retrato fiel do gabarito.
 */
export type AnsweredQuestion = PreparedQuestion & {
  selected?: number;
  diagnosisSelected?: number;
  pointAnswers?: Record<string, number>;
  completed?: boolean;
  stepAnswers?: Record<string, number>;
  matchSelections?: Record<string, string>;
};

function mcBlock(
  question: string,
  options: string[],
  correctIdx: number,
  pickedIdx: number | undefined,
  expl: string,
): ReviewBlock {
  const answered = pickedIdx !== undefined && pickedIdx >= 0;
  const opts: ReviewOption[] = options.map((text, i) => ({
    text,
    correct: i === correctIdx,
    picked: answered && i === pickedIdx,
  }));
  return {
    question,
    options: opts,
    expl,
    answered,
    right: answered && pickedIdx === correctIdx,
  };
}

/**
 * Constrói o retrato fiel de UMA questão respondida, preservando a ordem das
 * alternativas como foram mostradas. Self-contained: não depende do banco.
 */
export function buildReviewItem(q: AnsweredQuestion): SessionReviewItem {
  if (q.type === 'mc') {
    const block = mcBlock(q.q, q.options, q.correct, q.selected, q.expl);
    return {
      questionId: q.id,
      type: 'mc',
      topic: q.topic,
      isRight: block.right,
      answered: block.answered,
      prompt: q.q,
      blocks: [block],
      ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}),
      ...(q.imageCaption ? { imageCaption: q.imageCaption } : {}),
    };
  }

  if (q.type === 'ecg') {
    const blocks: ReviewBlock[] = [];
    // Sub-perguntas dos pontos (laudo) primeiro, depois o diagnóstico final.
    for (const p of q.points) {
      blocks.push(
        mcBlock(p.question, p.options, p.correct, q.pointAnswers?.[p.id], p.expl),
      );
    }
    const diag = mcBlock(
      q.diagnosis.question,
      q.diagnosis.options,
      q.diagnosis.correct,
      q.diagnosisSelected,
      q.diagnosis.expl,
    );
    blocks.push(diag);
    return {
      questionId: q.id,
      type: 'ecg',
      topic: q.topic,
      isRight: diag.right, // pontuação do ECG depende do diagnóstico final
      answered: diag.answered,
      prompt: q.diagnosis.question,
      blocks,
      ...(q.context ? { context: q.context } : {}),
    };
  }

  if (q.type === 'case') {
    const blocks = q.steps.map((s) =>
      mcBlock(
        s.prompt ? `${s.prompt}\n\n${s.question}` : s.question,
        s.options,
        s.correct,
        q.stepAnswers?.[s.id],
        s.expl,
      ),
    );
    const last = blocks[blocks.length - 1];
    return {
      questionId: q.id,
      type: 'case',
      topic: q.topic,
      isRight: Boolean(last?.right),
      answered: Boolean(last?.answered),
      context: q.vignette,
      blocks,
    };
  }

  // match — cada par vira uma "alternativa" correta; picked = ela acertou o par
  const sel = q.matchSelections ?? {};
  const answeredCount = q.pairs.filter((p) => sel[p.id] !== undefined).length;
  const options: ReviewOption[] = q.pairs.map((p) => ({
    text: `${p.left} → ${p.right}`,
    correct: true,
    picked: sel[p.id] === p.id,
  }));
  const allRight = q.pairs.every((p) => sel[p.id] === p.id);
  return {
    questionId: q.id,
    type: 'match',
    topic: q.topic,
    isRight: allRight,
    answered: answeredCount === q.pairs.length,
    prompt: q.prompt,
    blocks: [
      {
        question: 'Associações corretas',
        options,
        expl: q.expl ?? '',
        answered: answeredCount > 0,
        right: allRight,
      },
    ],
  };
}

/**
 * Reconstrução de fallback para sessões ANTIGAS (sem `review` salvo). Como o
 * embaralhamento da época foi perdido, não dá para saber qual alternativa exata
 * ela marcou — então mostramos o gabarito na ordem original do banco, marcando
 * a correta e o resultado (certo/errado) que ficou registrado na resposta.
 */
export function reconstructLegacyItem(
  q: Question,
  answer: QuizAnswer | undefined,
): SessionReviewItem {
  const isRight = answer?.isRight ?? false;

  if (q.type === 'mc') {
    const options: ReviewOption[] = q.options.map((text, i) => ({
      text,
      correct: i === q.correct,
      picked: false,
    }));
    return {
      questionId: q.id,
      type: 'mc',
      topic: q.topic,
      isRight,
      answered: answer !== undefined,
      prompt: q.q,
      blocks: [{ question: q.q, options, expl: q.expl, answered: true, right: isRight }],
      imageUrl: q.imageUrl,
      imageCaption: q.imageCaption,
    };
  }

  if (q.type === 'ecg') {
    const d = q.diagnosis;
    const options: ReviewOption[] = d.options.map((text, i) => ({
      text,
      correct: i === d.correct,
      picked: false,
    }));
    return {
      questionId: q.id,
      type: 'ecg',
      topic: q.topic,
      isRight,
      answered: answer !== undefined,
      context: q.context,
      prompt: d.question,
      blocks: [{ question: d.question, options, expl: d.expl, answered: true, right: isRight }],
    };
  }

  if (q.type === 'case') {
    const blocks: ReviewBlock[] = q.steps.map((s) => ({
      question: s.prompt ? `${s.prompt}\n\n${s.question}` : s.question,
      options: s.options.map((text, i) => ({ text, correct: i === s.correct, picked: false })),
      expl: s.expl,
      answered: true,
      right: false,
    }));
    return {
      questionId: q.id,
      type: 'case',
      topic: q.topic,
      isRight,
      answered: answer !== undefined,
      context: q.vignette,
      blocks,
    };
  }

  if (q.type === 'match') {
    const options: ReviewOption[] = q.pairs.map((p) => ({
      text: `${p.left} → ${p.right}`,
      correct: true,
      picked: false,
    }));
    return {
      questionId: q.id,
      type: 'match',
      topic: q.topic,
      isRight,
      answered: answer !== undefined,
      prompt: q.prompt,
      blocks: [{ question: 'Associações corretas', options, expl: q.expl ?? '', answered: true, right: isRight }],
    };
  }

  // flashcard / algorithm — não entram em prova, mas mantemos o type seguro
  return {
    questionId: q.id,
    type: q.type,
    topic: q.topic,
    isRight,
    answered: answer !== undefined,
    blocks: [],
  };
}

/**
 * Devolve os itens de revisão de uma sessão: usa o snapshot fiel quando existe
 * (provas novas) e cai para a reconstrução pelo banco em provas antigas.
 */
export function resolveReviewItems(
  review: SessionReviewItem[] | undefined,
  questionIds: string[],
  answers: QuizAnswer[],
  lookup: (id: string) => Question | undefined,
): { items: SessionReviewItem[]; legacy: boolean } {
  if (review && review.length > 0) {
    return { items: review, legacy: false };
  }
  const answerById = new Map(answers.map((a) => [a.questionId, a]));
  const items: SessionReviewItem[] = [];
  for (const id of questionIds) {
    const q = lookup(id);
    if (!q) continue;
    items.push(reconstructLegacyItem(q, answerById.get(id)));
  }
  return { items, legacy: true };
}
