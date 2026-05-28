import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Target, X } from 'lucide-react';
import { db } from '../lib/db';
import {
  MISTAKES_CHANGE_EVENT,
  MISTAKE_TAG_HINTS,
  MISTAKE_TAG_LABELS,
  getMistakeNote,
  setMistakeNote,
  setMistakeTag,
  statsForQuestions,
  type MistakeTag,
} from '../lib/mistakes';
import { useSessions } from '../lib/useSessions';
import { useUser } from '../lib/useUser';
import type { Question } from '../types';

const TAGS: MistakeTag[] = ['nao-sabia', 'leu-errado', 'confundiu', 'distracao', 'fraco-tema'];

interface MistakeRow {
  question: Question;
  courseTitle: string;
  wrongCount: number;
  total: number;
  lastWrongAt: number;
  lastSelected: number;
}

export default function Mistakes() {
  const { user } = useUser();
  const { sessions } = useSessions();
  const [, setTick] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<MistakeTag | 'all' | 'untagged'>('all');

  useEffect(() => {
    function bump() { setTick((t) => t + 1); }
    window.addEventListener(MISTAKES_CHANGE_EVENT, bump);
    return () => window.removeEventListener(MISTAKES_CHANGE_EVENT, bump);
  }, []);

  const rows = useMemo<MistakeRow[]>(() => {
    if (!user) return [];
    const acc = new Map<string, { wrong: number; total: number; lastWrongAt: number; lastSelected: number }>();
    sessions
      .filter((s) => s.userId === user.uid && s.completedAt)
      .forEach((s) => {
        s.answers.forEach((a) => {
          const cur = acc.get(a.questionId) ?? { wrong: 0, total: 0, lastWrongAt: 0, lastSelected: -1 };
          cur.total += 1;
          if (!a.isRight) {
            cur.wrong += 1;
            cur.lastWrongAt = Math.max(cur.lastWrongAt, s.completedAt ?? 0);
            cur.lastSelected = a.selected;
          }
          acc.set(a.questionId, cur);
        });
      });

    const courses = db.courses.list();
    const courseTitleById = new Map<string, string>();
    courses.forEach((c) => courseTitleById.set(c.id, c.title));

    const out: MistakeRow[] = [];
    acc.forEach((stat, qid) => {
      if (stat.wrong === 0) return;
      const question = findQuestionById(qid);
      if (!question) return;
      out.push({
        question,
        courseTitle: courseTitleById.get(question.courseId) ?? '·',
        wrongCount: stat.wrong,
        total: stat.total,
        lastWrongAt: stat.lastWrongAt,
        lastSelected: stat.lastSelected,
      });
    });
    return out.sort((a, b) => b.lastWrongAt - a.lastWrongAt);
  }, [sessions, user]);

  const stats = useMemo(() => {
    if (!user) return null;
    return statsForQuestions(user.uid, rows.map((r) => r.question.id));
  }, [user, rows]);

  const filtered = useMemo(() => {
    if (!user) return rows;
    if (filterTag === 'all') return rows;
    return rows.filter((r) => {
      const note = getMistakeNote(user.uid, r.question.id);
      if (filterTag === 'untagged') return !note?.tag;
      return note?.tag === filterTag;
    });
  }, [rows, filterTag, user]);

  if (!user) return null;

  return (
    <div className="space-y-10">
      <section>
        <div className="eyebrow-gold">caderno de erros</div>
        <h1 className="mt-3 font-serif italic leading-[1.05] text-wine-deep">
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">onde você</span>{' '}
          <span className="text-[clamp(1.75rem,4vw,2.75rem)] text-rose">tropeçou</span>
          <span className="text-[clamp(1.75rem,4vw,2.75rem)]">.</span>
        </h1>
        <p className="mt-3 max-w-xl font-serif text-base italic leading-relaxed text-ink-soft sm:text-lg">
          ao classificar o tipo do erro, você reduz a chance de repeti-lo. é o jeito mais rápido de aprender com a própria prova.
        </p>
      </section>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-8 text-center font-serif text-base italic text-ink-soft">
          nenhum erro registrado ainda. faça algumas provas e os erros aparecem aqui.
        </p>
      ) : (
        <>
          <section className="rounded-2xl border border-line bg-paper-soft px-5 py-5 shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.22em] text-gold">resumo</div>
                <h2 className="mt-1 font-serif text-2xl italic text-wine-deep">
                  {rows.length} questões erradas
                </h2>
              </div>
              {stats && stats.untagged > 0 && (
                <div className="text-[11px] uppercase tracking-wider text-muted">
                  {stats.untagged} ainda sem classificação
                </div>
              )}
            </div>
            {stats && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {TAGS.map((tag) => (
                  <div key={tag} className="rounded-xl border border-line bg-paper px-3 py-3">
                    <div className="font-serif text-2xl font-semibold leading-none text-wine-deep">
                      {stats.byTag[tag]}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                      {MISTAKE_TAG_LABELS[tag]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-2">
            <FilterPill active={filterTag === 'all'} onClick={() => setFilterTag('all')}>todos</FilterPill>
            <FilterPill active={filterTag === 'untagged'} onClick={() => setFilterTag('untagged')}>
              sem tag
            </FilterPill>
            {TAGS.map((tag) => (
              <FilterPill key={tag} active={filterTag === tag} onClick={() => setFilterTag(tag)}>
                {MISTAKE_TAG_LABELS[tag]}
              </FilterPill>
            ))}
          </div>

          <ul className="space-y-3">
            {filtered.map((row) => {
              const isOpen = openId === row.question.id;
              const note = getMistakeNote(user.uid, row.question.id);
              return (
                <li key={row.question.id} className="rounded-2xl border border-line bg-paper shadow-soft">
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : row.question.id)}
                    className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-paper-soft"
                  >
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-soft text-red"
                    >
                      <Target className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2 text-[11px] uppercase tracking-wider text-muted">
                        <span>{row.question.topic}</span>
                        <span>·</span>
                        <span>{row.courseTitle}</span>
                        {row.wrongCount > 1 && (
                          <span className="rounded-full bg-red-soft px-2 py-0.5 text-red">
                            {row.wrongCount}× errada
                          </span>
                        )}
                        {note?.tag && (
                          <span className="rounded-full bg-rose-soft px-2 py-0.5 text-wine-deep">
                            {MISTAKE_TAG_LABELS[note.tag]}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-2 font-serif text-base italic leading-snug text-wine-deep">
                        {questionTitle(row.question)}
                      </p>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    ) : (
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" strokeWidth={1.75} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-line bg-paper-soft px-5 py-5">
                      <QuestionDetail
                        row={row}
                        uid={user.uid}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line bg-paper-soft px-5 py-6 text-center font-serif text-base italic text-ink-soft">
              nenhum erro com esse filtro.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-wider transition ${
        active
          ? 'border-wine bg-wine text-white'
          : 'border-line bg-paper text-ink-soft hover:bg-paper-soft'
      }`}
    >
      {children}
    </button>
  );
}

function QuestionDetail({ row, uid }: { row: MistakeRow; uid: string }) {
  const [note, setNote] = useState(() => getMistakeNote(uid, row.question.id)?.note ?? '');
  const currentTag = getMistakeNote(uid, row.question.id)?.tag;

  function selectTag(tag: MistakeTag) {
    setMistakeTag(uid, row.question.id, currentTag === tag ? null : tag);
  }

  function commitNote() {
    setMistakeNote(uid, row.question.id, note);
  }

  return (
    <div className="space-y-4">
      <QuestionBody question={row.question} selected={row.lastSelected} />

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-gold">como classificar esse erro</div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => selectTag(tag)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider transition ${
                currentTag === tag
                  ? 'border-wine bg-wine text-white'
                  : 'border-line bg-paper text-ink-soft hover:bg-paper-soft'
              }`}
            >
              {MISTAKE_TAG_LABELS[tag]}
              {currentTag === tag && <X className="h-3 w-3" strokeWidth={2} />}
            </button>
          ))}
        </div>
        {currentTag && (
          <p className="mt-2 text-xs italic text-ink-soft">{MISTAKE_TAG_HINTS[currentTag]}</p>
        )}
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-wider text-gold">anotação pessoal</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={commitNote}
          rows={3}
          placeholder="o que você quer lembrar quando reencontrar essa questão?"
          className="input-elegant"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted">
        <span>
          última vez errada: {new Date(row.lastWrongAt).toLocaleDateString('pt-BR')}
        </span>
        <Link
          to={`/curso/${row.question.courseId}`}
          className="text-wine transition hover:text-wine-deep"
        >
          ir ao curso →
        </Link>
      </div>
    </div>
  );
}

function QuestionBody({ question, selected }: { question: Question; selected: number }) {
  if (question.type === 'mc') {
    return (
      <div className="rounded-xl border border-line bg-paper px-4 py-3">
        <p className="font-serif text-base italic text-wine-deep">{question.q}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {question.options.map((opt, i) => {
            const isCorrect = i === question.correct;
            const wasYours = i === selected;
            return (
              <li
                key={i}
                className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                  isCorrect ? 'border-green bg-green-soft' : wasYours ? 'border-red bg-red-soft' : 'border-line bg-paper'
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isCorrect ? 'bg-green text-white' : wasYours ? 'bg-red text-white' : 'bg-paper-soft text-muted'
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className={isCorrect ? 'text-green' : wasYours ? 'text-red' : 'text-ink-soft'}>{opt}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 rounded-lg bg-paper-soft px-3 py-2 text-sm italic leading-relaxed text-ink-soft">
          {question.expl}
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-line bg-paper px-4 py-3 text-sm italic text-ink-soft">
      {questionTitle(question)}
    </div>
  );
}

function questionTitle(question: Question): string {
  if (question.type === 'mc') return question.q;
  if (question.type === 'case') return question.vignette.split('\n')[0];
  if (question.type === 'ecg') return question.diagnosis.question;
  if (question.type === 'flashcard') return question.front;
  return question.prompt;
}

function findQuestionById(id: string): Question | null {
  const courses = db.courses.list();
  for (const c of courses) {
    const found = db.questions.listByCourse(c.id).find((q) => q.id === id);
    if (found) return found;
  }
  return null;
}
